# TrustPromptCoordinator

English | [中文](trust-prompt-coordinator.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/trust/trust-prompt-coordinator.ts`
- Authority: Historical project-trust prompt ownership, cleanup contract, exclusions, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Manage pending project-trust requests awaiting responses between Main and Renderer.

## Ownership

Own the mapping from trust request IDs to pending Promises.

## Out of Scope

This module does not decide whether a project is trusted, read or write the trust store, or load resources.

## Cleanup Contract

Cancellation, timeout, window closure, and application exit must settle pending Promises, and each request must resolve only once.

## Testing Focus

Incorrect request IDs, repeated responses, timeout, window ownership, and exit cleanup.
