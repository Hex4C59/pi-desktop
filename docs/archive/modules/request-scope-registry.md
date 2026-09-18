# RequestScopeRegistry

English | [中文](request-scope-registry.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/ipc/request-scope-registry.ts`
- Authority: Historical IPC request-cancellation ownership, exclusions, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Manage cancellation relationships between IPC requests and the windows that initiated them.

## Ownership

Own the mapping from window/request pairs to `AbortController` instances.

## Out of Scope

This module does not decide whether cancellation is equivalent to an agent abort, clean up runtimes, or retain command payloads.

## Testing Focus

Release after request completion, window destruction, timeout, application exit, and repeated cancellation.
