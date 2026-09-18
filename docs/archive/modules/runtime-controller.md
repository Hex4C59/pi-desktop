# Runtime Controller Module

English | [中文](runtime-controller.zh.md)

- Type: Module Design
- Status: Archived
- Layer: Electron Main / Runtime
- Suggested implementation: `src/main/runtime/runtime-controller.ts`
- Parent document: [Module Design Index](../module-structure.md)

## Responsibilities

Serve as the sole owner of the active pi runtime and provide atomic access, replacement, and teardown boundaries.

## Owned state

- current runtime reference;
- current `runtimeGeneration`;
- current runtime lifecycle state;
- replacement mutual-exclusion region;
- current event subscription handles.

## Public capabilities

- access the current session within a controlled callback scope;
- atomically replace the runtime using the factory;
- query a consistent read-only view that does not leak SDK instances;
- abort and dispose the current runtime;
- query the current generation and state.

## Out of scope

- workspace, session, and prompt use-case orchestration;
- SDK event conversion;
- event sequence assignment;
- renderer snapshot assembly;
- IPC handler registration.

## Key contracts

- other modules must not retain `AgentSession` long term;
- replacement must be serialized;
- the old generation becomes invalid once replacement starts;
- if creating a new runtime fails, the old runtime must not be advertised as available;
- `dispose()` must be idempotent.

## Dependencies

May depend on the runtime factory, state machine, event-subscription abstraction, and diagnostic modules. Must not depend on the renderer, preload, or raw IPC.

## Testing focus

- concurrent replacement;
- explicit error state after creation failure;
- cleanup of old subscriptions;
- generation increments;
- repeated dispose.
