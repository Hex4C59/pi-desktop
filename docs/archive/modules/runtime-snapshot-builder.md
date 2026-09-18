# RuntimeSnapshotBuilder

English | [中文](runtime-snapshot-builder.zh.md)

- Type: Module Design
- Status: Archived
- Suggested implementation: `src/main/runtime/runtime-snapshot-builder.ts`
- Parent document: [Module Design Index](../module-structure.md)

## Single responsibility

Convert a consistent runtime view into a structured-cloneable `RuntimeSnapshot`.

## Output fields

Working directory, session, completed messages, model, thinking level, queue, tokens, cost, runtime state, redacted diagnostic summary, generation, and sequence.

## Out of scope

Does not read the active runtime, mutate state, assign sequence numbers, or return SDK classes, credentials, or raw errors.

## Testing focus

Field completeness, sensitive-field exclusion, structured-clone compatibility, and varied runtime states.
