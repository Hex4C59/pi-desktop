# RuntimeQueryService

English | [中文](runtime-query-service.zh.md)

- Type: Module Design
- Status: Archived
- Suggested implementation: `src/main/application/runtime-query-service.ts`
- Parent document: [Module Design Index](../module-structure.md)

## Single responsibility

Obtain a consistent read-only view of the current runtime and coordinate construction of the `RuntimeSnapshot` required by the renderer.

## Inputs and outputs

No business payload input. Output is a serializable snapshot that includes generation and sequence.

## Dependencies

Depends on `RuntimeController`, `RuntimeSnapshotBuilder`, and sequence query support from `EventPublisher`.

## Out of scope

Does not modify the runtime, subscribe to SDK events, cache snapshots long term, or handle IPC directly.

## Testing focus

Consistency during concurrent replacement, empty runtime, crashed state, and snapshot/event boundaries.
