# RuntimeEventSubscription

English | [中文](runtime-event-subscription.zh.md)

- Type: Module Design
- Status: Archived
- Suggested implementation: `src/main/runtime/runtime-event-subscription.ts`
- Parent document: [Module Design Index](../module-structure.md)

## Single responsibility

Bind an SDK event source for one specific runtime generation and provide reliable, idempotent unsubscription.

## Ownership

Owns the subscription's generation and its unsubscribe/dispose handles.

## Dependencies

Passes SDK events to `PiEventAdapter`, then domain events to `EventPublisher`.

## Out of scope

Does not replace the runtime, assign sequence numbers, query the current generation to rewrite a captured generation, or persist renderer state.

## Testing focus

No events after dispose, repeated dispose, stale generations, listener leaks, and event conversion failures.
