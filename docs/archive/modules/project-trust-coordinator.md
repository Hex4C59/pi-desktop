# ProjectTrustCoordinator

English | [中文](project-trust-coordinator.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/trust/project-trust-coordinator.ts`
- Authority: Historical project-trust resolution responsibilities, exclusions, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Obtain an explicit project-trust result for a normalized working directory.

## Contract

Use pi public APIs to check project resources and existing decisions; invoke `TrustPromptCoordinator` when necessary; return trusted, untrusted, once, or cancelled.

## Out of Scope

This module does not parse `trust.json`, load extensions, create runtimes, or describe trust as a system sandbox.

## Testing Focus

Existing decisions, first-time prompts, trust for this time only, rejection, and failure handling when the public API is insufficient.
