# ApplicationLifecycle

English | [中文](application-lifecycle.zh.md)

- Type: Module Design
- Status: stub
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Owner: `ApplicationLifecycle`
- Planned code path: `src/main/application/`, `src/main/bootstrap/`
- Authority: application and window lifecycle coordination and cleanup **order**
- Architecture: [§17 Lifecycle and cleanup](../architecture/electron-architecture.md)
- Related: [`runtime-registry`](runtime-registry.md), [`task-runtime-controller`](task-runtime-controller.md), [gate `gate-runtime-host`](../reference/architecture-gates.md)

## Responsibilities

- Application startup: compose modules, single-instance policy, main window creation (with secure defaults).
- Decide **trigger order** for cleanup on window close and application exit (architecture §17.2).
- Invoke owners (`TaskRuntimeController`, `RuntimeRegistry`, coordinators, IPC scopes) without implementing their resource logic.
- Ensure cleanup is idempotent; continue after partial failures; aggregate failures to redacted diagnostics only.

## Exclusions

- Owning SDK runtimes, worktrees, or persistence files (delegate to listed owners).
- Per-task runtime replacement sequencing (`TaskRuntimeController`).
- User-visible product behavior definitions (PRD).

## Dependencies

- `RuntimeRegistry` for shutdown of all task runtimes.
- `IpcRegistration` / `RequestScopeRegistry` for window-scoped pending IPC.
- `ApplicationCompositionRoot` (planned) for wiring; name may align with archive pattern but multi-task wiring differs.

## Test focus

- Window close: pending trust/extension dialogs and attachment tokens cleaned per matrix.
- Application exit: all tasks/runtimes and store flush attempted; no silent hang past documented timeout (PRD bounded exit).
- Second exit/close does not double-free or throw uncaught.
- Background tasks: exit does not pretend graceful model completion; state persisted per persistence gate.

## Interfaces

TBD — lifecycle hooks and shutdown phases defined with scaffold and runtime-host ADR.

## Open questions

- Process model ADR (`gate-runtime-host`) affects child process supervision on exit.
- Interaction with single-instance second-window policy (see archive `SingleInstancePolicy` for ideas only).
