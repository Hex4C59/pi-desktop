# Agent playbook: Process and module boundaries

English | [中文](boundaries.zh.md)

- Type: Guide
- Status: Accepted
- Authority: layer boundaries and streaming lifecycle (see [AGENTS.md](../../../AGENTS.md))
- When: any code crossing Renderer, host, adapter, or pi runtime

## Layers

Regardless of desktop framework:

- **Renderer/UI**: views, input, short-lived UI state only.
- **Desktop host**: capabilities outside the window, typed IPC, pi runtime lifecycle, persistence coordination.
- **Pi adapter**: convert SDK events or RPC messages into internal domain events; isolate upstream version changes.
- **Pi runtime**: models, agents, tools, resources, configuration, session semantics (upstream).

## Must

- Renderer must not get shell, arbitrary file I/O, Node.js APIs, or provider credentials.
- UI must not depend directly on pi SDK types; pass serializable data through the adapter and narrow project interfaces.
- Streaming must follow pi event semantics:
  - correlate incremental events with `contentIndex` and tool call IDs;
  - treat `message_end.message` as the authoritative completed message;
  - correlate tool start, update, and end with tool call IDs;
  - rebind subscriptions after session replacement; do not keep listeners on a replaced `AgentSession`;
  - on abort, session switch, window close, or runtime crash, clean up listeners, child processes, and pending requests.

## Pointers

- System owners and IPC direction: `docs/architecture/electron-architecture.md`
- Security: [security.md](security.md)
- pi APIs: [pi-integration.md](pi-integration.md)
