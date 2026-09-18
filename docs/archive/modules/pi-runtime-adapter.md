# PiRuntimeAdapter

English | [中文](pi-runtime-adapter.zh.md)

- Type: Module Design
- Status: Archived
- Suggested implementation: `src/main/pi/pi-runtime-adapter.ts`
- Parent document: [Module Design Index](../module-structure.md)

## Single responsibility

Wrap one concrete pi SDK runtime instance with the project's runtime port.

## Public capabilities

Provide narrow operations required for session, prompt, model, queue, abort, and event subscription without leaking the SDK instance.

## Out of scope

Does not own the globally active runtime, handle Electron IPC or windows, decide trust, or pass SDK types into shared contracts or the renderer.

## Replaceability

A future utility-process or RPC implementation must satisfy the same project port.

## Testing focus

SDK operation mapping, cancellation, error causes, reference cleanup, and port stub compatibility.
