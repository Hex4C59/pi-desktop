# Model Coordinator Module

English | [中文](model-coordinator.zh.md)

- Type: Module Design
- Status: Superseded
- Layer: Electron Main / Application
- Suggested implementation: `src/main/application/model-coordinator.ts`
- Authority: Historical model orchestration capabilities, exclusions, dependencies, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Responsibilities

Orchestrate model listing, model selection, and thinking-level changes.

## Public Capabilities

- Return serializable provider/model summaries.
- Select the current model.
- Set a thinking level supported by the model.
- Return authentication-requirement status without secret values.

## Out of Scope

- Submitting or storing API keys or OAuth tokens.
- Exposing `ModelRuntime`.
- Persisting pi model settings independently.
- Updating the Renderer store directly.

## Dependencies

Use model capabilities through the project runtime port; delegate authentication write operations to `CredentialCoordinator`.

## Testing Focus

- Invalid model IDs.
- Unsupported thinking levels.
- Missing authentication.
- Conflicts while the runtime is switching.
- Returned values contain no credentials.
