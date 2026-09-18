# NavigationPolicy

English | [中文](navigation-policy.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/window/navigation-policy.ts`
- Authority: Historical navigation-policy responsibility, contract, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Validate page navigation, new-window, and external-link behavior.

## Contract

Forbid arbitrary windows and remote application code. Allow only approved protocols to be handed to the system browser. Reject `javascript:` and arbitrary `file:` URLs.

## Testing Focus

Protocol confusion, encoded URLs, page navigation, new windows, and links constructed from model output.
