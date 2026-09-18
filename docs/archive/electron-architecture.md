# pi-desktop First-Release Electron Architecture (Single-Active-Runtime Proposal)

English | [中文](electron-architecture.zh.md)

- Type: Architecture
- Status: Superseded
- Created: 2026-09-17
- Superseded: 2026-09-18
- Original phase: First usable release
- Original authority: first-release Electron architecture proposal under a single active working directory and single active runtime
- Superseded by: [`../architecture/electron-architecture.md`](../architecture/electron-architecture.md)
- Archive index: [`README.md`](README.md)
- Related research: [Desktop Framework and TypeScript Build Options Research](../desktop-framework-options.md)
- Review method: [Software Architecture Review Guide](../architecture-review-guide.md)
- Original module breakdown: [First-Release Module Structure](module-structure.md) (archived)

> This document is a complete historical proposal that no longer participates in implementation decisions. For the current architecture, read [`../architecture/electron-architecture.md`](../architecture/electron-architecture.md). The "current recommendations," "pending decisions," and module responsibilities below represent only the single-runtime proposal at that time.

## 1. Architecture goals

The first release focuses on solving the following problems:

1. Reuse the `@earendil-works/pi-coding-agent` SDK directly without reimplementing pi's agent loop, providers, tools, compaction, or session management logic;
2. Isolate the high-privilege pi runtime from the renderer; the renderer must not receive Node.js, shell, arbitrary file access, or provider credentials directly;
3. Handle streaming messages, tool calls, queues, abort, retry, compaction, and session replacement correctly;
4. Remain compatible with the user's existing `~/.pi/agent` configuration, authentication, resources, and sessions;
5. Establish testable, auditable, serializable typed IPC;
6. Preserve the option to move the pi runtime to a separate process in the future, without implementing two runtime backends upfront for undecided requirements;
7. Establish a repeatable Linux development, test, and packaging workflow.

## 2. Overall architecture

```text
┌──────────────────────────────────────────────────────┐
│ Electron renderer                                    │
│                                                      │
│ React UI                                             │
│ ├── Conversation UI                                  │
│ ├── Tool activity UI                                 │
│ ├── Composer                                         │
│ ├── Session/project navigation                       │
│ └── Renderer domain store                            │
│                                                      │
│ No Node.js, shell, arbitrary file access, or         │
│ provider credentials                                 │
└────────────────────────┬─────────────────────────────┘
                         │
                         │ Typed narrow interface exposed by preload
                         │ command / result / event
                         ▼
┌──────────────────────────────────────────────────────┐
│ Electron main process / Desktop host                 │
│                                                      │
│ ├── IPC Router                                       │
│ ├── Runtime Controller                               │
│ ├── Pi Adapter                                       │
│ ├── Project Trust Coordinator                        │
│ ├── Credential Coordinator                           │
│ ├── Attachment Service                               │
│ ├── Window / Navigation Policy                       │
│ └── Application lifecycle                            │
└────────────────────────┬─────────────────────────────┘
                         │
                         │ Official Node.js SDK
                         ▼
┌──────────────────────────────────────────────────────┐
│ @earendil-works/pi-coding-agent                      │
│                                                      │
│ ├── AgentSessionRuntime                              │
│ ├── AgentSession                                     │
│ ├── ModelRuntime                                     │
│ ├── SessionManager                                   │
│ ├── SettingsManager                                  │
│ ├── ResourceLoader                                   │
│ └── Extensions / tools / skills / prompts            │
└──────────────────────────────────────────────────────┘
```

## 3. Process and module boundaries

### 3.1 Renderer

The renderer is responsible only for:

- React views;
- User input;
- Display of messages, thinking content, and tool activity;
- Short-lived UI state;
- Invoking commands exposed by preload;
- Consuming domain events sent by the host.

The renderer must not:

- Import the pi SDK;
- Import Electron's `ipcRenderer`;
- Use Node.js APIs;
- Execute shell commands;
- Read or write files arbitrarily;
- Read `~/.pi/agent/auth.json`;
- Store API keys or OAuth tokens;
- Hold SDK instances such as `AgentSession` or `ModelRuntime`;
- Write full prompts, file contents, or credentials to browser storage.

By default, do not use `localStorage` for application data. Non-sensitive UI preferences that need persistence are written through host APIs into Electron `userData`.

### 3.2 Preload

Preload is the only bridge between the renderer and the main process. It is responsible for:

- Exposing a narrow interface with `contextBridge.exposeInMainWorld()`;
- Calling explicitly named IPC channels;
- Subscribing to explicitly named domain events;
- Providing TypeScript types to the renderer;
- Removing listeners on unsubscribe.

Preload must not expose:

- Raw `ipcRenderer`;
- Arbitrary channel names;
- Generic interfaces such as `send(channel, payload)`;
- Generic interfaces such as `invoke(channel, payload)`;
- Node.js `process`, `fs`, or `child_process`;
- The full Electron API.

Recommended renderer API organization by use case:

```typescript
interface PiDesktopApi {
  workspace: {
    choose(): Promise<CommandResult<WorkspaceSnapshot | null>>;
    open(input: OpenWorkspaceInput): Promise<CommandResult<WorkspaceSnapshot>>;
  };

  session: {
    list(): Promise<CommandResult<SessionSummary[]>>;
    create(): Promise<CommandResult<SessionSnapshot>>;
    switch(input: SwitchSessionInput): Promise<CommandResult<SessionSnapshot>>;
    fork(input: ForkSessionInput): Promise<CommandResult<SessionSnapshot>>;
  };

  agent: {
    prompt(input: PromptInput): Promise<CommandResult<PromptAcceptance>>;
    steer(input: QueueMessageInput): Promise<CommandResult<void>>;
    followUp(input: QueueMessageInput): Promise<CommandResult<void>>;
    abort(): Promise<CommandResult<void>>;
  };

  runtime: {
    getSnapshot(): Promise<CommandResult<RuntimeSnapshot>>;
    subscribe(listener: (event: DesktopEventEnvelope) => void): () => void;
  };
}
```

The interfaces above illustrate boundaries only; final names follow the domain model chosen at implementation time.

### 3.3 Electron main process

The main process is the only high-privilege application layer. It is responsible for:

- Window and application lifecycle;
- Pi runtime lifecycle;
- IPC input validation;
- Working directory selection;
- Project trust;
- Credential operations;
- Image attachment reading;
- External link and navigation policy;
- Session replacement;
- Application exit cleanup;
- Error redaction and diagnostics.

## 4. Main process core modules

### 4.1 `RuntimeController`

`RuntimeController` is the sole owner of the active runtime. It is responsible for:

- Creating `AgentSessionRuntime`;
- Holding the current runtime generation;
- Binding subscriptions for the current `AgentSession`;
- Creating, restoring, switching, and forking sessions;
- Switching working directories;
- Serializing operations that change the runtime;
- Aborting the current task;
- Cleaning up old subscriptions;
- Disposing on application exit.

Other modules must not hold long-lived `AgentSession` references. `runtime.newSession()`, `runtime.switchSession()`, and `runtime.fork()` replace `runtime.session`; keeping old references can cause:

- Continued receipt of events from the old session;
- Prompts sent to an invalid session;
- Leaked extension listeners;
- Cross-session tool events.

#### Runtime generation

Increment `runtimeGeneration` whenever the runtime is created or replaced. Every event sent to the renderer carries a generation; the renderer drops events that do not match the current generation.

```text
Session A is sending tool updates
    ↓
User switches to Session B
    ↓
Async events from Session A arrive late
    ↓
runtimeGeneration does not match
    ↓
Renderer drops stale events
```

#### Replacement failure

Upstream `AgentSessionRuntime` tears down the old session before creating a new runtime. If creating the new runtime fails, the old session cannot be treated as still available.

The UI should enter an explicit `error` or `crashed` state and offer:

- Retry creation;
- Re-select working directory;
- Open another session;
- View redacted diagnostics.

Do not silently show the old conversation and imply the old session can still run.

### 4.2 `PiAdapter`

`PiAdapter` isolates the pi SDK from the application domain model:

```text
AgentSessionEvent
    ↓ PiAdapter
DesktopEvent
```

The adapter must not pass the following directly to the renderer:

- SDK class instances;
- `AgentSession` or `ModelRuntime`;
- Raw `Error` objects;
- Objects containing credentials;
- Functions or custom prototypes;
- Values that cannot pass structured clone.

#### Streaming message rules

1. Correlate text/thinking blocks with `contentIndex`;
2. Correlate tool calls with tool call IDs;
3. Treat `message_update` as incremental only;
4. Treat `message_end.message` as the authoritative completed message;
5. Treat `tool_execution_update.partialResult` as the current accumulated result and replace tool display;
6. Rebind subscriptions after session replacement;
7. Do not propagate events from old generations.

Suggested domain events include:

```text
runtime.snapshot
runtime.statusChanged
message.started
message.delta
message.completed
tool.started
tool.updated
tool.completed
queue.changed
compaction.started
compaction.completed
retry.started
retry.completed
extensionUi.requested
diagnostic.reported
```

Domain events need not map one-to-one to SDK events; they should serve the desktop UI while preserving pi's key semantics.

### 4.3 `IpcRouter`

`IpcRouter` is responsible for:

- Registering a fixed allowlist of channels;
- Receiving renderer input as `unknown` and narrowing with schemas;
- Invoking application services;
- Converting errors uniformly;
- Detaching in-flight requests when a window is destroyed;
- Preventing duplicate handler registration.

Do not provide generic interfaces such as:

```typescript
execute(command: string)
readFile(path: string)
invoke(channel: string, data: unknown)
callHost(method: string, args: unknown[])
```

Such interfaces would expose host privileges back to the renderer.

### 4.4 `ProjectTrustCoordinator`

The desktop application must implement pi's project trust flow, but must not describe trust as a sandbox.

```text
User selects working directory
    ↓
Normalize to real path
    ↓
Check for project resources that require trust
    ↓
Check existing decisions in pi trust store
    ↓
If needed, prompt renderer for trust dialog
    ↓
User chooses trust, distrust, or this time only
    ↓
Load project resources and create runtime
```

Implementation requirements:

- Use pi's exported public APIs and trust store semantics;
- Do not parse or rewrite `trust.json` independently;
- Do not import unpublished internal sources from `../pi` directly;
- Do not mark all projects trusted by default;
- Do not load project extensions before the user decides.

Before implementation, verify whether the current public SDK can fully reproduce CLI project trust behavior, especially how user/global extensions participate in `project_trust` events. If public APIs are insufficient, prefer a supported integration path rather than relying on upstream internal file paths.

### 4.5 `CredentialCoordinator`

Credentials remain only in the main process and pi's credential store.

The renderer may:

- Query whether a provider is authenticated;
- Start OAuth login;
- Submit a new API key;
- Request logout.

The renderer may not:

- Retrieve saved API keys;
- Retrieve OAuth access/refresh tokens;
- Read `auth.json`;
- Persist keys in the frontend;
- Display full keys in errors or logs.

API key submission flow:

```text
User enters key
    ↓
One-shot IPC command
    ↓
Main process calls ModelRuntime
    ↓
Return success or redacted error
    ↓
Renderer clears input state immediately
```

Handle `CredentialSynchronizationError` correctly to avoid blindly resubmitting when credentials were written but subsequent local synchronization failed.

### 4.6 `AttachmentService`

To send images, the renderer does not receive general file read capability.

```text
Renderer requests image selection
    ↓
Main opens system file picker
    ↓
Main validates type and size
    ↓
Main issues short-lived attachment token
    ↓
Renderer holds only metadata and token
    ↓
Prompt references token on send
    ↓
Main reads, converts image, then consumes or expires token
```

Implementation must limit:

- Supported MIME types;
- Maximum file size;
- Token lifetime;
- Session or window ownership;
- Cleanup on cancel, window close, and send completion.

### 4.7 `WindowPolicy`

Electron windows use the following security configuration:

- `nodeIntegration: false`;
- `contextIsolation: true`;
- `sandbox: true`;
- `webSecurity: true`;
- No arbitrary window creation;
- No in-page navigation to remote URLs;
- External links open in the system browser after protocol validation;
- No loading remote application code;
- Strict CSP in production;
- In development, allow only the expected Vite dev server.

Allow only explicitly approved external protocols, such as `https:`. Reject `javascript:`, arbitrary external `file:` navigation, and dangerous URLs constructed from model output.

## 5. IPC protocol

IPC is divided into commands, results, and events. All use serializable domain types and runtime schemas defined in `src/shared`.

### 5.1 Command

Suggested command set:

```text
workspace.choose
workspace.open

session.list
session.create
session.switch
session.fork
session.rename

agent.prompt
agent.steer
agent.followUp
agent.abort
agent.clearQueue

model.list
model.select
model.setThinkingLevel

auth.getStatus
auth.submitApiKey
auth.login
auth.logout

runtime.getSnapshot
```

### 5.2 Result

Every command returns a unified domain result:

```typescript
type CommandResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: DesktopError;
    };

interface DesktopError {
  code: string;
  message: string;
  recoverable: boolean;
  retryAfterMs?: number;
  diagnosticId?: string;
}
```

IPC must not pass:

- Raw `Error` objects;
- Stack traces;
- Prompt contents;
- Environment variables;
- API keys;
- Sensitive full paths under the user home directory.

Underlying causes go only into redacted main-process diagnostics, correlated by `diagnosticId`.

### 5.3 Event

The main process pushes events to the renderer. Each event carries:

```typescript
interface DesktopEventEnvelope {
  runtimeGeneration: number;
  sequence: number;
  event: DesktopEvent;
}
```

- `runtimeGeneration` prevents old session events from polluting a new session;
- `sequence` detects loss or reordering;
- `event` is the project's own discriminated union domain event.

### 5.4 Snapshot and event races

When the renderer initializes or reloads, synchronize state as follows:

```text
1. Renderer installs event listener
2. Preload buffers events temporarily
3. Renderer requests runtime snapshot
4. Snapshot returns current generation and sequence
5. Renderer applies snapshot
6. Replay only buffered events with sequence greater than snapshot sequence
7. Switch to live consumption
```

On sequence gaps, request a snapshot again; do not guess missing state.

## 6. Asynchronous prompt handling

`session.prompt()` resolves only after the full run completes; Electron IPC `invoke` should not wait for the model and tools to finish.

Use pi's `preflightResult`:

```text
Renderer calls agent.prompt
    ↓
Main validates input
    ↓
Call session.prompt(..., { preflightResult })
    ↓
Return PromptAcceptance soon after preflight accepts or rejects
    ↓
Full run continues in background
    ↓
All progress pushed via DesktopEvent
    ↓
Background Promise uses explicit catch for later failures
```

This ensures:

- The renderer quickly receives "accepted" or "preflight failed";
- Long tasks do not hold an IPC call open;
- Failures after the model call starts are reported via events;
- No unhandled promise rejections.
## 7. Renderer state model

### 7.1 Authoritative state

From main snapshot or completion events:

- Current working directory;
- Current session;
- Completed messages;
- Model;
- Thinking level;
- Queue;
- Tokens and cost;
- Runtime status;
- Diagnostics.

### 7.2 Transient streaming state

Exists only during generation:

- Current text block deltas;
- Thinking block deltas;
- Tool call argument deltas;
- Tool execution partial results;
- Aborting state;
- Retry countdown;
- Compaction state.

When `message_end.message` arrives, atomically replace transient state with the complete message.

Use a small external store with React `useSyncExternalStore` to avoid putting high-frequency deltas in broad React Context. The first release does not commit to Redux or Zustand upfront; evaluate after real state complexity appears.

## 8. Session replacement lifecycle

```text
User requests session switch
    ↓
RuntimeController locks replacement operation
    ↓
Current runtime status becomes switching
    ↓
SDK aborts current work and completes teardown
    ↓
Old generation invalidated
    ↓
Create and apply new runtime/session
    ↓
Rebind extensions
    ↓
Resubscribe to session events
    ↓
Publish full snapshot
    ↓
Status becomes ready
```

During switching:

- New prompts are forbidden;
- The user may cancel a switch that has not started;
- The UI keeps old content but shows a non-interactive state;
- Late events from the old runtime are filtered by generation.

`newSession()`, `switchSession()`, `fork()`, and import use the same replacement state machine.

## 9. Extension UI

Pi extensions may initiate:

- `select`;
- `confirm`;
- `input`;
- `editor`;
- `notify`.

Convert these in the main process with `ExtensionUiCoordinator` into domain requests:

```text
pi extension UI request
    ↓
ExtensionUiCoordinator
    ↓
extensionUi.requested event
    ↓
Renderer modal / notification
    ↓
extensionUi.respond command
    ↓
Main resolves corresponding Promise
```

Each interaction must include:

- Request ID;
- Owning runtime generation;
- Optional timeout;
- Cancel on window close;
- Cancel on session replacement;
- Cancel on application exit.

Titles, options, and text from extensions are untrusted and must not execute as HTML.

Whether the first release fully supports these interactions is covered in pending architecture decision 5.

## 10. Persistence strategy

### 10.1 Managed by pi

The following remain managed by the official pi SDK:

- `~/.pi/agent/auth.json`;
- `~/.pi/agent/settings.json`;
- `~/.pi/agent/models.json`;
- `~/.pi/agent/models-store.json`;
- Session JSONL;
- Trust store;
- Extensions, skills, prompts, and themes.

The desktop application does not parse or rewrite session JSONL directly.

### 10.2 Managed by Electron `userData`

The desktop application stores only its own non-sensitive state:

- Window size and position;
- Panel widths;
- Tool detail expand state;
- UI theme preference;
- References to recently opened working directories;
- Non-sensitive application-level settings.

Do not duplicate in Electron `userData`:

- API keys;
- OAuth tokens;
- Session messages;
- Full prompts;
- File contents.

## 11. Recommended directory layout

```text
src/
├── main/
│   ├── bootstrap/
│   │   ├── app-lifecycle.ts
│   │   └── single-instance.ts
│   ├── window/
│   │   ├── create-main-window.ts
│   │   ├── navigation-policy.ts
│   │   └── window-state.ts
│   ├── ipc/
│   │   ├── register-ipc.ts
│   │   ├── ipc-router.ts
│   │   └── error-mapper.ts
│   ├── runtime/
│   │   ├── runtime-controller.ts
│   │   ├── pi-adapter.ts
│   │   ├── event-publisher.ts
│   │   └── runtime-state.ts
│   ├── trust/
│   │   └── project-trust-coordinator.ts
│   ├── credentials/
│   │   └── credential-coordinator.ts
│   ├── attachments/
│   │   └── attachment-service.ts
│   └── main.ts
│
├── preload/
│   ├── preload.ts
│   └── desktop-api.ts
│
├── renderer/
│   ├── app/
│   ├── features/
│   │   ├── conversation/
│   │   ├── composer/
│   │   ├── tools/
│   │   ├── sessions/
│   │   ├── models/
│   │   ├── trust/
│   │   └── settings/
│   ├── store/
│   ├── components/
│   └── main.tsx
│
├── shared/
│   ├── commands.ts
│   ├── events.ts
│   ├── errors.ts
│   ├── schemas.ts
│   └── desktop-api.ts
│
└── tests/
    ├── fixtures/
    ├── fakes/
    └── helpers/
```

`src/shared` must remain pure TypeScript:

- No Electron dependency;
- No Node.js dependency;
- No pi SDK dependency;
- Only serializable domain types and schemas.

## 12. Build approach

Suggested toolchain:

- npm;
- Electron;
- Electron Forge;
- `@electron-forge/plugin-vite`;
- React;
- Vite;
- TypeScript strict mode;
- Vitest;
- Testing Library;
- Playwright.

Build entry points:

```text
vite.main.config.ts
vite.preload.config.ts
vite.renderer.config.ts
```

### 12.1 Dependency rules

- Pin exact versions for all direct dependencies;
- Commit `package-lock.json`;
- Prefer `npm install --ignore-scripts` on install;
- Review dependencies that truly need lifecycle scripts separately;
- Pin an explicit pi SDK version;
- When upgrading the pi SDK, read the changelog and verify exported types;
- Production builds must not reference `../pi`.

### 12.2 Electron bundled Node.js version

The reference pi SDK `0.85.1` requires Node.js `>= 22.19.0`.

When choosing an Electron version, confirm its bundled Node.js satisfies the requirement. The development machine's `node --version` does not represent Node.js in the packaged app.

CI should add a packaging smoke test:

```text
Start packaged Electron app
    ↓
Check process.versions.node
    ↓
Import pi SDK
    ↓
Create minimal runtime without calling a real model
    ↓
Dispose cleanly
```

### 12.3 pi SDK asset packaging

During scaffolding, verify:

- ESM loading;
- Running inside ASAR;
- pi SDK bundled assets;
- WASM files;
- Native dependencies;
- `@silvia-odwyer/photon-node`;
- Extension and dynamic resource loading;
- Production path resolution.

If some assets cannot run inside ASAR, configure unpack only for required directories; do not disable ASAR entirely.

## 13. Test architecture

### 13.1 Adapter tests

Cover at least:

- `text_start/delta/end`;
- `thinking_start/delta/end`;
- Multiple `contentIndex` values;
- Tool call start/delta/end;
- Tool execution start/update/end;
- Queue updates;
- Abort;
- Retry;
- Compaction;
- Authoritative replacement via `message_end`;
- Session replacement;
- Dropping events from old generations;
- No events published after dispose.

### 13.2 IPC tests

Cover at least:

- Malformed input;
- Unknown commands;
- Invalid paths;
- Invalid model IDs;
- Duplicate requests;
- Conflicting session replacement;
- Prompt preflight rejection;
- Timeouts;
- Renderer/window destroyed;
- Error redaction;
- Credentials not in responses or logs.

### 13.3 UI tests

Cover at least:

- Loading;
- Empty;
- Streaming;
- Queued;
- Aborting;
- Error;
- Offline;
- Crashed;
- Keyboard navigation;
- Focus management;
- Narrow windows;
- Long commands, long paths, and unbroken output;
- Extension UI modals.

### 13.4 E2E and packaging tests

Use fake providers or mock runtimes; do not call real paid models. Cover:

- Application startup;
- Working directory selection;
- Project trust;
- Session creation;
- Streaming replies;
- Tool calls;
- Abort;
- Session switch;
- Window close;
- Runtime cleanup;
- Installed package startup;
- Error messaging when no API key is configured.
## 14. Explicitly out of scope for the first release

- Windows and macOS;
- Remote agent services;
- Custom session JSONL formats;
- Renderer direct access to Node.js;
- Generic shell IPC;
- Describing project trust as a sandbox;
- Implementing providers or the agent loop independently;
- Depending on experimental `pi-client`, `pi-protocol`, or `pi-server`;
- Automated tests against real paid models.

Multi-window, separate runtime processes, auto-update, and first-release packaging formats remain subject to pending decisions below.

## 15. Suggested implementation phases

### Phase 1: Scaffold and security shell

- Electron + React + Vite + TypeScript;
- main/preload/renderer/shared layering;
- Secure `BrowserWindow` configuration;
- CSP and navigation restrictions;
- IPC schemas and error model;
- Empty-state pages.

### Phase 2: Minimal pi runtime loop

- Pin pi SDK version;
- Create `AgentSessionRuntime`;
- Fake provider;
- Prompt;
- Text streaming;
- Abort;
- Runtime dispose.

### Phase 3: Tools and sessions

- Tool lifecycle;
- Queue;
- New/switch/fork session;
- Runtime generation;
- Session replacement tests.

### Phase 4: Project and authentication

- Directory selection;
- Project trust;
- Provider/model;
- API key and OAuth;
- Settings and diagnostics.

### Phase 5: Full UI and packaging

- Markdown, code, diffs, and command output;
- Extension UI;
- Tokens and cost;
- Linux install packages;
- Packaging smoke test.

## 16. Pending architecture decisions

The following five items are not automatically settled by choosing Electron. Each records what acceptance and rejection mean, trade-offs, and current recommendation. After review, update this section with final decisions.

### Decision 1: Accept pi SDK in the same process as Electron main for the first release

**Current status: pending.**

#### What acceptance means

The pi SDK, `AgentSessionRuntime`, tools, and pi extensions run directly in the Electron main process:

```text
Renderer
    ↓ Electron IPC
Electron main
    ├── Window and system capabilities
    └── pi SDK / tools / extensions
```

#### Advantages of acceptance

- Use the pi SDK directly without an extra process protocol;
- SDK types usable directly in main and adapter;
- Stream events via direct subscription and conversion;
- No JSONL framing, request IDs, stdout/stderr, or child process restart handling;
- On exit, only abort, dispose runtime, and shut down Electron;
- Shorter implementation and debugging path;
- Fastest path to validate prompt, tools, session, trust, and extension end-to-end.

#### Disadvantages of acceptance

- Uncaught exceptions in pi runtime or extensions may exit the Electron main process;
- Synchronous dead loops in extensions may block the main event loop, freezing IPC, menus, and window management;
- Native module crashes, OOM, or `process.exit()` may take down the entire app;
- When runtime is unrecoverable, users typically must restart the desktop app;
- After main crashes, the app cannot show a runtime crash recovery UI;
- Synchronous pi runtime load may affect desktop host responsiveness.

#### What rejection means

Place pi runtime in an Electron utility process or Node.js child process; main acts only as supervisor and IPC gateway:

```text
Renderer
    ↓ Electron IPC
Electron main
    ↓ Inter-process protocol
Runtime process
    └── pi SDK / tools / extensions
```

Alternatively, launch packaged `pi --mode rpc` with strict JSONL protocol integration.

#### Advantages of rejection

- Runtime or extension crash may leave Electron main and windows alive;
- Can show `runtime crashed` while keeping draft input and last known state;
- Can restart runtime independently;
- Synchronous dead loops and event loop blocking stay in the runtime process;
- Window, menu, and basic IPC in main are not directly blocked by pi runtime;
- Better fit for heavy third-party extensions or fault-recovery-focused products.

#### Disadvantages of rejection

- Must define and maintain cross-process protocol and runtime schema;
- SDK objects and types cannot cross processes; convert to serializable domain data;
- Handle request IDs, timeouts, pending requests, reordering, backpressure, and cancellation;
- Handle process start, abnormal exit, graceful shutdown, forced kill, and orphan processes;
- With RPC, frame strictly on `\n`; do not use generic line readers that split on Unicode line separators;
- Extension UI needs extra request/response protocol;
- Package runtime with the app; cannot rely on globally installed pi;
- Significantly higher implementation, debugging, and test cost.

#### Security note

A separate process provides **failure isolation**, not a system permission sandbox. The runtime process still runs with the current user's privileges and can read files, modify projects, execute shell, and access the network. Real security isolation needs containers, VMs, micro-VMs, or OS sandboxing.

#### Current recommendation

For the first release, **accept same-process**, but isolate the SDK through `RuntimeController` and `PiAdapter` so renderer and IPC contracts do not depend on SDK types. Later, replace the adapter backend with a utility process or RPC without rewriting the renderer.

Do not implement both SDK and RPC backends in the first release.

### Decision 2: Accept single-window, single active working directory/runtime for the first release

**Current status: pending.**

#### What acceptance means

The first release maintains only:

- One main window;
- One active working directory;
- One active `AgentSessionRuntime`;
- Sessions that can be created, restored, switched, and forked within that runtime.

Switching projects or sessions uses controlled replacement; do not maintain multiple active runtimes concurrently.

#### Advantages of acceptance

- Clear runtime ownership and lifecycle;
- Lower risk of crossed events or prompts to wrong projects;
- Simple relationships among credentials, cwd, session, and extension context;
- Easier testing of session replacement, abort, and exit cleanup;
- Renderer maintains one active conversation state;
- Easier memory and provider concurrency control;
- Faster path to first usable release.

#### Disadvantages of acceptance

- Users cannot view two projects or sessions side by side;
- Switching projects replaces runtime and may wait for abort and resource rebuild;
- Cannot continue independent work in another window during long tasks;
- Multi-window later requires extending ownership for window, runtime, and event routing;
- Users may see single-window as limiting for developer tool efficiency.

#### What rejection means

Support multiple windows or parallel active workspaces/runtimes in the first release. Each window needs its own runtime ID and working directory binding.

#### Advantages of rejection

- Handle multiple projects or sessions concurrently;
- Continue work in other windows during long tasks;
- Closer to mature IDE multi-task experience;
- Validate multi-runtime isolation from the first release, avoiding later global singleton refactors.

#### Disadvantages of rejection

- Associate every command and event with window ID, runtime ID, and generation;
- Route credentials, project trust, session, and extension UI per window or runtime;
- Application exit, single-window close, and runtime cleanup combinations grow significantly;
- Multiple agents may modify the same project concurrently; need conflict hints or limits;
- Harder provider concurrency, token cost, and resource control;
- Much larger UI, E2E, and crash recovery test matrix;
- With pi SDK in main, multiple runtimes still share one main failure domain.

#### Current recommendation

For the first release, **accept single-window, single active working directory/runtime**. Avoid renderer components referencing global SDK objects directly, but do not build a multi-runtime registry upfront. Design one-window-one-runtime or multi-workspace models after confirming real user needs.

### Decision 3: Accept npm + Electron Forge/Vite as scaffold and packaging baseline

**Current status: pending.**

#### What acceptance means

Use:

- npm and `package-lock.json` for dependencies;
- Electron Forge for dev start, packaging, and makers;
- `@electron-forge/plugin-vite` to build main, preload, and renderer separately;
- Vite for React renderer;
- TypeScript strict mode across application code.

#### Advantages of acceptance

- npm already available on current machines without extra package managers;
- `package-lock.json` and `npm ci` suit repeatable CI installs;
- Electron Forge provides official Vite + TypeScript templates;
- main, preload, and renderer can share similar Vite configuration;
- Forge integrates Electron packaging, makers, and fuses;
- React renderer gets mature Vite HMR;
- Scripts can live in `package.json` as a single entry for local and CI;
- More consolidated first-release setup than hand-rolling Packager, Vite, and installers.

#### Disadvantages of acceptance

- Electron Forge Vite plugin is still marked experimental upstream;
- Forge/Vite upgrades may require migration in minor releases; pin versions and read release notes;
- main/preload Node/ESM external configuration may be more complex than renderer;
- pi SDK ESM, assets, WASM, native dependencies, and ASAR behavior need packaging validation;
- Forge abstractions may need custom hooks or makers for complex release needs;
- npm workspaces and large monorepos are not always the fastest experience.

#### What rejection means

Rechoose at least one foundation, for example:

- pnpm or Yarn instead of npm;
- electron-vite instead of Electron Forge Vite plugin;
- Electron Builder instead of Electron Forge;
- Custom Vite/esbuild + Electron Packager + Linux packaging scripts.

Rejection is not one alternative; the replacement combination must be decided.

#### Advantages of rejection

- Pick tools whose stability or capabilities fit better;
- `electron-vite` is more specialized for main/preload/renderer dev experience;
- Electron Builder has mature ecosystem for some installers, publishing, and auto-update;
- pnpm can reduce disk use and provides strict dependency resolution;
- Custom builds control externals, ASAR, and asset copying precisely.

#### Disadvantages of rejection

- Requires another research cycle and delays scaffolding;
- May introduce more configuration glue between tools;
- More custom build code to maintain;
- Does not eliminate experimental or upgrade risk; shifts risk to other tools;
- Limited benefit from complex monorepo tooling at current project size;
- Switching to pnpm/Yarn requires syncing environment, CI, README, and contributor docs.

#### Current recommendation

For the first release, **accept npm + Electron Forge/Vite**, but:

- Pin exact versions for all direct dependencies;
- Commit the lockfile;
- Record Forge Vite plugin experimental status as known risk;
- Complete a pi SDK packaging spike before large business code;
- Verify ESM, ASAR, WASM, native dependencies, and Linux package startup;
- If the spike reveals unacceptable issues, changing build tools early is acceptable.

### Decision 4: Accept RPM/deb first, then AppImage/Flatpak

**Current status: pending.**

#### What acceptance means

First-phase release baseline:

- RPM: prioritize current Fedora dev and validation environment;
- deb: common Debian/Ubuntu environments.

Add AppImage and Flatpak after core runtime loop, packaging smoke tests, and basic install flows stabilize.

#### Advantages of acceptance

- Smaller first-release matrix;
- RPM matches current Fedora for local install validation;
- deb and RPM have clear system dependencies, desktop files, and uninstall semantics;
- Solve pi SDK, Electron sandbox, system libraries, and app data paths first;
- Lower CI, release, and troubleshooting complexity;
- Avoid AppImage runtime and Flatpak permission models in the first release simultaneously.

#### Disadvantages of acceptance

- First release cannot cover more distros with one portable file;
- Arch, openSUSE, and other non-deb/RPM users wait or self-package;
- deb and RPM need separate packaging metadata and validation environments;
- Some users prefer install-free AppImage;
- Flatpak later introduces new permission design for pi file, shell, project directory, and credential access.

#### What rejection means

Ship RPM, deb, AppImage, and possibly Flatpak in the first release; or prioritize AppImage/Flatpak over deb/RPM.

#### Advantages of rejection

- AppImage offers portable install-free experience;
- More formats cover broader Linux users early;
- Flatpak provides standardized distribution and explicit permissions;
- Early validation of path, sandbox, and desktop integration across distribution models;
- Less risk of major packaging architecture change when adding formats later.

#### Disadvantages of rejection

- Release, CI, and test matrix grows significantly;
- AppImage needs glibc, FUSE, sandbox, and distro compatibility validation;
- Flatpak sandbox conflicts structurally with pi's need for arbitrary project directories, shell, toolchain, and user config;
- Flatpak portals, file permissions, host toolchain, and `~/.pi/agent` access need dedicated design;
- Higher automated install and startup smoke test cost;
- Risk spending time on packaging edge cases before core agent features stabilize.

#### Current recommendation

For the first release, **accept RPM/deb first, then AppImage/Flatpak**.

Treat RPM as the first validation target on current Fedora; deb as the second package target. Add AppImage after core functionality and CI builds stabilize. Flatpak needs separate architecture assessment because it changes file, shell, toolchain, and credential boundaries—not just another archive format.

### Decision 5: Full first-release support for pi extension UI `select`, `confirm`, `input`, `editor`

**Current status: pending.**

`notify` is non-blocking display with lower complexity. This decision focuses on blocking `select`, `confirm`, `input`, and `editor` that wait for user response.

#### What acceptance means

First release implements full extension UI request/response bridging:

```text
pi extension calls ctx.ui.*
    ↓
Main ExtensionUiCoordinator
    ↓
Renderer modal
    ↓
User responds or cancels
    ↓
Main resolves extension Promise
```

#### Advantages of acceptance

- Better compatibility with existing pi extensions;
- Extensions needing confirm, select, or input complete workflows;
- Avoid extensions waiting indefinitely, silent degradation, or broken features;
- Permission-related confirms and dangerous operations show clearly in desktop UI;
- Validate request ID, timeout, cancel, and session replacement lifecycle in the first release;
- Aligns with first-milestone goal of basic extension interaction in README.

#### Disadvantages of acceptance

- Modal queue, focus management, keyboard use, and accessibility;
- Multiple requests, duplicate responses, timeout, and cancel;
- On window close, session replacement, abort, and runtime crash, resolve all pending Promises;
- `editor` needs multi-line editing, prefilled content, and complex focus restore;
- Extension text is untrusted; render safely;
- More E2E and lifecycle testing;
- Extension interaction may conflict with agent prompt composer, global shortcuts, and app close.

#### What rejection means

First release supports only non-interactive `notify`, or a limited subset such as `confirm`; mark other extension UI as unsupported with cancel, default return, or block incompatible extensions.

Unsupported requests must not wait indefinitely.

#### Advantages of rejection

- Faster core chat, streaming, tools, and session flows;
- Less modal, focus, and pending-request state;
- Smaller first-release UI and E2E scope;
- Prioritize support order based on real extension usage;
- Validate SDK integration and secure IPC before extension UI;
- Allow phased extension interaction.

#### Disadvantages of rejection

- Some existing pi extensions will not work;
- Extension behavior may diverge from pi TUI;
- Users may see "extension interaction not supported yet" and return to TUI;
- Need explicit compatibility detection and failure strategy;
- Silent defaults may mis-confirm dangerous operations; cannot silently degrade;
- Later completion still adjusts IPC, runtime lifecycle, and UI architecture;
- Does not fully meet README first-milestone extension interaction goal.

#### Optional compromise

If full support is rejected for the first release, phase in two steps:

1. First release: `notify`, `confirm`, and `select`;
2. Later: `input` and `editor`.

The compromise still requires:

- Unsupported methods return explicit cancel or error immediately;
- No silent confirmation of operations;
- No infinite wait on extension Promises;
- UI clearly states current compatibility limits.

#### Current recommendation

Because README lists basic extension interaction as a first-milestone goal, the first release should **accept full support** for `select`, `confirm`, `input`, and `editor`, plus `notify`.

If delivery timeline outweighs extension compatibility, use the phased compromise above and update README first-release scope and known limitations accordingly.

## 17. Decision summary

| Decision | Current status | Recommendation in this document |
| --- | --- | --- |
| pi SDK same process as Electron main | Pending | Accept for first release; keep adapter replacement point |
| Single window, single active working directory/runtime | Pending | Accept for first release |
| npm + Electron Forge/Vite | Pending | Accept; complete packaging spike first |
| RPM/deb before AppImage/Flatpak | Pending | Accept; assess Flatpak separately |
| Full extension UI in first release | Pending | Accept; phased if schedule constrained |

After review, update each "current status" to accepted or rejected, record decision date and brief rationale. If a final decision changes security boundaries, first-release scope, or development commands, also update `README.md` and related project constraints.

## 18. References

### In-repository material

- [Desktop Framework and TypeScript Build Options Research](../desktop-framework-options.md)
- [`AGENTS.md`](../../AGENTS.md)
- [`README.md`](../../README.md)
- `../pi/packages/coding-agent/docs/sdk.md`
- `../pi/packages/coding-agent/docs/security.md`
- `../pi/packages/coding-agent/docs/rpc.md`
- `../pi/packages/coding-agent/examples/sdk/13-session-runtime.ts`

### External material

- [Electron process model](https://www.electronjs.org/docs/latest/tutorial/process-model)
- [Electron security recommendations](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron context isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Electron Forge Vite + TypeScript](https://www.electronforge.io/templates/vite-+-typescript)
- [pi SDK](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sdk.md)
- [pi RPC](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/rpc.md)
- [pi Security](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/security.md)
