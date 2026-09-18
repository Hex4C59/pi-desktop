# TaskRuntimeController

English | [中文](task-runtime-controller.zh.md)

- Type: Module Design
- Status: stub
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Owner: `TaskRuntimeController` (one logical controller per top-level task slot)
- Planned code path: `src/main/runtime/` (per-task instances managed via `RuntimeRegistry`)
- Authority: task runtime slot, current incarnation, `runtimeId`, and generation
- Architecture: [§8.1](../architecture/electron-architecture.md), [§9.1–§9.2](../architecture/electron-architecture.md), [§17 cleanup](../architecture/electron-architecture.md)
- Related: [`runtime-registry`](runtime-registry.md), [`runtime-event-subscription`](README.md#core-module-table), [gate `gate-runtime-host`](../reference/architecture-gates.md)

## Responsibilities

- Run the runtime lifecycle for **one task slot**: lock slot, invalidate old incarnation, cancel scoped work, dispose old runtime, create/bind new runtime, install generation, commit task snapshot.
- On session replacement within the task: detach listeners, complete upstream replacement, rebind extensions, resubscribe (§9.2).
- On runtime crash: mark task state, release scheduler slot, coordinate cleanup matrix row for crash.
- Expose narrow port to application services; no cross-task orchestration.

## Exclusions

- Owning task catalog or project list (`TaskRegistry`, `TaskCatalogProjection`).
- Scheduling limits across tasks (`AgentScheduler`).
- Direct worktree or apply operations.

## Dependencies

- Consumer-owned runtime ports and `PiRuntimeFactory` / adapters (`src/main/pi/`).
- `RuntimeEventSubscription` and `TaskEventStream` for events and commits.
- `AgentScheduler` for slot acquisition/release.

## Test focus

- Replacement: old incarnation rejects new ops immediately; failed create does not advertise old runtime as healthy.
- Session replace: no duplicate listeners; events routed with correct generation.
- Abort and crash: cleanup idempotent; other tasks unaffected.
- Generation and `runtimeId` monotonicity per architecture event routing rules.

## Interfaces

TBD — runtime port and incarnation API after `gate-runtime-host` ADR and SDK spike.

## Open questions

- Same-process SDK vs. child/utility process (`gate-runtime-host`).
- Sub-agent runtime relationship (`SubagentCoordinator`, `gate-sub-agent`).
