# MainWindow

English | [中文](main-window.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/window/main-window.ts`
- Authority: Historical main-window responsibility, security configuration, exclusions, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Create and own the main `BrowserWindow`.

## Security Configuration

Enable context isolation, sandboxing, and web security; disable Node integration; and load only an approved entry point.

## Out of Scope

This module does not handle business commands, access the pi SDK, or expose privileged APIs.

## Testing Focus

`webPreferences`, creation and destruction, development and production entry points, and window notifications.
