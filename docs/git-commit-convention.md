# Git Commit Convention

English | [中文](git-commit-convention.zh.md)

## Scope

This convention applies to all commit messages created by human contributors or coding agents in this repository. It also applies when amending, rewording, squashing, or otherwise rewriting commits.

Use full Conventional Commits with an English subject, body, and applicable footers.

## Format

```text
<type>(<scope>): <summary>

<body>

<footer>
```

Requirements:

- The subject and body are required for manually or agent-created commits.
- Footers are required only when they carry breaking-change notices, issue references, authorship trailers, or other relevant metadata.
- Separate the subject, body, and footer with one blank line.
- Keep each commit focused on one logical change.
- Do not include credentials, secrets, complete prompts, sensitive paths, or other private data in a commit message.

Standard merge messages produced by Git and mechanically generated revert messages may retain their standard format. If a revert message is edited manually, add a body explaining why the revert is necessary.

## Language

- Write the entire commit message in English.
- This includes the summary, body, and custom footer text.
- Do not mix English and Chinese in a commit message.
- Keep standard trailers such as `BREAKING CHANGE:`, `Refs:`, `Closes:`, and `Co-authored-by:` in their standard form.
- Preserve code identifiers, API names, file paths, commands, and quoted user-facing text exactly when needed.

## Types

Use one of the following types:

- `feat`: Add or change user-visible functionality.
- `fix`: Correct defective behavior.
- `docs`: Change documentation only.
- `refactor`: Restructure code without changing intended behavior.
- `test`: Add or change tests without changing production behavior.
- `build`: Change dependencies, packaging, bundling, or the build system.
- `ci`: Change continuous integration or release automation.
- `perf`: Improve performance without changing intended behavior.
- `style`: Change formatting or other non-functional source presentation.
- `chore`: Perform repository maintenance that does not fit another type.
- `revert`: Revert an earlier commit when not using Git's generated format.

Choose the most specific type. Do not use `chore` as a substitute for an unclear change.

## Scopes

Use a lowercase scope that names the primary stable domain or module affected by the commit. Prefer domain names over filenames.

Recommended scopes include:

- `app`
- `window`
- `ipc`
- `runtime`
- `task`
- `scheduler`
- `worktree`
- `session`
- `agent`
- `model`
- `auth`
- `trust`
- `attachment`
- `extension`
- `renderer`
- `contracts`
- `build`
- `docs`

The list is not closed. Add a new scope when a stable domain emerges. Omit the scope when a change genuinely spans several domains and no primary scope is accurate. Do not invent an inaccurate scope merely to fill the field.

## Summary

- Write the summary in English.
- Use the imperative mood.
- Start with a lowercase letter unless the first word is a case-sensitive identifier.
- Do not end with a period.
- Keep the complete subject line at or below 72 characters.
- Describe the single logical outcome of the commit.
- Avoid vague summaries such as `update files`, `misc changes`, or `fix stuff`.

## Body

- Write the body in English.
- Wrap body text at 72 characters where practical. Do not wrap code identifiers, URLs, or other tokens when doing so would reduce clarity.
- Explain why the change is needed and describe its important behavior or impact.
- Record relevant constraints, trade-offs, failure behavior, or migration effects.
- Do not merely repeat the diff or restate the summary.
- Separate paragraphs with one blank line.
- Do not claim that checks passed unless they were actually run.

The body is mandatory for all manually or agent-created commits. A small change may use a short body, but the body must still explain its purpose.

Give additional detail when a commit changes any of the following:

- architecture or module ownership;
- security or trust boundaries;
- persistence formats or recovery behavior;
- IPC or other serialized contracts;
- pi SDK or RPC integration;
- dependencies, build commands, packaging, or CI;
- user-visible behavior;
- compatibility or migration requirements.

## Footers

Use standard Git trailers where applicable:

```text
Refs: #42
Closes: #57
Co-authored-by: Name <email@example.com>
```

Issue references are optional unless a workflow explicitly requires them. Put issue references in the footer rather than the summary.

## Breaking Changes

Mark a breaking change in both places:

1. Add `!` after the type or scope in the subject.
2. Add a `BREAKING CHANGE:` footer that explains the incompatible behavior.

The body should describe the previous behavior, the new behavior, the affected surface, and any required migration.

```text
feat(ipc)!: route runtime commands by task ID

Replace the single-runtime command contract with task-scoped
commands required by concurrent project and session execution.

BREAKING CHANGE: All runtime commands and events now require a
task ID and runtime incarnation ID.
```

Use the breaking-change form even while the project is unpublished when a commit changes an important contract, persistent representation, or documented integration boundary incompatibly.

## Commit Preparation Workflow

Before creating or rewriting a commit:

1. Inspect `git status` and the complete diff that will be committed.
2. Preserve unrelated user changes and exclude them from the commit.
3. Confirm that the commit contains one logical change.
4. Recommend splitting unrelated changes instead of hiding them under one message.
5. Choose the type and scope from the actual staged content.
6. Write the English summary, mandatory body, and applicable footers.
7. Check the 72-character subject limit and body wrapping.
8. Verify that the message does not disclose secrets or sensitive data.
9. Report only checks that were actually run.
10. Do not amend, rebase, squash, force-push, or otherwise rewrite history unless the user explicitly requests it.

## Valid Examples

### Feature

```text
feat(runtime): support concurrent task scheduling

Add separate limits for top-level tasks, per-task subagents,
and the global number of running agents.

Release execution slots while parent agents wait for subagents
to prevent scheduler deadlocks.
```

### Fix

```text
fix(worktree): preserve changes after apply failure

Stop the apply operation before writing to the target workspace
when the preflight check detects a conflict.

Keep the task worktree available so the user can resolve the
target state and retry.
```

### Documentation

```text
docs(requirements): define multi-agent desktop behavior

Document the confirmed concurrency, worktree isolation, task
recovery, and change application requirements for the first
usable release.
```

### Small Change

```text
docs(readme): correct the supported platform description

Clarify that the first release supports Linux only.
```

## Invalid Examples

```text
update docs
```

Problems:

- It has no type.
- It does not identify the affected area.
- It does not describe a specific outcome.
- It has no body.

```text
feat: Added New Runtime Feature.
```

Problems:

- It does not use the imperative mood.
- It starts with unnecessary capitalization.
- It ends with a period.
- It has no body.

```text
feat(runtime): support concurrent task scheduling

[Body written in a language other than English.]
```

Problems:

- The body is not written in English.
- The summary, body, and custom footer text must be entirely in English.
