# IpcRegistration and IpcRouter

English | [中文](ipc-registration.zh.md)

- Type: Module Design
- Status: stub
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Owner: `IpcRegistration`, `IpcRouter` (fixed allowlist surface)
- Planned code path: `src/main/ipc/`; preload: `src/preload/`
- Authority: IPC registration, schema validation, and dispatch boundaries for this module pair
- Architecture: [§6 layering](../architecture/electron-architecture.md), [§18 security](../architecture/electron-architecture.md)
- Related: [`request-scope-registry`](README.md#core-module-table) (cancellation), [security playbook](../guides/agent/security.md), [ipc-channels contract](../reference/ipc-channels.md) (`Planned` until WI-002)

## Responsibilities

- Register a **fixed** set of IPC channels/handlers; no dynamic or generic host execution API.
- Validate every inbound message in Main with TypeScript types and runtime schema.
- Route validated commands to application services; return serializable results and errors.
- Coordinate with `RequestScopeRegistry` for cancellation and window lifecycle (details TBD in WI-002).

## Exclusions

- Business state ownership (task, runtime, worktree, credentials).
- pi SDK or Git calls (downstream services only).
- Renderer-side validation as sole security boundary (host must re-validate).

## Dependencies

- `shared/contracts/` for command, result, and error shapes (to be introduced with scaffold).
- `ApplicationLifecycle` for teardown of pending IPC work on window close/exit.

## Test focus

- Malformed and unknown messages rejected safely.
- Allowlist: unregistered channel cannot be invoked.
- Out-of-order or duplicate responses do not corrupt handler state.
- Timeouts and early window close cancel scoped requests.
- No credential or secret fields in error payloads to Renderer.

## Interfaces

TBD — define channel list and schemas in **WI-002** (IPC secure shell). Do not invent channel names in this stub.

## Open questions

- Preload API shape vs. per-feature narrow surfaces (decide during WI-002).
- Link to future `docs/reference/ipc-channels.md` when created.
