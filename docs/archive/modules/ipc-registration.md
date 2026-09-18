# IpcRegistration

English | [中文](ipc-registration.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/ipc/ipc-registration.ts`
- Authority: Historical IPC registration responsibility, exclusions, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Register and unregister fixed allowlisted IPC handlers.

## Out of Scope

This module does not validate business payloads, implement command branches, or provide dynamic channel registration.

## Testing Focus

Fixed channels, duplicate registration, unregistration, and shutdown cleanup.
