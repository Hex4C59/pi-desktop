# WindowStateStore

English | [中文](window-state-store.zh.md)

- Type: Module Design
- Status: Archived
- Suggested implementation: `src/main/window/window-state-store.ts`
- Parent document: [Module Design Index](../module-structure.md)

## Single responsibility

Persist non-sensitive geometry state for the main window.

## Contents

Size, position, and maximized state. On restore, ensure the window remains within a usable display region.

## Out of scope

Does not store feature preferences, sessions, prompts, file contents, or credentials.

## Testing focus

Multi-monitor changes, invalid coordinates, corrupted state, and safe defaults.
