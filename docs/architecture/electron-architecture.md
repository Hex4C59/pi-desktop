# pi-desktop First-Release Electron System Architecture

English | [中文](electron-architecture.zh.md)

- Type: Architecture
- Status: Proposed
- Created: 2026-09-18
- Last reviewed: 2026-09-18
- Applicable phase: first usable release
- Authority scope: first-release system structure, process boundaries, module layering, resource ownership, event synchronization, security, persistence, and lifecycle constraints
- Supersedes: [`../archive/electron-architecture.md`](../archive/electron-architecture.md)
- Product requirements: [`../product-requirements.md`](../product-requirements.md)
- Module design (archived): [`../archive/module-structure.md`](../archive/module-structure.md)
- Discussion: [`../discussions/electron-architecture-discussion.md`](../discussions/electron-architecture-discussion.md)
- Review method: [`../architecture-review-guide.md`](../architecture-review-guide.md)
- Upstream reference commit: `e5d18382a207a4b108d97f7cc97abdc90a23d32d`

> This document describes the planned architecture; it does not mean the application is already implemented. User-visible behavior is governed by product requirements; this document assigns that behavior to system boundaries and resource owners; per-module interface details belong in multi-task module designs under `docs/modules/` yet to be written. Archived single-runtime module documents must not override this document's multi-task ownership model.

## 1. Architecture conclusions

The first release uses Electron + React + Vite + TypeScript to deliver a single-instance, single-main-window, multi-project, multi-top-level-task Linux agent workbench.

The system follows these core conclusions:

1. The Renderer is a presentation layer only; it does not receive Node.js, shell, general file I/O, the pi SDK, or provider credentials.
2. Electron Main is the desktop host and high-privilege coordination layer; it exposes capabilities to the Renderer through fixed, typed, runtime-validated IPC.
3. Each top-level task owns an independent task record, working directory, pi session binding, and runtime slot; switching the currently viewed task does not replace or abort background runtimes.
4. Write tasks in Git projects use independent worktrees; a worktree is workflow isolation, not a system permission sandbox.
5. Inside Main, dependencies remain one-way: `IPC → Application Services → Task/Runtime/Capability Services → Pi Adapter → pi SDK`.
6. Project code does not reimplement pi's agent loop, providers, tools, compaction, or session file semantics; integration uses only pinned-version pi public APIs.
7. Multi-task events are addressed by project, task, agent, and runtime incarnation identity; catalog summaries and task details synchronize separately; one task falling out of sync must not freeze other tasks.
8. Task, runtime, worktree, pending request, attachment token, result revision, and application journal must each have a unique owner.
9. Saved credentials, full prompts, attachment content, and sensitive diagnostics must not return to the Renderer or enter ordinary logs, system notifications, or Renderer persistence.
10. The final process hosting model for the pi runtime must be closed by a prerequisite spike and ADR; a separate process provides failure isolation but is not a permission sandbox.

## 2. Document roles and dependencies

Documents refine each other in this direction:

```text
product-requirements.md
  user behavior, scope, acceptance
        ↓
architecture/electron-architecture.md
  system structure, boundaries, ownership, invariants
        ↓
docs/modules/*.md (to be written)
  module inventory, dependencies, key flows, per-module interfaces
        ↓
(historical single-runtime material in archive/module-structure.md and archive/modules/)
        ↓
TypeScript / schema / lint / tests
  executable constraints
```

On conflict, do not silently choose:

- `AGENTS.md` security and development constraints take precedence;
- user-visible behavior uses confirmed directions in the current requirements document as architectural input;
- this document owns system-level structure and owners;
- module documents may only refine this document; they must not restore superseded assumptions such as a globally unique runtime;
- Discussion, Superseded, and Archive provide historical context only.

## 3. Architecture goals and non-goals

### 3.1 Goals

- Support multiple projects and multiple top-level tasks running in parallel within one window;
- use independent worktrees for different top-level tasks in the same Git project;
- provide observability for main agents, sub-agents, tools, queues, retries, compaction, and extension UI;
- keep identity, state, errors, and pending interactions for the currently viewed task and background tasks from crossing or being lost;
- provide task result review, whole-item apply, explicit discard, and abnormal recovery;
- after restart, restore projects, tasks, session references, worktrees, and unhandled results, but do not automatically continue model requests;
- isolate upstream SDK changes and allow future replacement of runtime transport;
- establish boundaries provable by types, schema, import rules, and automated tests.

### 3.2 Non-goals

The first release does not provide:

- Windows or macOS support;
- multiple main windows or tray residence after closing the window;
- remote agent services or multi-device sync;
- parallel write tasks in the same non-Git project;
- automatic commit, merge, or pull request creation;
- per-file or per-hunk selective apply;
- a built-in Git conflict resolver;
- a custom session JSONL format or direct rewriting of session files;
- describing worktrees, project trust, or separate runtime processes as system sandboxes;
- maintaining both SDK and RPC as product-level backends simultaneously;
- depending on upstream experimental `pi-client`, `pi-protocol`, or `pi-server` as a stable foundation.

## 4. System context

```text
┌─────────────────────────────────────────────────────────────┐
│ User                                                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ keyboard / pointer / dialogs
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Electron Renderer                                           │
│ project/task tree · conversation · task details · settings  │
└──────────────────────────────┬──────────────────────────────┘
                               │ fixed PiDesktopApi
                               │ command / result / event / snapshot
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Electron Main / Desktop Host                                │
│ IPC · application services · registries · scheduler         │
│ worktree/result services · persistence · lifecycle          │
└───────────────┬──────────────────┬──────────────────┬────────┘
                │                  │                  │
                │ runtime port     │ structured APIs  │ OS APIs
                ▼                  ▼                  ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────┐
│ Pi Runtime Host(s)   │  │ Git / filesystem │  │ dialogs /    │
│ SDK + tools + ext.   │  │ task worktrees   │  │ notifications│
└───────────┬──────────┘  └──────────────────┘  └──────────────┘
            │ provider APIs
            ▼
┌──────────────────────┐
│ Model providers      │
└──────────────────────┘
```

The desktop can constrain only its own IPC, logging, persistence, and UI. pi, extensions, tools, and processes they start still run with the launching user's privileges and may access user-writable locations outside the worktree.

## 5. Process model

### 5.1 Renderer

The Renderer is responsible for:

- React views and semantic interaction;
- short-lived navigation state such as the currently viewed project and task;
- UI state such as composer drafts, focus, and panel open/close;
- consuming catalog snapshots, task snapshots, and domain events from Main;
- invoking fixed business commands on Preload.

The Renderer must not:

- import Electron, Node.js, or the pi SDK;
- execute shell or arbitrary file I/O;
- receive general host capabilities beyond raw path authorization;
- obtain saved API keys, OAuth tokens, or authentication files;
- hold SDK classes, Main services, or runtime transport;
- persist prompts, follow-ups, attachment content, or session message copies in browser storage.

### 5.2 Preload

Preload is the only bridge between Renderer and Main:

- expose a fixed `PiDesktopApi` via `contextBridge`;
- map each method to a fixed IPC channel;
- install event listeners and bounded caching before completing snapshot handoff;
- return explicit unsubscribe handles;
- not interpret business rules.

Do not expose raw `ipcRenderer`, dynamic channels, generic `send`/`invoke`, `process`, `fs`, `child_process`, or the full Electron API.

### 5.3 Electron Main

Main is the desktop host and coordination layer, responsible for:

- single instance, window, navigation, system dialogs, and desktop notifications;
- IPC schema validation, request cancellation, error mapping, and event transport;
- project, task, runtime, worktree, and result lifecycles;
- multilevel concurrent scheduling;
- project trust, credentials, attachments, and extension UI;
- application persistence, recovery, diagnostics, and exit cleanup;
- supervising runtime hosts without reimplementing pi agent semantics.

### 5.4 Pi Runtime Host

Logically, each top-level task has one runtime slot. At most one valid runtime incarnation exists in a slot at a time; that incarnation wraps one pi `AgentSessionRuntime` or an equivalent isolated backend.

The runtime host is responsible for:

- creating cwd-bound pi services and session runtime;
- rebinding extensions and event subscriptions after session replacement;
- mapping prompt, steer, follow-up, abort, model, and session operations to pinned public APIs;
- converting SDK events into project domain events;
- releasing sessions, listeners, extensions, and partially created resources.

### 5.5 Open process-hosting decision

The first release must choose one backend through a spike before business implementation:

1. **SDK in the same process as Electron Main**: shorter path, but an extension infinite loop, `process.exit()`, OOM, or native crash may take down the entire application and all tasks;
2. **SDK or app-bundled RPC runtime in a utility/child process**: isolates crashes and event-loop blocking, but requires a serialization protocol, supervisor, timeouts, restart, and packaging support.

Regardless of choice, Application Services depend only on project-owned narrow runtime ports. Renderer, Shared, and business modules must not depend on SDK classes. A separate process does not change pi's user privileges and is not a file or network sandbox.

This decision must produce an ADR; until closed, only controlled spikes are allowed—large-scale multi-runtime implementation is not.

## 6. Main internal layering and dependency rules

```text
IpcRegistration / IpcRouter
        ↓
Application Services
        ↓
Project / Task / Scheduler / Runtime / Capability Services
        ↓
Consumer-owned ports
        ↓
Pi Adapter / Git Adapter / Persistence Adapter / OS Adapter
        ↓
pi SDK / Git / filesystem / Electron
```

### 6.1 Application Services

Orchestrate user use cases; do not hold SDK instances or long-lived resources:

- project open, remove, and resource decisions;
- task create, restore, rename, delete;
- session list, create, switch, fork, rename;
- prompt, steer, follow-up, abort, and queue;
- model/thinking configuration;
- result review, validate, apply, and discard;
- snapshot query.

### 6.2 Capability Services

Form high-cohesion boundaries around resources and rules:

- project/task registries;
- scheduler;
- per-task runtime controller;
- worktree manager;
- result inspector and application journal;
- trust, credentials, attachments, extension UI;
- persistence, notifications, diagnostics.

### 6.3 Adapters

Only the adapter layer may directly import the corresponding high-privilege or external implementation:

- `main/pi/`: pi SDK;
- `main/git/`: Git process/API;
- `main/persistence/`: file and database implementation;
- `main/platform/`: Electron dialog, notification, shell openExternal, etc.

Application services define the narrow ports they need. Do not create a giant host interface giving every caller access to prompt, model, session, dispose, Git, and persistence.

### 6.4 Shared Contracts

`src/shared` contains only what cross-process boundaries need:

- serializable domain types;
- command/result/event/snapshot contracts;
- runtime schema;
- branded IDs and stable error codes.

Shared must not depend on Electron, Node.js, the pi SDK, or Main/Renderer implementations. Split by use-case domains such as project, task, agent, session, runtime, model, auth, attachment, extension, and result; forbid giant `types.ts`, `commands.ts`, or vague barrels.

## 7. Core domain and identity

### 7.1 Project

A `Project` corresponds to the user's chosen canonical raw working directory and its pi, Git, and task context, with a stable `projectId`. Project resource decisions bind to the raw project identity, not internal worktree paths.

### 7.2 Top-level Task

A `Task` is a user-manageable top-level work unit with a stable `taskId`, bound to:

- `projectId`;
- one pi session reference;
- one effective working directory;
- an independent worktree in Git projects;
- base commit, target workspace, and expected target ref;
- a runtime slot;
- a follow-up queue;
- agent, validation, and result state;
- the current `resultRevision`.

The same pi session must not bind two active top-level tasks at once.

### 7.3 Main Agent and Sub-agent

Each top-level task runs at most one main agent at a time. Sub-agents:

- belong to one task and parent agent;
- share the parent task's worktree;
- have stable `agentId` and parent/child relationships;
- may queue, run, wait, fail, complete, or cancel independently;
- cannot receive messages directly from the user;
- must cascade-cancel when the main task is aborted.

Sub-agents are not a first-class stable capability the current SDK can assume directly. Before implementation, complete a spike via public API, supported extension/custom tool, or compatibility-guarded protocol; on failure, block implementation or revise product scope—do not fake state.

### 7.4 Runtime Slot and Incarnation

A `RuntimeSlot` belongs to one `taskId` and stays stable across runtime rebuilds. Each create, restore, or replace of the actual runtime produces a new incarnation:

- `runtimeId`: unique ID for that incarnation;
- `generation`: monotonically increasing within the task slot;
- `state`: starting, ready, running, waiting, aborting, replacing, error, crashed, disposed, etc.;
- event subscription and cancellation handles;
- corresponding session/runtime adapter.

Once an old incarnation is invalid, its late events and responses must not affect the current task.

### 7.5 Currently viewed task vs background tasks

The currently viewed task is only Renderer navigation selection. Switching it:

- does not replace the runtime;
- does not change scheduler state;
- does not cancel prompts, tools, extension requests, or follow-ups;
- does not discard background events;
- only changes which detailed snapshot the central view loads.

## 8. Module groups and resource ownership

### 8.1 Core owners

- project registry: `ProjectRegistry`;
- task record and task/session/worktree bindings: `TaskRegistry`;
- concurrency slots and wait queues for top-level and sub-agents: `AgentScheduler`;
- task runtime slot, current incarnation, and generation: `TaskRuntimeController`;
- lookup of all task runtime controllers and application-level shutdown: `RuntimeRegistry`;
- runtime SDK subscription: corresponding `RuntimeEventSubscription`;
- task event sequence and task projection commit: corresponding task `TaskEventStream`;
- catalog sequence and project/task summary projection: `TaskCatalogProjection`;
- worktree create, validate, lock, and delete: `WorktreeManager`;
- Git diff, validation records, and `resultRevision`: `TaskResultService`;
- apply/discard journal: `ResultApplicationService`;
- attachment tokens: `AttachmentService`;
- extension pending requests: `ExtensionUiCoordinator`;
- trust pending requests: `TrustPromptCoordinator`;
- IPC request cancellation: `RequestScopeRegistry`;
- Renderer catalog and per-task projection: `RendererStore`;
- window geometry and non-sensitive UI preferences: corresponding store;
- facts for session, authentication, pi settings/resources, and trust store: pi public API.

### 8.2 Forbidden dual ownership

- `TaskRegistry` does not hold SDK runtimes;
- `RuntimeRegistry` does not own worktrees or persistence facts;
- `TaskRuntimeController` does not orchestrate project/task user use cases;
- `AgentScheduler` does not execute model calls or modify the follow-up queue;
- `TaskResultService` does not apply changes directly;
- `ResultApplicationService` does not delete worktrees without an explicit discard/cleanup decision;
- Renderer projection is not Main persistence truth;
- adapters are not business state owners.

## 9. Runtime, Session, and scheduling

### 9.1 Runtime lifecycle

Runtime changes for each task affect only that task:

```text
Task command
  → TaskRuntimeController locks that task slot
  → old incarnation invalid immediately and rejects new operations
  → cancel task-scoped pending operations
  → unsubscribe / abort / dispose old runtime
  → create new runtime via RuntimeFactory
  → bind extensions and SDK subscription
  → install new runtimeId + generation
  → commit task snapshot
  → state ready
```

If new runtime creation fails, the old runtime must not be advertised as still usable. The task enters an explicit error/crashed/interrupted state; other tasks are unaffected.

### 9.2 Session replacement

`newSession()`, `switchSession()`, `fork()`, and import are replacements within a task slot. After upstream `AgentSessionRuntime` replacement, `runtime.session` changes, so you must:

1. invalidate the old incarnation or old session binding;
2. detach old listeners;
3. complete upstream replacement;
4. rebind extensions to the new `runtime.session`;
5. resubscribe;
6. publish a new task snapshot.

Switching the Renderer's current session is not replacement; run the above flow only when the user explicitly changes a task's session binding.

### 9.3 Scheduler

The scheduler manages three limits:

- concurrently running top-level tasks;
- sub-agents per task;
- global total of main agents and sub-agents.

It must satisfy:

- over-limit requests enter an explicit scheduler queue;
- scheduler queue is separate from follow-up queue and provider retry;
- waiting for user does not occupy a model execution slot;
- when a parent agent waits for sub-agents, release the model execution slot;
- queued sub-agents already depended on by a parent task take priority over new top-level tasks to avoid slot-wait deadlocks;
- support cancellation, bounded waiting, and starvation protection;
- dynamically lowering limits must not forcibly terminate already-running agents.

### 9.4 Prompt and message-level model snapshot

Prompt commands must pass task-scoped preflight:

- task/runtime available;
- input and attachments valid;
- project resource decision applicable;
- provider authenticated;
- model and thinking level available;
- effective working directory matches task binding;
- scheduler accepts or queues.

Use pi `preflightResult` to return `PromptAcceptance` as early as possible; keep the full `prompt()` Promise in the background with explicit failure capture.

Ordinary prompts apply an immutable model snapshot before starting a turn. Steer inherits the current run configuration and does not change model mid-run. Follow-ups that need an independent model snapshot are held by Desktop until just before the next turn starts, then model and thinking level are set; do not hand them early to an upstream queue that cannot preserve that snapshot.

## 10. Event addressing, consistency, and synchronization

### 10.1 Two event streams

To avoid one task falling out of sync freezing all tasks, use two logical streams:

1. **Catalog stream**: projects, task summaries, unread, waiting, failures, result state, and aggregated usage;
2. **Task stream**: conversation, thinking, tools, agent tree, queue, runtime, validation, and result details for one task.

### 10.2 Event envelope

Conceptual contract; final fields are fixed in Shared Contracts:

```typescript
interface DesktopEventEnvelope {
  stream: "catalog" | "task";
  catalogSequence?: number;
  taskSequence?: number;
  projectId?: ProjectId;
  taskId?: TaskId;
  agentId?: AgentId;
  runtimeId?: RuntimeId;
  generation?: number;
  event: DesktopEvent;
}
```

Constraints:

- catalog stream uses monotonically increasing `catalogSequence` within the application process;
- each task stream uses monotonically increasing `taskSequence` over the task lifetime; runtime replacement does not reset it;
- runtime-sourced events must carry `runtimeId + generation`;
- tool call IDs are interpreted only within `taskId + agentId`;
- events from old runtimes are dropped before Main commit;
- Renderer must still validate identity as a second line of defense.

### 10.3 Main projection and linearization

Main maintains serializable catalog projection and per-task projection. They are authoritative projections for the sync protocol, not replacements for pi session or TaskStore persistence facts.

For each stream, the following steps must complete in one serial commit sequence; the commit callback must not `await`:

1. validate task, runtime incarnation, and generation;
2. update Main projection with domain reducers;
3. assign the corresponding sequence;
4. form the event envelope;
5. record the committed sequence visible to snapshots.

This establishes the invariant:

> `snapshot.sequence = N` means the snapshot already includes all committed changes in that stream with `sequence <= N`.

Delivery to the window may happen after commit. Publish failure must not roll back an already-committed projection; Renderer recovers via snapshot resync.

### 10.4 Snapshots

Two query types:

- `getCatalogSnapshot()`: project and task summaries, catalog sequence;
- `getTaskSnapshot(taskId)`: full serializable details for the task, task sequence, current runtimeId/generation.

Renderer initialization:

```text
Preload subscribes first and bounded-caches catalog events
  → request catalog snapshot
  → apply snapshot atomically
  → replay larger catalogSequence
  → switch to live consumption
```

Opening task details performs the same handoff for that task. On gap detection, pause only the corresponding stream:

- catalog gap: re-request catalog snapshot;
- task gap: re-request only that task snapshot;
- other tasks keep consuming;
- do not guess missing state.

### 10.5 Pi event conversion

`PiEventAdapter` must preserve upstream semantics:

- correlate text/thinking blocks with `contentIndex`;
- correlate tool lifecycle with tool call ID;
- treat `message_update` as incremental only;
- treat `message_end.message` as authoritative for completed messages;
- treat `tool_execution_update.partialResult` as cumulative result;
- SDK events must be handled exhaustively or logged in a controlled unsupported branch;
- domain events serve desktop state and need not map one-to-one to SDK events.

## 11. Key end-to-end flows

### 11.1 Open project

```text
IpcRouter
  → ProjectCoordinator
  → PathValidator / GitInspector
  → ProjectTrustCoordinator
  → ProjectRegistry saves project record
  → TaskRecoveryService loads and validates existing task/worktree
  → catalog projection commit
  → Renderer project/task tree
```

Canceling directory selection must not error or change state. Protected project resources must not load before trust decision completes.

### 11.2 Create Git top-level task

```text
TaskCoordinator
  → validate project and raw workspace
  → WorktreeManager records base commit and creates independent worktree
  → TaskStore persists task/worktree/session binding
  → RuntimeRegistry creates task slot
  → Scheduler accepts or queues
  → TaskRuntimeController creates runtime
  → bind subscription and commit task snapshot
```

Any step failure must clean partial resources from that creation; persisted facts and leftover worktrees must be diagnosable—do not create empty tasks that pretend success.

### 11.3 Create non-Git task

Non-Git projects use the original directory directly, but `TaskCoordinator` must block a second active or retained parallel write task with a project-level write-task lock. Do not auto-copy directories or silently share a directory in parallel.

### 11.4 Send prompt

```text
IpcRouter
  → AgentCommandService(taskId)
  → task-scoped preflight
  → AgentScheduler
  → TaskRuntimeController.withReadyRuntime
  → PiRuntimeAdapter.prompt(preflightResult)
  → return PromptAcceptance as early as possible
  → PiEventAdapter
  → TaskEventStream commit
  → Renderer task projection
```

Background Promises must capture failures explicitly; failures after acceptance report via task events and safe error state.

### 11.5 Switch currently viewed task

```text
Renderer updates selectedTaskId
  → subscribe/resume target task stream
  → request target task snapshot
  → apply snapshot and replay cache
```

This flow does not call `RuntimeRegistry.replace`, change the scheduler, or abort the original task.

### 11.6 Sub-agents

The main agent requests sub-agents through spike-validated capability:

```text
Parent runtime request
  → SubagentCoordinator validates task/parent/worktree
  → AgentScheduler acquires task/global slot
  → create child agent identity
  → route child events to the same task stream
  → parent agent waits or continues
```

Aborting individually targets only that child; aborting the main task cascades to all unfinished children.

### 11.7 Extension UI

```text
Runtime extension request
  → ExtensionUiCoordinator generates requestId
  → bind projectId/taskId/agentId/runtimeId/generation
  → task enters waiting; catalog shows persistent marker
  → Renderer dialog / Linux notification
  → user responds
  → Main validates request scope and incarnation
  → resolve corresponding Promise
```

Duplicate, late, or wrong-source responses must be rejected. Abort, runtime replacement/crash, task delete, window close, application exit, and timeout must end pending Promises and settle only once.

### 11.8 Exit and restart

On exit:

1. stop accepting new commands and new scheduling;
2. snapshot current task state and establish bounded cleanup context;
3. cancel all main agents and cascade sub-agents;
4. settle extension/trust/request pending operations;
5. flush controlled follow-ups and task metadata;
6. unsubscribe, dispose, or terminate all runtime hosts;
7. flush settings and redacted diagnostics;
8. after timeout, log remnants and exit—do not wait indefinitely.

On restart, mark previously running, queued, waiting, or aborting tasks as interrupted; revalidate session, worktree, Git, and metadata facts. Do not automatically continue models, commands, or sub-agents.

## 12. Project Trust

Project trust binds stable `projectId` and canonical raw project path, not internal worktree paths.

Main must reproduce the following semantics through pinned pi version public API:

- check `.pi/settings.json`, project extension/skill/prompt/theme/system prompt, project packages, and project `.agents/skills`;
- saved decisions match by canonical path and parent paths;
- user/global and CLI extensions may participate in `project_trust`;
- "load and remember" and "do not load project resources" use the pi trust store;
- "load this time only" exists only in Main's project-scoped process registry;
- upstream context file loading semantics must not be misdescribed as a trust sandbox;
- do not parse or rewrite `trust.json` independently.

After a project resource decision changes, only new or rebuilt runtimes are affected; do not hot-swap a running runtime. When creating a task worktree runtime, apply the raw project decision explicitly; do not leave independent persistent trust records for the worktree.

Whether public API is sufficient for this flow is a pre-implementation spike; if not, push for supported interfaces or adjust the plan—do not depend on private `../pi` paths.

## 13. Worktree and task result lifecycle

### 13.1 Worktree creation

`WorktreeManager` is responsible for:

- checking Git availability and repo identity;
- default base: raw workspace `HEAD` at task creation;
- recording immutable base commit;
- creating managed worktree and unique identity;
- locking concurrent lifecycle operations for the same task;
- validating external delete, move, corruption, or ref changes;
- reconfirming task, runtime, and result state before delete.

Tasks may be created when the raw workspace has uncommitted changes, but do not auto-stash, commit, copy, or modify those changes; UI must explain the task does not see them.

### 13.2 Result revision

Task results are defined as `base commit → current worktree file state`, including commits within the task and uncommitted changes. `TaskResultService` computes a stable `resultRevision` and associates:

- file manifest and full diff;
- validation records;
- target workspace/ref state;
- review time and applicability.

After worktree, target ref, target workspace, or file state changes, old review, validation, and applicable state invalidate immediately.

### 13.3 Apply

The first release allows whole-item apply only. `ResultApplicationService` must:

1. preflight target repo, workspace, cleanliness, base, target ref, worktree, and `resultRevision`;
2. generate an explicit plan for supported change types;
3. create a persistent journal before writes;
4. stop safely on conflict, permission, disk, or unsupported type;
5. leave no undeclared conflict markers;
6. after restart, recognize pending/unknown/completed journals;
7. mark applied only after verifiable completion;
8. retain the worktree until the user confirms cleanup.

Do not promise cross-file absolute atomicity until specific Git algorithms, renames, binaries, modes, symlinks, submodules, LFS, sparse checkout, and fault-injection tests are complete.

### 13.4 Discard

Discard is a separate irreversible use case:

- stop and clean task runtime and sub-agents first;
- show project, task, worktree, and change summary;
- require second confirmation;
- delete unapplied results and worktree;
- on delete failure, keep recoverable records and provide diagnostics;
- do not modify content already applied to the target workspace.

## 14. Attachments, credentials, and Extension UI

### 14.1 Credentials

Credential persistence facts are managed by pi `ModelRuntime`/credential store. Desktop coordinates only:

- authentication state without secrets;
- one-shot API key submission;
- OAuth start, cancel, and timeout;
- logout;
- after `CredentialSynchronizationError`, re-query state instead of blindly retrying mutation.

Secrets must not enter Renderer persistence, ordinary logs, notifications, errors, or telemetry.

### 14.2 Attachments

`AttachmentService` owns short-lived tokens. A token binds at least:

- window;
- project/task;
- target message draft;
- allowed file identity and metadata;
- expiry and consumption state.

After authorization via system picker or approved drag-drop/paste, Main revalidates file type, size, readability, regular file attributes, post-selection changes, and model capability. Renderer holds only metadata and tokens.

The first release may accept generic files at the product entry, but only types with explicit conversion semantics may be sent: images to upstream image content; limited text by encoding and size to message content; PDF, office documents, archives, and other binaries are explicitly rejected until a safe parsing approach exists. Attachments are not copied into worktrees and are not reused across tasks/messages.

### 14.3 Extension UI

The first-release domain contract covers `select`, `confirm`, `input`, `editor`, and `notify`. All extension text is untrusted plain text; do not execute HTML, scripts, or remote UI. Blocking requests are ordered deterministically per task and tie to agent waiting state, project tree markers, and notifications.

## 15. Renderer state architecture

RendererStore splits into:

### 15.1 Catalog projection

- project summaries;
- task summaries;
- running/queued/waiting/failed/interrupted/review counts;
- unread and pending requests;
- aggregated usage;
- last applied catalog sequence.

### 15.2 Per-task projection

Each loaded task stores independently:

- current runtimeId/generation;
- last task sequence;
- completed messages;
- transient text/thinking/tool streaming state;
- agent tree;
- follow-up and scheduler state;
- model snapshot and usage;
- validation and result details;
- out-of-sync, loading, and error state.

### 15.3 UI-only state

- selected project/task;
- composer draft;
- attachment metadata/token references;
- focus, panels, expand state;
- uncommitted settings edits.

UI-only state must not impersonate Main authoritative state. Optimistic queue, runtime, result, or apply state may exist only as temporary visual feedback until confirmed by Main event/snapshot.

High-frequency deltas use fine-grained subscriptions; do not cause uncontrolled movement of composer, navigation, or task details via broad React Context. Specific store library is chosen at implementation time.

## 16. Persistence and recovery

### 16.1 pi-managed

Continue to be managed by pi public API:

- session JSONL;
- authentication and model catalog;
- pi settings;
- trust store;
- extension, skill, prompt, theme, and context resources.

Desktop does not parse or rewrite session JSONL, `auth.json`, or `trust.json` for business features.

### 16.2 pi-desktop-managed

Application storage controlled by Main includes at least:

- project identity and canonical raw workspace;
- task identity, name, and session reference;
- worktree identity/path, base commit, target workspace/ref;
- runtime recoverable metadata, not SDK instances;
- agent, validation, and result lifecycle state;
- `resultRevision` and apply/discard journals;
- controlled unexecuted follow-up content, order, model snapshots, and paused state;
- window geometry and non-sensitive preferences;
- non-sensitive state needed for notification deduplication.

Unexecuted follow-ups are user content, not ordinary metadata: store in a Main-controlled, permission-restricted dedicated area with execute, clear, and delete-on-permanent-task-delete lifecycle, and do not enter logs, notifications, or diagnostic summaries. If this cannot be implemented safely, narrow restart recovery commitments.

### 16.3 Recovery principles

Cache is not truth. On recovery, revalidate:

- project/workspace paths;
- repo identity, worktree, and base commit;
- session recoverability;
- target workspace/ref;
- apply journals;
- revisions corresponding to results and validation.

Partial corruption must not delete still-recoverable sessions, worktrees, or results. Unrecoverable tasks enter explicit error state with review, apply, discard, or manual recovery paths.

## 17. Lifecycle and cleanup

### 17.1 Scope

All long-lived resources belong explicitly to:

- application scope;
- window scope;
- project scope;
- task scope;
- runtime incarnation scope;
- agent scope;
- request/message scope.

Owners implement cleanup details; Lifecycle/Coordinator decides trigger order. Do not use hidden global event buses for modules to guess cleanup timing.

### 17.2 Cleanup matrix

| Trigger | Resources that must be handled | Coordinator |
| --- | --- | --- |
| runtime replacement | incarnation requests, extension UI, subscription, SDK runtime | `TaskRuntimeController` |
| child agent abort | child scheduler slot, child operation, child pending UI | `SubagentCoordinator` |
| main task abort | main run, all children, paused follow-up state, pending UI | `TaskCoordinator` |
| task delete/discard | runtime, requests, attachments, worktree, task record | `TaskCoordinator` / `ResultApplicationService` |
| window close | window IPC requests, trust/extension dialogs, attachment tokens, event targets | `ApplicationLifecycle` |
| runtime crash | incarnation, pending responses, scheduler slot, task status | `TaskRuntimeController` |
| application exit | all tasks/runtimes, pending requests, store flush, diagnostics | `ApplicationLifecycle` |

Each cleanup method must be idempotent; continue cleaning other participants after one fails; aggregate failures go only to redacted diagnostics. Pending Promises settle only once.

## 18. Security and permissions

### 18.1 Electron security baseline

The main window must enable at least:

- `nodeIntegration: false`;
- `contextIsolation: true`;
- `sandbox: true`;
- `webSecurity: true`;
- strict CSP in production;
- do not load remote application code;
- reject arbitrary window creation and remote page navigation;
- external links: allowlisted protocol check then system browser;
- reject `javascript:` and arbitrary external `file:` navigation.

### 18.2 IPC

- register only fixed allowlist commands;
- Main treats input as `unknown` and narrows with schema;
- commands explicitly carry required project/task/request identity;
- validate calling window, resource scope, and current runtime incarnation;
- do not provide generic execute, readFile, invoke, or host method interfaces;
- all long requests support cancellation or timeout;
- cross-process errors return only stable error codes, user messages, recoverability, and optional diagnostic ID.

### 18.3 Untrusted content

Markdown, HTML, model output, tool/terminal output, diffs, paths, links, extension text, and attachment metadata are untrusted. Forbid arbitrary script execution; restrict external navigation; handle ANSI, very long unbroken text, and encoding-obfuscated links correctly.

### 18.4 Worktree and trust are not sandboxes

Worktrees only prevent task results in pi-desktop's default working directories from directly polluting the raw workspace; absolute paths, symlinks, extensions, shell, and child processes may still access other user-writable locations. True isolation requires containers, VMs, micro-VMs, or OS sandboxing.

## 19. Errors, diagnostics, and notifications

User-visible errors must state:

- the failed operation;
- whether task/worktree/result is safe;
- whether recovery is possible;
- next steps;
- `diagnosticId` when needed.

`DiagnosticReporter` does not log full prompts, file/attachment content, environment variables, credentials, authentication files, full IPC payloads, or sensitive full paths. Raw cause does not cross process boundaries.

Linux notifications are only for background task waiting, failed, and user-enabled completed states; content is redacted and deduplicated and carries verifiable project/task/request deep-link identity. When notifications are unavailable, persistent project tree state remains the authoritative entry.

## 20. Recommended implementation layout

```text
src/
├── main/
│   ├── bootstrap/
│   ├── window/
│   ├── ipc/
│   ├── application/
│   ├── projects/
│   ├── tasks/
│   ├── scheduler/
│   ├── runtime/
│   ├── pi/
│   ├── git/
│   ├── worktrees/
│   ├── results/
│   ├── trust/
│   ├── credentials/
│   ├── attachments/
│   ├── extensions/
│   ├── persistence/
│   ├── notifications/
│   ├── preferences/
│   ├── diagnostics/
│   └── platform/
├── preload/
├── renderer/
│   ├── app/
│   ├── store/
│   ├── features/
│   └── components/
├── shared/
│   ├── contracts/
│   └── domain/
└── tests/
    ├── fixtures/
    ├── fakes/
    ├── contracts/
    └── helpers/
```

The layout expresses dependencies and reasons for change; it does not require one class per file. Split files only to remove duplication, isolate external change, or express explicit ownership.

## 21. Build and packaging constraints

Technical direction is Electron + React + Vite + TypeScript strict. Package manager, Forge/Vite combination, and release makers still require a build ADR; the current proposal continues to prioritize validating npm + Electron Forge/Vite.

Pin exact versions for all direct dependencies and commit the lockfile. Production builds must not reference `../pi`. After pinning pi version, verify Electron's built-in Node.js meets its minimum requirement.

The scaffold phase must complete a packaged spike:

```text
Package Electron
  → start production main
  → check process.versions.node
  → import pinned pi SDK or start bundled runtime
  → create minimal runtime without calling real models
  → verify ESM / assets / WASM / native dependency / ASAR
  → dispose or terminate cleanly
```

Configure unpack only for resources that truly cannot live in ASAR; do not disable entire ASAR by default. First Linux artifacts currently prioritize RPM and deb evaluation; release format needs separate confirmation and does not affect core module boundaries.

## 22. Testing and automation boundaries

### 22.1 Static constraints

- Renderer must not import Electron, Node.js, pi SDK, or Main;
- Shared must not import any process implementation or high-privilege dependency;
- only corresponding adapter directories in Main import pi SDK, Git/Electron high-privilege implementations;
- IPC input must have TypeScript types and runtime schema;
- events, state, and results use discriminated unions with exhaustive handling;
- forbid `any` and undeclared dynamic channels.

### 22.2 Contract and unit tests

Cover at least:

- SDK event to domain event mapping for text/thinking/tool/queue/retry/compaction;
- same tool ID does not cross wires under different task/agent;
- per-task generation, runtimeId, and sequence;
- catalog/task snapshot linearization and gap recovery;
- rebind after session replacement and drop old events;
- scheduler limits, cancellation, priority, starvation, and deadlock prevention;
- project trust remembered/once/declined and worktree reuse;
- attachment forgery, change, expiry, and cross-task replay;
- extension UI duplicate/late responses and all cleanup paths;
- task store corruption and partial recovery;
- worktree create/lock/external delete;
- `resultRevision` invalidation;
- apply journal disk, permission, and process-exit fault injection;
- secret scanning in logs, notifications, errors, and snapshots.

### 22.3 UI and E2E

Use fake providers, fixtures, or mock runtime—no real keys, paid models, or unstable services. Cover key acceptance scenarios from product requirements, especially:

- cross-project parallelism;
- same-project worktree isolation;
- non-Git parallel rejection;
- background tasks keep running;
- sub-agent observation and abort;
- follow-up and abort;
- background extension requests;
- result review, apply blocks, and discard;
- exit, interrupted recovery, and partial corruption;
- multi-task event isolation;
- keyboard, focus, narrow layout, and untrusted content.

### 22.4 Packaging tests

Before CI and release, verify with the same scripts as `package.json`:

- production bundle starts;
- runtime backend create and cleanup;
- app data paths;
- Electron sandbox;
- RPM/deb install, start, and uninstall;
- safe failure without credentials.

## 23. Implementation order and quality gates

Advance by vertical outcomes, not by creating empty implementations from a module checklist.

### Phase 0: Close architecture blockers

- runtime process-hosting ADR and spike;
- consumer-owned runtime ports;
- catalog/task sequence and snapshot commit contract;
- task/runtime/worktree/pending resource cleanup matrix;
- sub-agent integration spike;
- apply algorithm and journal spike;
- build and packaging baseline decision.

Exit: critical security, ownership, concurrency, and lifecycle rules are implementable.

### Phase 1: Secure shell

- Electron/React/TypeScript scaffold;
- secure window, Preload, IPC schema, and error model;
- import boundaries, test framework, and packaged SDK spike;
- empty project/task catalog UI.

### Phase 2: Single-task runtime loop

- fake provider;
- project open/trust;
- one Git task worktree;
- prompt, text stream, abort, dispose;
- task snapshot/event handoff.

### Phase 3: Task registry and multi-task

- multi-project and multi-task registry;
- per-task runtime, event, Renderer projection;
- background run and current task switch;
- scheduler top-level limits;
- exit and interrupted recovery.

### Phase 4: Session, Queue, Tools, and Models

- session create/restore/switch/fork;
- tool lifecycle;
- steer/follow-up with message-level configuration;
- model/auth;
- attachments.

### Phase 5: Sub-agent and interaction

- sub-agent protocol and multilevel scheduler;
- agent tree;
- extension UI;
- notifications;
- usage aggregation.

### Phase 6: Results closure

- diff/result revision;
- validation records;
- review;
- apply journal and abnormal recovery;
- discard and worktree cleanup.

### Phase 7: Release closure

- complete Markdown/code/diff UI;
- accessibility and narrow layout;
- packaging, install smoke, known limits, and release checklist.

Each slice must meet Definition of Ready and `AGENTS.md` completion criteria, and sync code, tests, and docs at the end.

## 24. Open architecture decisions

These remain gates before corresponding implementation:

1. **Runtime host**: SDK in Electron Main vs utility/child process;
2. **Sub-agent integration**: whether pinned pi version exposes enough public capability, or what compatibility-guarded custom tool/runtime protocol to use;
3. **Build baseline**: whether npm + Electron Forge/Vite is formally accepted;
4. **Task persistence**: storage implementation, schema version, permissions, and migration/corruption strategy;
5. **Apply algorithm**: supported Git change types, journal state machine, and recovery guarantees;
6. **Packaging**: specific makers and verification matrix for first RPM/deb;
7. **Attachment spec**: concrete allowlist, encoding, size, count, and total limits.

Each needs an owner, spike, acceptance criteria, and decision timing. Unclosed items must not be described in docs or UI as implemented capability.

## 25. Architecture readiness criteria

Before large-scale implementation, each question below must have a unique answer:

- Who owns project, task, and runtime registries?
- Who owns each task's runtime incarnation and generation?
- Who assigns catalog and task sequences?
- Where are snapshots and events linearized?
- Who owns scheduler slots, follow-up queue, and sub-agent tree?
- Who may import the pi SDK directly?
- How does project trust apply across multiple worktrees?
- How are task, session, and worktree persisted and recovered?
- Who creates, validates, locks, and deletes worktrees?
- Who computes `resultRevision` and who runs apply/discard journals?
- Who triggers cleanup for runtime replacement, task abort, window close, and app exit?
- Why does one task out of sync or crashing not pollute or freeze other tasks?
- Which commitments are automatically verified by fake, contract, E2E, and packaged smoke tests?

When one resource has two competing owners, one module changes for unrelated reasons, or a security boundary relies only on implementer memory, the architecture is not yet implementable.

## 26. References

### In repository

- [`../../AGENTS.md`](../../AGENTS.md)
- [`../product-requirements.md`](../product-requirements.md)
- [`../archive/module-structure.md`](../archive/module-structure.md) (archived)
- [`../architecture-review-guide.md`](../architecture-review-guide.md)
- [`../desktop-framework-options.md`](../desktop-framework-options.md)
- [`../document-conventions.md`](../document-conventions.md)

### Upstream pi (reference commit `e5d18382a207a4b108d97f7cc97abdc90a23d32d`)

- `../pi/packages/coding-agent/docs/sdk.md`
- `../pi/packages/coding-agent/docs/security.md`
- `../pi/packages/coding-agent/docs/extensions.md`
- `../pi/packages/coding-agent/docs/session-format.md`
- `../pi/packages/coding-agent/examples/sdk/13-session-runtime.ts`

### External

- [Electron process model](https://www.electronjs.org/docs/latest/tutorial/process-model)
- [Electron security recommendations](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)

