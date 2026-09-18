# TaskRegistry

English | [中文](task-registry.zh.md)

- Type: Module Design
- Status: stub
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Owner: `TaskRegistry`
- Planned code path: `src/main/tasks/`
- Authority: task records and bindings among task, session, and worktree metadata
- Architecture: [§8.1](../architecture/electron-architecture.md), [§7 identity](../architecture/electron-architecture.md)
- Related: [`task-runtime-controller`](task-runtime-controller.md), [gate `gate-task-persistence`](../reference/architecture-gates.md)

## Responsibilities

- Create, restore, rename, and delete **task records** (top-level tasks per project).
- Maintain bindings: `taskId`, session reference, worktree identity, agent metadata needed for recovery (not SDK instances).
- Expose consistent read views for catalog projection and application services.
- Enforce architecture rules for non-Git parallel write tasks via coordination with `TaskCoordinator` (orchestration TBD).

## Exclusions

- Holding or disposing pi SDK runtimes (`TaskRuntimeController`, `RuntimeRegistry`).
- Owning worktree filesystem operations (`WorktreeManager`).
- Applying Git results (`ResultApplicationService`).

## Dependencies

- `ProjectRegistry` for project scope.
- `WorktreeManager` for worktree facts linked to tasks.
- Persistence adapter (schema per `gate-task-persistence` ADR).
- pi session APIs for session identity facts, not JSONL file parsing.

## Test focus

- Task identity stable across restart when persistence gate allows.
- Delete/discard flows leave no orphan bindings (coordinate with coordinators).
- Catalog and detail views stay consistent under concurrent task updates.
- Corruption partial recovery: task enters explicit error state, not silent loss.

## Interfaces

TBD — task record shape and registry API after persistence ADR and shared contracts exist.

## Open questions

- Persistence schema and file layout (`gate-task-persistence`).
- Exact split between `TaskRegistry` and `TaskCoordinator` commands.
