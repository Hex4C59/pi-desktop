# PiRuntimeFactory

English | [中文](pi-runtime-factory.zh.md)

- Type: Module Design
- Status: Archived
- Suggested implementation: `src/main/pi/pi-runtime-factory.ts`
- Parent document: [Module Design Index](../module-structure.md)

## Single responsibility

Construct a pi runtime adapter that satisfies the project runtime port from validated creation parameters.

## Dependencies

Uses only the public API of a pinned `@earendil-works/pi-coding-agent` version.

## Out of scope

Does not decide whether a project is trusted, hold the active runtime, reference internal files under `../pi`, or publish renderer events directly.

## Contract

A failure mid-creation must clean up partial resources. Production builds must not depend on a sibling source checkout.

## Testing focus

Successful creation, resource-load failure, mid-flight cleanup, dispose, and imports in packaged environments.
