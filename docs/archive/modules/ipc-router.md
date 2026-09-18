# IpcRouter

English | [中文](ipc-router.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/ipc/ipc-router.ts`
- Authority: Historical IPC validation and dispatch responsibility, contract, exclusions, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Validate and dispatch commands between the IPC transport and application services.

## Contract

Treat input as `unknown`, narrow it with the schema for the command, invoke a fixed application handler, and return a uniform `CommandResult`.

## Out of Scope

This module does not call the pi SDK directly, own the runtime, implement business rules, or accept dynamic channel or method names.

## Testing Focus

Malformed input, unknown commands, dispatch accuracy, and error conversion.
