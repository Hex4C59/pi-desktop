# Multi-task module design index

English | [中文](README.zh.md)

- Type: Module Design
- Status: Accepted
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Applies to: first usable release implementation under the multi-task architecture
- Authority: module inventory, ownership summary, document status, and links to per-module designs; does not override [`architecture/electron-architecture.md`](../architecture/electron-architecture.md) §8
- Supersedes: [`../archive/module-structure.md`](../archive/module-structure.md) for **current** implementation decisions
- Related: [Product requirements §26](../product-requirements.md), [Architecture gates](../reference/architecture-gates.md), [`ACTIVE.md`](../../ACTIVE.md)

> **Do not implement from [`../archive/modules/`](../archive/modules/).** That set assumes a single active runtime and global generation routing. Use this index and architecture §8 owners instead.

## How to use

1. Find the **owner** for the resource you are changing (table below).
2. Open the module **Doc** link when status is `stub` or higher; expand interfaces only in work items that need contracts.
3. Check **Gate / ADR** before describing behavior as shipped.
4. For IPC and lifecycle work, read the stubs linked for WI-002 and multi-runtime cleanup early.

### Document status

| Status | Meaning |
|--------|---------|
| `planned` | Owner defined in architecture; no module file yet |
| `stub` | Responsibilities and test focus sketched; interfaces TBD |
| `draft` | Interfaces under active revision |
| `accepted` | Current implementation authority for that module |

## Core module table

Planned code paths follow [`architecture/electron-architecture.md`](../architecture/electron-architecture.md) §20. They are targets until the scaffold exists; adjust only with architecture or ADR update.

| Module ID | Owner | Owns (summary) | Must not (see also §8.2) | Arch | PRD | Gate / ADR | Planned code path | Doc |
|-----------|-------|----------------|---------------------------|------|-----|------------|-------------------|-----|
| `project-registry` | `ProjectRegistry` | Open projects, project-scoped context | Hold SDK runtimes | §8.1 | §4–§6 | — | `src/main/projects/` | planned |
| `task-registry` | `TaskRegistry` | Task record; task/session/worktree bindings | Hold SDK runtimes | §8–§9 | §4, §26 | `gate-task-persistence` | `src/main/tasks/` | [stub](task-registry.md) |
| `agent-scheduler` | `AgentScheduler` | Top-level and sub-agent slots and wait queues | Execute model calls; mutate follow-up queue | §8–§9 | §26 | `gate-sub-agent` | `src/main/scheduler/` | planned |
| `task-runtime-controller` | `TaskRuntimeController` | Per-task runtime slot, incarnation, generation | Orchestrate cross-task user use cases | §8–§9 | §26 | `gate-runtime-host` | `src/main/runtime/` (per task) | [stub](task-runtime-controller.md) |
| `runtime-registry` | `RuntimeRegistry` | Lookup controllers; app-level shutdown | Own worktrees or persistence facts | §8.1 | §26 | `gate-runtime-host` | `src/main/runtime/` | [stub](runtime-registry.md) |
| `runtime-event-subscription` | `RuntimeEventSubscription` | SDK subscription for one incarnation | Own business state | §8.1 | §26 | — | `src/main/runtime/`, `src/main/pi/` | planned |
| `task-event-stream` | `TaskEventStream` | Per-task sequence and projection commit | Replace catalog truth | §8.1 | §26 | — | `src/main/tasks/` | planned |
| `task-catalog-projection` | `TaskCatalogProjection` | Catalog sequence; project/task summaries | Per-task detailed streaming state | §8.1 | §6, §26 | — | `src/main/tasks/` | planned |
| `worktree-manager` | `WorktreeManager` | Worktree create, validate, lock, delete | Apply patches to target workspace | §8.1 | §4–§5, §26 | — | `src/main/worktrees/`, `src/main/git/` | planned |
| `task-result-service` | `TaskResultService` | Diff, validation, `resultRevision` | Apply changes directly | §8.1 | §26 | `gate-apply-journal` | `src/main/results/` | planned |
| `result-application-service` | `ResultApplicationService` | Apply/discard journal | Delete worktrees without explicit discard | §8.1 | §26 | `gate-apply-journal` | `src/main/results/` | planned |
| `attachment-service` | `AttachmentService` | Attachment tokens | — | §8.1 | §5, §26 | `gate-attachments` | `src/main/attachments/` | planned |
| `extension-ui-coordinator` | `ExtensionUiCoordinator` | Extension pending UI requests | — | §8.1 | §5, §26 | — | `src/main/extensions/` | planned |
| `trust-prompt-coordinator` | `TrustPromptCoordinator` | Trust pending requests | — | §8.1 | §5, §26 | `gate-project-trust-worktree` | `src/main/trust/` | planned |
| `request-scope-registry` | `RequestScopeRegistry` | IPC request cancellation scopes | — | §8.1 | §26 | — | `src/main/ipc/` | planned |
| `renderer-store` | `RendererStore` | Catalog and per-task UI projection | Main persistence truth | §8.1 | §6, §26 | — | `src/renderer/store/` | planned |
| `ipc-registration` | `IpcRegistration`, `IpcRouter` | Allowlisted IPC registration, schema validation, dispatch | Business state; arbitrary host execution | §6, §18 | §26 | — | `src/main/ipc/` | [stub](ipc-registration.md) |
| `application-lifecycle` | `ApplicationLifecycle` | Startup/shutdown; cleanup trigger order (window/exit) | Per-resource cleanup implementation details | §17 | §26 | `gate-runtime-host` | `src/main/application/`, `src/main/bootstrap/` | [stub](application-lifecycle.md) |

### Application orchestration (no separate stub yet)

User use cases in architecture §6.1 are orchestrated by application services (for example task/session commands, result review). **`TaskCoordinator`** coordinates task-level abort, delete, and non-Git write locks (architecture §9, §17); document detail will split from `TaskRegistry` when WI reaches task orchestration. **`SubagentCoordinator`** owns sub-agent orchestration (§17 cleanup matrix).

| Module ID | Owner | Planned code path | Doc |
|-----------|-------|-------------------|-----|
| `task-coordinator` | `TaskCoordinator` | `src/main/application/` or `src/main/tasks/` | planned |
| `subagent-coordinator` | `SubagentCoordinator` | `src/main/scheduler/` or `src/main/tasks/` | planned |

## Implementation order (pointer)

Follow architecture §23 (Phase 0 gates, then secure shell). Track gates in [`reference/architecture-gates.md`](../reference/architecture-gates.md). Current engineering queue: [`ACTIVE.md`](../../ACTIVE.md).

Suggested documentation order aligned with queued work: `ipc-registration` → `application-lifecycle` → `task-registry` / `runtime-registry` / `task-runtime-controller` (stubs exist) → expand others when gates close.

## Historical mapping (archive only)

| Current owner | Archive modules (do **not** implement as-spec) | Invalid assumption in archive |
|---------------|-----------------------------------------------|-------------------------------|
| `RuntimeRegistry`, `TaskRuntimeController` | `RuntimeController`, `RuntimeStateMachine` | Single global active runtime |
| `TaskCatalogProjection`, `RendererStore` | `RendererState`, `EventPublisher` | One Renderer conversation projection |
| `TaskEventStream` | `EventPublisher`, `RuntimeEventSubscription` | Global sequence for all tasks |
| `TaskRegistry`, `TaskCoordinator` | `SessionCoordinator`, `WorkspaceCoordinator` | Switch project/session replaces only background implicitly |
| `IpcRegistration`, `IpcRouter` | Same names under `archive/modules/` | IPC patterns may still help; verify against multi-task contracts |
| `ApplicationLifecycle` | `ApplicationLifecycle` | Cleanup matrix expanded for multi-task in architecture §17 |

When reuse archive text, copy **ideas** only after checking architecture §8–§9 and §17.

## Maintenance

- Add or rename a row only when architecture or an Accepted ADR changes owners.
- When a module doc reaches `accepted`, link it from this table and record the work item in `ACTIVE.md` Last session.
