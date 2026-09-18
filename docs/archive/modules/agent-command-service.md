# Agent Command Service Module

English | [中文](agent-command-service.zh.md)

- Type: Module Design
- Status: Superseded
- Layer: Electron Main / Application
- Suggested implementation: `src/main/application/agent-command-service.ts`
- Authority: Historical responsibilities, ownership, constraints, and tests for first-release agent commands
- Parent document: [Module Design Index](../module-structure.md)

## Responsibilities

Execute prompt, steer, follow-up, abort, and clear-queue commands on the current session.

## Prompt Contract

A complete `session.prompt()` run must not occupy a long-running IPC invocation:

1. Validate runtime state and input.
2. Invoke the prompt within a controlled session scope.
3. Return `PromptAcceptance` promptly by using `preflightResult`.
4. Leave the complete run in the background.
5. Explicitly catch failures from the background Promise.
6. Report subsequent progress and failures through domain events.

## Ownership

This module does not own the runtime, session, or queue. At command start, it requests a controlled operation capability from `RuntimeController`; it must not retain an SDK reference after the callback ends.

## Out of Scope

- Runtime replacement.
- Event payload conversion.
- IPC schema validation.
- Recording complete prompts.
- Maintaining the Renderer's optimistic queue.

## Testing Focus

- Preflight acceptance and rejection.
- Background failures do not produce unhandled rejections.
- Prompt rejection in switching/crashed states.
- Races between abort and replacement.
- Steer/follow-up queue semantics.
