# ApplicationCompositionRoot

English | [中文](application-composition-root.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/bootstrap/application-composition-root.ts`
- Authority: Historical composition-root responsibility, boundary, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Create concrete module instances and connect their dependencies.

## Boundary

This is the only place allowed to have centralized knowledge of most concrete Main implementations. It does not execute business rules or serve as a runtime service locator.

## Testing Focus

Wiring completeness, initialization order, and cleanup after partial initialization failure.
