# RuntimeStateMachine

English | [中文](runtime-state-machine.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/runtime/runtime-state-machine.ts`
- Authority: Historical runtime lifecycle states, transition validation, exclusions, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Define and validate runtime lifecycle state transitions.

## States

`idle`, `starting`, `ready`, `running`, `switching`, `aborting`, `error`, `crashed`, and `disposed`.

## Out of Scope

This module does not own a runtime, perform asynchronous side effects, or publish events.

## Testing Focus

All valid transitions, invalid transitions, terminal states, and error-recovery entry points.
