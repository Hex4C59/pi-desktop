# Shared Contracts Module

English | [中文](shared-contracts.zh.md)

- Type: Module Design
- Status: Archived
- Layer: cross-process pure TypeScript
- Suggested location: `src/shared/`
- Parent document: [Module Design Index](../module-structure.md)

## Responsibilities

Define serializable domain types, command/result/event contracts, and runtime schemas shared by main, preload, and renderer.

## File layout

Split by use-case domain:

- `workspace-contract.ts`;
- `session-contract.ts`;
- `agent-contract.ts`;
- `model-contract.ts`;
- `auth-contract.ts`;
- `attachment-contract.ts`;
- `extension-ui-contract.ts`;
- `runtime-contract.ts`;
- `desktop-api-contract.ts`.

Shared domain files:

- `command-result.ts`;
- `desktop-error.ts`;
- `desktop-event.ts`;
- `runtime-snapshot.ts`;
- `identifiers.ts`.

## Dependency constraints

Shared must not depend on:

- Electron;
- Node.js;
- the pi SDK;
- main, preload, or renderer implementations.

## Contract requirements

- cross-process inputs have both TypeScript types and runtime schemas;
- use discriminated unions for events and results;
- use branded serializable IDs to prevent mixing session/tool/request IDs;
- do not include classes, functions, custom prototypes, or secrets;
- do not create monolithic `types.ts`, `commands.ts`, or vague barrels.

## Testing focus

Schema/type consistency, structured clone, error-code stability, and exhaustive event handling checks.
