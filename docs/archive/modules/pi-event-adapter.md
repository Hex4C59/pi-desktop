# PiEventAdapter

English | [中文](pi-event-adapter.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/pi/pi-event-adapter.ts`
- Authority: Historical pi event-conversion rules, exclusions, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Convert pi SDK events into the project's own serializable `DesktopEvent` values.

## Conversion Rules

Use `contentIndex` to correlate text/thinking content and tool call IDs to correlate tool lifecycles. Treat `message_update` only as an increment, `message_end.message` as the authoritative completed message, and `partialResult` as the cumulative tool result.

## Out of Scope

This module does not own generation, allocate sequence numbers, send IPC, or replace the runtime.

## Testing Focus

Text, thinking, tools, queueing, abort, retry, compaction, authoritative replacement by the completed message, and exhaustive handling.
