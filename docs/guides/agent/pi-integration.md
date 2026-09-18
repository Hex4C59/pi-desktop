# Agent playbook: Upstream pi integration

English | [中文](pi-integration.zh.md)

- Type: Guide
- Status: Accepted
- Authority: pi SDK/RPC integration constraints
- When: adapter, runtime, sessions, package pins, RPC mode

## Must

- Desktop app is a presentation layer—do not reimplement agent loop, providers, tools, compaction, or session management.
- Prefer `@earendil-works/pi-coding-agent` SDK for a Node.js host by default.
- Use `pi --mode rpc` only for subprocess isolation, non-Node host, or separate failure domain.
- Do not read or write session JSONL for session features; use `AgentSessionRuntime`, `SessionManager`, or RPC session commands.
- Do not port upstream TUI components; reuse behavior and data models, redesign interaction for desktop.
- Do not treat `@earendil-works/pi-client`, `pi-protocol`, or `pi-server` as stable unless the task requires it and adds compatibility guards.
- Pin explicit pi npm versions; commit the lockfile. On upgrade, read changelog and verify events, messages, sessions, and auth.
- When using local `../pi`, record the commit; local source must not become an implicit release dependency.

## Before coding

1. Read `../pi/packages/coding-agent/docs/` and `examples/sdk/` for the task scope.
2. Verify exported types against the pinned package version.

## Pointers

- `../pi/packages/coding-agent/docs/sdk.md`, `rpc.md`, `security.md`, `session-format.md`, `extensions.md`
- Streaming and adapter rules: [boundaries.md](boundaries.md)
