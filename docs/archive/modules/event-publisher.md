# EventPublisher

English | [中文](event-publisher.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/runtime/event-publisher.ts`
- Authority: Historical event-publication ownership, input/output boundary, exclusions, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Assign ordering to `DesktopEvent` values and publish them to valid Renderers.

## Ownership

Own the monotonically increasing event `sequence`.

## Input and Output

Input is a converted `DesktopEvent` and its generation; output is a `DesktopEventEnvelope`.

## Out of Scope

This module does not convert SDK events, decide generation, modify the Renderer store, or record complete event payloads.

## Testing Focus

Sequence monotonicity, invalidated generations, window-destruction races, publication order, and current-sequence queries.
