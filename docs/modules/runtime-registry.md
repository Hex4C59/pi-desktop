# RuntimeRegistry

English | [中文](runtime-registry.zh.md)

- Type: Module Design
- Status: stub
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Owner: `RuntimeRegistry`
- Planned code path: `src/main/runtime/`
- Authority: lookup of all `TaskRuntimeController` instances; application-level runtime shutdown
- Architecture: [§8.1](../architecture/electron-architecture.md), [§8.2](../architecture/electron-architecture.md)
- Related: [`task-runtime-controller`](task-runtime-controller.md), [`application-lifecycle`](application-lifecycle.md)

## Responsibilities

- Register and lookup per-task `TaskRuntimeController` by stable task identity.
- Coordinate **application-wide** shutdown: iterate controllers, request abort/dispose, enforce timeouts per policy.
- Support queries needed for diagnostics and lifecycle (counts, unhealthy tasks) without exposing SDK types to Renderer.

## Exclusions

- Owning worktrees, task persistence, or catalog truth (`TaskRegistry`, `WorktreeManager`, `TaskCatalogProjection`).
- Executing user use-case orchestration (`TaskCoordinator` / application services).
- Global single active runtime (forbidden; multi-task parallel incarnations).

## Dependencies

- `ApplicationLifecycle` for exit triggers.
- Each `TaskRuntimeController` for per-slot lifecycle.
- `AgentScheduler` may need registry view for global concurrency limits (interface TBD).

## Test focus

- Multiple tasks: registry holds independent controllers; shutdown one does not remove others unless task deleted.
- Application exit: all controllers visited; partial failure still attempts remainder.
- No duplicate controller for same `taskId` after replacement rules.
- Registry does not leak SDK references across IPC boundary.

## Interfaces

TBD — registry API after multi-runtime scaffold and runtime-host ADR.

## Open questions

- Supervisor pattern if runtime moves to child process (`gate-runtime-host`).
- Relationship to archived `RuntimeController` (single active) — **do not** copy archive ownership model.
