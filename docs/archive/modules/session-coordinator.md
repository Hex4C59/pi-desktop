# SessionCoordinator Module

English | [中文](session-coordinator.zh.md)

- Type: Module Design
- Status: Superseded
- Layer: Electron Main / Application
- Suggested implementation: `src/main/application/session-coordinator.ts`
- Authority: Historical session use-case orchestration, ownership boundaries, dependencies, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Responsibilities

Orchestrate the use cases for listing, creating, resuming, switching, forking, and renaming sessions.

## Public Capabilities

- List sessions under the current working directory;
- Create a new session;
- Switch to or resume an existing session;
- Fork from a specified branch point;
- Rename a session.

## Ownership

This module does not own `AgentSession`. Every operation that replaces the active session is completed through the same replacement entry point on `RuntimeController`.

## Out of Scope

- Incrementing generation itself;
- Binding SDK listeners;
- Parsing or rewriting session JSONL;
- Executing prompts;
- Persisting Renderer state.

## Dependencies

Depends on a session-query port, runtime factory, and `RuntimeController`, and uses only project domain types.

## Testing Focus

- Reject conflicting operations while switching;
- Validate fork points;
- Handle replacement failures;
- Isolate events from the old session;
- Map rename errors.
