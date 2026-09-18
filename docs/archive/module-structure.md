# pi-desktop First-Release Module Design Index

English | [中文](module-structure.zh.md)

- Type: Module Design
- Status: Archived
- Recorded: 2026-09-18
- Archived: 2026-09-19
- Original phase: First usable release
- Superseded by: [First-Release Electron System Architecture](../architecture/electron-architecture.md)
- Archive index: [Archive README](README.md)
- Review method: [Software Architecture Review Guide](../architecture-review-guide.md)
- Authority: Historical first-release module boundaries, ownership, constraints, and test focus; not current implementation guidance

> This document and the detailed files under [`modules/`](modules/) are archived historical material. Their globally unique runtime, global generation/sequence, and single Renderer projection were superseded by the multi-task architecture. They do not participate in implementation decisions. For current system ownership, refer to [`../architecture/electron-architecture.md`](../architecture/electron-architecture.md). The modules described here have not been implemented.

## High-Level System Architecture Diagram

[![Proposed pi-desktop high-level system architecture](../assets/pi-desktop-architecture.svg)](../assets/pi-desktop-architecture.html)

> The architecture diagram strictly represents the first-release proposal in this document; the repository does not yet contain application source code. Select the image to open an interactive version with node search, path tracing, and theme switching. The maintainable source is [`../assets/pi-desktop-architecture.json`](../assets/pi-desktop-architecture.json).

## 1. Decomposition Principles

- Use one independent `.md` file to describe each major architecture module.
- Each module document must define at least its responsibilities, ownership, exclusions, dependencies, and testing focus.
- `RuntimeController` owns only the runtime; it does not absorb every runtime-related use case.
- Workspace, Session, Agent command, and Model concerns are orchestrated by separate application services.
- `RuntimeController` owns generation; `EventPublisher` owns sequence.
- Maintain one-way dependencies among Renderer, Preload, Main, and the pi SDK.
- Shared contracts are pure TypeScript and do not depend on Electron, Node.js, or the pi SDK.
- Decompose around independent reasons to change and resource ownership, not a mechanical "one function per file" rule.

## 2. Module Documents

### Main Application

- [`WorkspaceCoordinator`](modules/workspace-coordinator.md): orchestrates directory selection/opening, project trust, and runtime replacement use cases.
- [`SessionCoordinator`](modules/session-coordinator.md): session listing, creation, switching, forking, and renaming.
- [`AgentCommandService`](modules/agent-command-service.md): prompt, steer, follow-up, abort, and queue commands.
- [`ModelCoordinator`](modules/model-coordinator.md): model listing, selection, and thinking level.
- [`RuntimeQueryService`](modules/runtime-query-service.md): obtains a consistent runtime read view.
- [`RuntimeSnapshotBuilder`](modules/runtime-snapshot-builder.md): constructs Renderer snapshots.

### Runtime and pi Integration

- [`RuntimeController`](modules/runtime-controller.md): sole owner of the active runtime and atomic replacement boundary.
- [`RuntimeStateMachine`](modules/runtime-state-machine.md): defines and validates runtime state transitions.
- [`RuntimeEventSubscription`](modules/runtime-event-subscription.md): binds an SDK event source for a specific generation.
- [`EventPublisher`](modules/event-publisher.md): allocates sequence numbers and publishes domain events to the Renderer.
- [`PiRuntimeFactory`](modules/pi-runtime-factory.md): constructs pi runtime adapters.
- [`PiRuntimeAdapter`](modules/pi-runtime-adapter.md): maps the project runtime port to the SDK.
- [`PiEventAdapter`](modules/pi-event-adapter.md): converts SDK events into domain events.

### Privileged Main Capabilities

- [`ApplicationCompositionRoot`](modules/application-composition-root.md): creates module instances and connects dependencies.
- [`ApplicationLifecycle`](modules/application-lifecycle.md): coordinates startup, window lifecycle, and shutdown cleanup.
- [`SingleInstancePolicy`](modules/single-instance-policy.md): guarantees a single instance for the first release.
- [`MainWindow`](modules/main-window.md): creates and owns the secure main window.
- [`NavigationPolicy`](modules/navigation-policy.md): restricts navigation, new windows, and external links.
- [`WindowStateStore`](modules/window-state-store.md): persists window geometry.
- [`IpcRegistration`](modules/ipc-registration.md): registers fixed IPC handlers.
- [`IpcRouter`](modules/ipc-router.md): validates IPC schemas and dispatches commands.
- [`RequestScopeRegistry`](modules/request-scope-registry.md): manages cancellation relationships between requests and windows.
- [`DesktopErrorMapper`](modules/desktop-error-mapper.md): converts and redacts cross-process errors.
- [`ProjectTrustCoordinator`](modules/project-trust-coordinator.md): obtains project-trust outcomes.
- [`TrustPromptCoordinator`](modules/trust-prompt-coordinator.md): manages pending trust requests.
- [`Credentials`](modules/credentials.md): authentication state, API keys, OAuth, and logout.
- [`Attachments`](modules/attachments.md): image selection, validation, short-lived tokens, and consumption.
- [`Extension UI`](modules/extension-ui.md): extension interaction requests, responses, and cancellation.
- [`ApplicationPreferencesStore`](modules/application-preferences-store.md): persists non-sensitive application preferences.
- [`DiagnosticReporter`](modules/diagnostic-reporter.md): records redacted diagnostics.

### Preload and Renderer

- [`Preload Bridge`](modules/preload-bridge.md): fixed desktop API and snapshot/event initialization buffering.
- [`Renderer State`](modules/renderer-state.md): snapshot/event projection, streaming state, and out-of-sync recovery.
- [`Renderer Features`](modules/renderer-features.md): Conversation, Tools, Composer, Sessions, Models, and other UI features.

### Cross-Process Contracts

- [`Shared Contracts`](modules/shared-contracts.md): commands/results/events, schemas, snapshots, and serializable domain types.

## 3. Overall Dependency Direction

```text
Renderer Features
    ↓
Renderer State
    ↓
Preload Bridge
    ↓
IPC Transport
    ↓
Main Application Services
    ↓
Runtime Controller / Capability Services
    ↓
Pi SDK Adapter
    ↓
@earendil-works/pi-coding-agent
```

`src/shared` is a pure contract package shared by Main, Preload, and Renderer. It does not depend back on any process implementation.

## 4. Core Ownership

- Active runtime, generation, and the replacement critical section: `RuntimeController`.
- Event sequence: `EventPublisher`.
- Attachment tokens: `AttachmentService`.
- Pending extension requests: `ExtensionUiCoordinator`.
- Pending trust requests: `TrustPromptCoordinator`.
- Renderer state projection: `RendererStore`.
- Persistent facts for sessions, authentication, settings, resources, and the trust store: pi SDK.

## 5. Recommended Implementation Layout

```text
src/
├── main/
│   ├── bootstrap/
│   ├── window/
│   ├── ipc/
│   ├── application/
│   ├── runtime/
│   ├── pi/
│   ├── trust/
│   ├── credentials/
│   ├── attachments/
│   ├── extensions/
│   ├── preferences/
│   └── diagnostics/
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
```

The individual module documents govern specific file responsibilities, prohibited dependencies, and test boundaries.

## 6. Key Flows

### Open a Working Directory

```text
IpcRouter
  → WorkspaceCoordinator
  → ProjectTrustCoordinator
  → RuntimeController.replace
  → PiRuntimeFactory
  → RuntimeEventSubscription
  → RuntimeSnapshotBuilder / EventPublisher
  → RendererStore
```

### Send a Prompt

```text
IpcRouter
  → AgentCommandService
  → controlled session scope from RuntimeController
  → PiRuntimeAdapter
  → return PromptAcceptance promptly after preflight
  → PiEventAdapter
  → EventPublisher
  → RendererStore
```

### Switch Sessions

```text
IpcRouter
  → SessionCoordinator
  → RuntimeController.replace
  → tear down the old runtime/session
  → invalidate the old generation
  → create and install the new runtime/session
  → bind the new subscription and publish a complete snapshot
```

### Initialize the Renderer

```text
Preload listens for and buffers events first
  → RuntimeQueryService returns snapshot(generation, sequence)
  → RendererStore applies the snapshot atomically
  → replay only greater sequence values
  → switch to live consumption
```

## 7. Automation Boundaries

After scaffolding exists, linting, TypeScript, and tests should enforce that:

1. Renderer does not import Electron, Node.js, the pi SDK, or Main.
2. Shared does not import any process implementation or privileged dependency.
3. Within Main, only the pi adapter directory imports the pi SDK directly.
4. IPC input passes through a runtime schema.
5. SDK event adapters and Renderer reducers handle variants exhaustively.
6. Ordinary logs do not record prompts, file contents, environment variables, or credential payloads.
7. Replacement, window-close, and shutdown paths verify resource cleanup.

## 8. Completion Criteria

After these module designs are implemented, each of the following questions must have exactly one answer:

- Who owns the active runtime?
- Who increments generation?
- Who allocates sequence?
- Who may import the pi SDK directly?
- Who orchestrates workspace, session, and agent commands?
- Who owns pending attachment, trust, and extension requests?
- Who constructs snapshots, and who recovers from loss of synchronization?
- On window close, session replacement, and application shutdown, who triggers and performs cleanup?

If a resource has two competing owners, or a module changes frequently for multiple unrelated reasons, the corresponding module documents should be adjusted further.
