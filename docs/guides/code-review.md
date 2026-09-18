# Maintainer Code Review Checklist

English | [中文](code-review.zh.md)

- Type: Guide
- Status: Accepted
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Applies to: maintainer acceptance of agent or human changes to application code
- Authority: quick pass/fail review; does not override [code-style](code-style.md) or playbooks
- Related: [code-style](code-style.md), [agent-collaboration](agent-collaboration.md), [`ACTIVE.md`](../../ACTIVE.md)

Use this after the agent reports lint/typecheck/tests. It complements automated checks with judgment calls tools cannot make. **Fail** any item that is clearly violated; ask the agent to fix only that scope.

## Scope and process

- [ ] Diff matches the current **WI** in [`ACTIVE.md`](../../ACTIVE.md)—no unrelated refactors, format sweeps, or dependency bumps.
- [ ] No architecture **gate** or ADR trigger treated as shipped without Accepted ADR ([architecture-gates](../reference/architecture-gates.md)).

## Structure and readability

- [ ] New files sit under the correct §20 / module **owner**; no new `common/` or `utils/` dumping ground.
- [ ] Names read as domain language (task, runtime, incarnation)—not `Manager`/`Handler`/`Util` soup.
- [ ] A maintainer can follow the main path without jumping through more than one unnecessary indirection layer.
- [ ] No new abstraction with **only one** call site (unless adapter or contract boundary).

## Types and control flow

- [ ] Unions for states/events are handled exhaustively; no silent `default: null`.
- [ ] No `any`, no boundary `as`, no `!` in app code.
- [ ] Async work has cancel/dispose where the WI touches streaming, IPC, or runtime lifecycle.
- [ ] No empty `catch` or log-and-continue presented as fixed behavior.

## Trust boundaries

- [ ] Validation appears at IPC/preload/persistence/SDK edges—not repeated redundantly inside the same layer.
- [ ] Renderer still has no Node, shell, credentials, or pi SDK imports.
- [ ] Logs and UI do not expose secrets (L0).

## Comments

- [ ] No comments that only restate the next line.
- [ ] Load-bearing **why** / **invariant** / **beware** comments sit next to the code they protect.
- [ ] No stale comments contradicting the diff; no untracked `TODO` noise.

## Verification

- [ ] Agent listed commands run and results (or honestly reported limits before scaffold).
- [ ] Tests added or updated when behavior changed; not only snapshot churn without purpose.

## Agent session

If review fails, use the collaboration guide acceptance prompt ([agent-collaboration §6](agent-collaboration.md#6-maintainer-prompts-copy-paste)) and require an `ACTIVE.md` Last session update after fixes.
