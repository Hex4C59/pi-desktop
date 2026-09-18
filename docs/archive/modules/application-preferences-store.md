# ApplicationPreferencesStore

English | [中文](application-preferences-store.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/preferences/application-preferences-store.ts`
- Authority: Historical persistence boundary and tests for first-release application preferences
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Persist pi-desktop's own non-sensitive application preferences.

## Allowed Content

Theme, panel widths, tool expansion preferences, recent-directory references, and application settings explicitly included in the schema.

## Prohibited Content

API keys, OAuth tokens, session messages, complete prompts, file contents, and data already managed by pi.

## Testing Focus

Schema validation, secure defaults, corrupt files, and migration failure.
