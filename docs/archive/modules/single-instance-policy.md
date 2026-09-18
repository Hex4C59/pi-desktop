# SingleInstancePolicy

English | [中文](single-instance-policy.zh.md)

- Type: Module Design
- Status: Archived
- Suggested implementation: `src/main/bootstrap/single-instance-policy.ts`
- Parent document: [Module Design Index](../module-structure.md)

## Single responsibility

Ensure only one application instance in the first release and turn second-instance requests into validated application intents.

## Out of scope

Does not open directories directly, trust incoming paths, or execute shell commands.

## Testing focus

First-instance lock, second-instance activation, malformed arguments, and existing-window teardown.
