# Extension UI Module

English | [中文](extension-ui.zh.md)

- Type: Module Design
- Status: Superseded
- Layer: Electron Main + Renderer Feature
- Suggested implementation: `extension-ui-coordinator.ts`, `extension-request-dialog.tsx`
- Authority: Historical extension-interaction responsibilities, ownership, cleanup, constraints, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Responsibilities

Bridge pi extension `select`, `confirm`, `input`, `editor`, and `notify` requests into cancellable desktop domain interactions.

## Main Ownership

`ExtensionUiCoordinator` owns the mapping from request IDs to pending Promises. Each request is bound to a runtime generation, a window, and an optional timeout.

## Renderer Responsibilities

Present requests with semantic controls and return structured responses. Treat all extension text as untrusted plain text.

## Cleanup Contract

Pending requests must be cancelled on:

- Session replacement.
- Runtime crash.
- Window close.
- Application shutdown.
- Request timeout.

## Out of Scope

- Executing HTML or scripts supplied by an extension.
- Opening arbitrary remote UI.
- Delivering an old-generation response to a new runtime.
- Persisting user input.

## Testing Focus

All request types, duplicate responses, old generations, timeouts, and every cleanup path.
