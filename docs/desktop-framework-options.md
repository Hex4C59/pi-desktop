# pi-desktop Desktop Framework and TypeScript Build Options Research

English | [中文](desktop-framework-options.zh.md)

- Type: Reference
- Status: Accepted
- Researched: 2026-09-17
- Last reviewed: 2026-09-19
- Project: pi-desktop
- Product scope: Linux pi desktop client
- Authority: desktop framework and TypeScript build option research conclusions and comparison
- Current state: Electron + React + Vite + TypeScript selected for the first release; application scaffold not yet established
- Architecture proposal: [`architecture/electron-architecture.md`](architecture/electron-architecture.md)

## 1. Research goals

This research compares three desktop application approaches to inform pi-desktop’s choice of desktop framework and TypeScript build stack. Key factors:

- How pi SDK integrates
- Boundaries between renderer/UI and a high-privilege host
- Streaming messages, tool calls, session management, and abort
- Linux development and release experience
- TypeScript coverage and developer efficiency
- Installer size, memory use, and long-term maintenance cost

## 2. Project constraints and known facts

### 2.1 pi integration constraints

The official pi SDK package is `@earendil-works/pi-coding-agent`. The SDK ships inside that package; a separate SDK package is not required. The SDK targets a Node.js host. Main capabilities include:

- `createAgentSession`
- `createAgentSessionRuntime`
- `AgentSessionRuntime`
- `ModelRuntime`
- `SessionManager`
- `SettingsManager`
- Streaming event subscription
- Tool, extension, skill, and prompt template loading

pi SDK documentation recommends:

- Prefer the SDK in the same Node.js process when type safety and direct access to agent state are needed;
- Use `pi --mode rpc` when process isolation or language-agnostic integration is required.

Therefore, whether pi SDK can run directly in a Node.js host is a major factor in framework selection.

### 2.2 Process boundaries

Regardless of the desktop framework chosen, keep this layering:

```text
Renderer/UI
    ↓ typed, validated IPC
Desktop host
    ↓ Pi adapter
Pi runtime
```

The renderer must not receive:

- Node.js APIs
- Shell or arbitrary command execution
- Arbitrary file read/write
- Provider credentials
- pi SDK types and internal objects

The desktop host is responsible for:

- pi runtime lifecycle
- IPC input validation
- Session and cwd coordination
- Credential operations
- Child process management
- Subscription cleanup and error recovery

### 2.3 Current machine environment

The current development machine already has:

- Fedora Linux 44 KDE
- Node.js `22.23.1`
- npm `10.9.8`
- Git
- pi CLI `0.85.1`
- Upstream source `../pi` in a sibling directory

The project itself does not yet have `package.json`, dependencies, build scripts, or an application scaffold. Production builds must not depend on the local `../pi` directory; pin pi versions through npm dependencies and a lockfile.

## 3. Option 1: Electron + React + Vite + TypeScript

### 3.1 Suggested architecture

```text
Electron main process
  ├── pi SDK
  ├── AgentSessionRuntime
  ├── ModelRuntime
  ├── File, process, credential, and persistence coordination
  └── Typed IPC
        ↓
preload
        ↓
React renderer + Vite + TypeScript
```

The Electron main process runs in Node.js, so pi SDK can be imported and run directly. Preload exposes a filtered API through `contextBridge`; the renderer uses only project-defined narrow interfaces.

### 3.2 Advantages

1. **Best fit for direct pi SDK integration**

   pi SDK runs directly in the Electron main process without an extra Node.js sidecar or an RPC conversion layer. This makes `AgentSessionRuntime`, `ModelRuntime`, `SessionManager`, and pi streaming events easiest to access.

2. **Mature desktop capabilities**

   Electron has mature support for:

   - Multiple windows
   - File pickers
   - Clipboard
   - System tray
   - Menus
   - Notifications
   - Child processes
   - Application lifecycle
   - Developer tools
   - Auto-update ecosystem

3. **Full-stack TypeScript**

   Main process, preload, renderer, pi adapter, IPC contracts, and tests can all use TypeScript without maintaining Rust or C++ host code.

4. **Most mature development and test ecosystem**

   React, Vite, Vitest, Playwright, and Electron Forge are a well-supported combination with ample documentation and community support.

5. **Suited to validating the core adapter first**

   The hardest part of this project is pi event and lifecycle semantics, not window creation. Electron reduces infrastructure variables so the project can prioritize validating:

   - Streaming text and thinking deltas
   - Tool call lifecycle
   - Authoritative values at message end
   - Steering/follow-up queues
   - Abort and cleanup
   - Session replacement
   - Project trust flow

### 3.3 Disadvantages

1. **Larger installer and memory footprint**

   Chromium and the Node.js runtime ship with the app, typically using more disk and memory than system-WebView approaches.

2. **Very high host privileges**

   The Electron main process can access Node.js and system capabilities. If the renderer gains too much power, security risk increases sharply; preload and IPC must be designed strictly.

3. **Linux release needs extra planning**

   Choose and maintain release formats such as AppImage, deb, rpm, or Flatpak; plan auto-update, signing, and distro compatibility.

### 3.4 Required security configuration

Electron security guidance requires:

- `nodeIntegration: false`
- `contextIsolation: true`
- Renderer sandbox enabled
- Load only local code bundled with the app
- Do not expose full `ipcRenderer` to the renderer
- Expose operation-scoped APIs through preload
- Schema-validate IPC input in the main process
- Restrict external navigation and untrusted content loading

Treat pi model output, Markdown, command output, diffs, file paths, and extension UI as untrusted data.

### 3.5 TypeScript build approach

Recommended stack:

- React
- Vite
- Electron Forge
- `@electron-forge/plugin-vite`
- TypeScript strict mode
- Vitest
- Playwright or Electron end-to-end tests

Electron Forge provides Vite + TypeScript templates to build separately:

- Main process
- Preload script
- Renderer

Note: Electron Forge’s Vite plugin is currently marked experimental by upstream; check release notes and config compatibility on upgrades.

Recommended directory layout:

```text
src/
├── main/
│   ├── main.ts
│   ├── ipc/
│   └── pi-runtime/
├── preload/
│   ├── preload.ts
│   └── api.ts
├── renderer/
│   ├── App.tsx
│   ├── components/
│   └── state/
├── shared/
│   └── ipc-contract.ts
└── tests/
```

### 3.6 Fit assessment

**Best fit for the current project.**

If the goal is the first usable release as soon as possible, Electron is the lowest-risk, lowest pi integration cost option.

## 4. Option 2: Tauri 2 + React + Vite + TypeScript

### 4.1 Suggested architecture

```text
Tauri Rust core
  ├── Windows, permissions, and system APIs
  ├── Typed IPC
  └── Node.js sidecar or pi RPC child process
        ↓
System WebView/WebKitGTK
        ↓
React renderer + Vite + TypeScript
```

Tauri’s Rust core manages windows and system capabilities; the frontend renders through the system WebView. On Linux it uses WebKitGTK; the final app does not bundle full Chromium.

### 4.2 Advantages

1. **Usually smaller installer and memory footprint**

   Tauri uses the system WebView instead of shipping full Chromium.

2. **Clearer boundary between host and renderer**

   The core process holds full system privileges; the WebView can invoke only explicitly allowed capabilities over IPC.

3. **Suited to a lightweight long-lived Linux client**

   For apps that stay resident, lower runtime overhead has practical value.

4. **Good Linux packaging support**

   Tauri CLI can produce:

   - AppImage
   - deb
   - rpm

   Ecosystem and release docs also cover Flatpak, Snap, AUR, and other Linux distribution paths.

### 4.3 Disadvantages

1. **Complex pi SDK integration**

   pi SDK is a Node.js SDK and cannot run directly in the Rust core. Common approaches:

   - Package Node.js runtime and pi adapter as a sidecar; or
   - Launch `pi --mode rpc` and speak JSONL.

   Extra work includes:

   - Sidecar binary packaging
   - Target platform and CPU architecture handling
   - Process start and exit
   - stdout/stderr separation
   - Request timeouts
   - Early child exit
   - RPC message ordering and correlation
   - Version upgrades

2. **Introduces Rust/Cargo**

   The team maintains Rust toolchain, Cargo dependencies, Tauri config, Rust commands, and TypeScript IPC types.

3. **Depends on system WebView**

   On Linux, watch WebKitGTK version, GTK environment, Wayland/X11, fonts, input methods, and system Web API differences.

4. **More complex build environment**

   Tauri recommends older compatible baselines for Linux packages (for example Ubuntu 22.04 or Debian 12) to avoid depending on too-new glibc in shipped binaries. Prefer container or CI builds over the dev machine alone.

### 4.4 TypeScript build approach

Frontend recommendations:

- React
- Vite
- TypeScript strict mode
- Vitest
- Playwright

Typical script shape:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  }
}
```

Tauri configures frontend dev and production builds:

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  }
}
```

pi integration can be designed as:

```text
Tauri Rust core
  ↓
Node.js pi adapter sidecar
  ↓
@earendil-works/pi-coding-agent
```

Or:

```text
Tauri Rust core
  ↓
pi --mode rpc
  ↓
JSONL RPC adapter
```

### 4.5 Fit assessment

**Strong for long-term productization, higher initial cost than Electron.**

If installer size, memory, and stronger host boundaries are priorities—and the team accepts Rust plus sidecar/RPC—Tauri 2 is attractive.

## 5. Option 3: Neutralinojs + React + Vite + TypeScript

### 5.1 Suggested architecture

```text
Neutralinojs C++ backend
  ├── System WebView
  ├── Native API
  └── WebSocket IPC
        ↓
React renderer + Vite + TypeScript
        ↓
Node.js sidecar or pi RPC child process
```

Neutralinojs uses a C++ backend, system WebView, built-in static server, and WebSocket communication. The frontend calls restricted native APIs through `@neutralinojs/lib`.

### 5.2 Advantages

1. **Light runtime and package**

   Neutralinojs does not ship full Chromium and Node.js; it uses the OS WebView.

2. **Simple TypeScript frontend development**

   React, Vite, TypeScript, and HMR work like a typical web app.

3. **Straightforward basic native APIs**

   APIs cover filesystem, window, clipboard, environment variables, system commands, notifications, storage, and similar capabilities.

4. **Suited to lightweight tools and prototypes**

   For simple, size-sensitive desktop apps, Neutralinojs has lower adoption cost.

### 5.3 Disadvantages

1. **Smaller ecosystem**

   Compared with Electron and Tauri, Neutralinojs has fewer plugins, debugging tools, documentation, and long-term maintenance experience.

2. **Still cannot run pi SDK directly**

   Like Tauri, pi SDK needs a Node.js sidecar or RPC child process—no Electron-style same-process advantage.

3. **Complex IPC must be designed in-house**

   This project must transport and correlate many structured events:

   - Streaming text and thinking deltas
   - Tool execution start/update/end
   - Message start/end
   - Queue updates
   - Compaction
   - Retry
   - Session replacement
   - Abort
   - Runtime crash

   Neutralinojs’s basic WebSocket API does not solve domain event modeling, request correlation, timeouts, retries, or cancellation.

4. **System WebView compatibility remains**

   It still depends on the Linux system WebView; rendering differences across distros are not eliminated.

5. **Complex desktop product needs more infrastructure**

   This is not a simple CRUD app but a high-privilege agent runtime developer tool with streaming protocols, session trees, and extensions. Neutralinojs requires more self-built infrastructure.

### 5.4 TypeScript build approach

Recommended:

- React
- Vite
- TypeScript strict mode
- `@neutralinojs/lib`
- `neu` CLI
- Neutralinojs Vite integration or compatible plugins

Control native APIs through an allowlist, for example:

```json
{
  "nativeAllowList": [
    "app.*",
    "window.*",
    "filesystem.*",
    "clipboard.*"
  ]
}
```

### 5.5 Fit assessment

**Suited to lightweight prototypes; not recommended as the primary production base for this project.**

It cannot run pi SDK directly and lacks mature desktop ecosystem compared with Electron and Tauri. Do not prioritize it unless package size and resource use are overriding constraints.

## 6. Cross-option comparison

| Dimension | Electron | Tauri 2 | Neutralinojs |
| --- | --- | --- | --- |
| Direct pi SDK integration | Best: same Node.js host | Node sidecar or RPC required | Node sidecar or RPC required |
| TypeScript coverage | Full stack TypeScript | Frontend TypeScript; Rust host | Frontend TypeScript; C++ host |
| Startup cost | Lowest | Medium | Lower |
| Desktop ecosystem | Most mature | Mature | Smaller |
| Installer size | Larger | Smaller | Very small |
| Memory use | Higher | Lower | Lower |
| IPC complexity | Medium | High | High |
| Linux release | Mature | Mature | Usable but fewer tools |
| Renderer security boundary | Strict config required | Clearer default boundary | Design and audit required |
| Fit for current project | Highest | Higher | Medium-low |

## 7. TypeScript toolchain recommendations

Regardless of desktop framework, unify these TypeScript principles:

- Enable `strict` type checking
- Use Vite for renderer builds
- Use React for desktop UI
- Use Vitest for unit and adapter tests
- Use Playwright or similar tools for critical UI flows
- Use npm and `package-lock.json` unless the project explicitly chooses another package manager later
- Pin pi SDK as a formal npm dependency at an explicit version
- Do not let production builds implicitly depend on local `../pi`
- Separate TypeScript config or entry points for main/host, preload, renderer, and shared contracts
- Use discriminated unions and schema validation for cross-IPC data
- Do not import pi SDK types in the renderer; use project-internal serializable domain types

## 8. Recommended conclusion

### First choice: Electron + React + Vite + TypeScript

Reasons:

1. Matches pi SDK’s Node.js runtime model completely;
2. Avoids solving sidecar or RPC engineering first;
3. Lets the project prioritize validating pi adapter events, tools, sessions, and cancellation semantics;
4. Full-stack TypeScript with lowest learning and maintenance cost;
5. Most mature Electron desktop capabilities, test ecosystem, and documentation;
6. Meets project security boundaries through strict preload, sandbox, and allowlisted IPC.

### Second choice: Tauri 2 + React + Vite + TypeScript

When:

- Package size and memory matter greatly;
- Rust/Cargo is accepted as a long-term stack;
- Node.js sidecar or RPC extra complexity is accepted;
- More time is invested in process management, build, and release pipelines.

### Not recommended as first choice: Neutralinojs

Neutralinojs suits lightweight prototypes but fits poorly for an app with:

- High-privilege agent runtime
- Complex streaming events
- Tool call lifecycle
- Session trees and session replacement
- pi extension mechanisms
- Multiple Linux release formats

## 9. Suggested decision order

Before finalizing the framework, validate in this order:

1. Pin pi SDK version and build a minimal Node.js adapter;
2. With fake provider or controlled stand-ins, validate streaming text, thinking, tool lifecycle, and abort;
3. Validate session replacement, queues, retries, compaction, and runtime crash cleanup;
4. Implement minimal preload + IPC boundary in Electron;
5. From measured package size and memory, assess whether migration to Tauri is worth it;
6. If choosing Tauri, decide sidecar versus `pi --mode rpc`;
7. Finally choose Linux release formats and CI build baselines.

Do not document a framework as finalized project stack before completing the above validation.

## 10. References

### pi

- [pi SDK documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sdk.md)
- [pi RPC documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/rpc.md)
- [pi security documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/security.md)
- [@earendil-works/pi-coding-agent npm package](https://www.npmjs.com/package/@earendil-works/pi-coding-agent)

### Electron

- [Electron process model](https://www.electronjs.org/docs/latest/tutorial/process-model)
- [Electron security recommendations](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron context isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Electron Forge Vite + TypeScript template](https://www.electronforge.io/templates/vite-+-typescript)
- [Electron Forge Vite plugin](https://www.electronforge.io/config/plugins/vite)

### Tauri

- [Tauri 2 architecture](https://v2.tauri.app/concept/architecture/)
- [Tauri 2 process model](https://v2.tauri.app/concept/process-model/)
- [Tauri Vite frontend configuration](https://v2.tauri.app/start/frontend/)
- [Node.js sidecar](https://v2.tauri.app/learn/sidecar-nodejs/)
- [Tauri Linux distribution](https://v2.tauri.app/distribute/)
- [Tauri AppImage and Linux build baselines](https://v2.tauri.app/distribute/appimage/)

### Neutralinojs

- [Neutralinojs documentation](https://neutralino.js.org/docs/)
- [Neutralinojs API overview](https://neutralino.js.org/docs/api/overview/)
- [Neutralinojs CLI](https://neutralino.js.org/docs/cli/neu-cli/)
