# ApplicationLifecycle

English | [中文](application-lifecycle.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/bootstrap/application-lifecycle.ts`
- Authority: Historical application lifecycle ownership, exclusions, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Coordinate application startup, window lifecycle, and global shutdown cleanup.

## Ownership

Own the shutdown cleanup order and idempotency state.

## Out of Scope

This module does not implement cleanup details for individual resources and does not store sessions, attachments, or credentials.

## Testing Focus

Repeated shutdown, window close, cleanup order, and partial cleanup failure.
