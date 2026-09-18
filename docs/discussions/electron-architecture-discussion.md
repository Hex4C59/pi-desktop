# Electron System Architecture Discussion

English | [中文](electron-architecture-discussion.zh.md)

- Type: Discussion
- Status: Accepted
- Created: 2026-09-18
- Last updated: 2026-09-18
- Authority: historical context for the architecture's formation; not an implementation authority
- Corresponding architecture: [Electron System Architecture](../architecture/electron-architecture.md)
- Product input: [Product Requirements](../product-requirements.md)
- Archived module design: [Module Structure](../archive/module-structure.md)
- Historical proposal: [Archived Electron Architecture](../archive/electron-architecture.md)

> This document preserves the architecture's formation process and is not an implementation specification. The corresponding Architecture governs the current system structure.

## 2026-09-18 — Why the old architecture could not simply be extended

The old proposal established sound foundational boundaries: Renderer/Preload/Main/pi SDK layering, typed IPC, an SDK adapter, generation, snapshot/event handoff, credential isolation, and extension UI cleanup.

The subsequently confirmed first-version product direction changed the system's cardinality and ownership:

- one window must support multiple projects and multiple top-level tasks running concurrently;
- each top-level Git task needs an independent worktree;
- the currently viewed task and background running tasks must be decoupled;
- sub-agents, multilevel scheduling, result review, apply/discard, and restart recovery are required;
- events, snapshots, trust, attachments, and extension requests must all be task-scoped.

Therefore, the old architecture's single global `RuntimeController`, global `runtimeGeneration`, replacement on project switching, and single Renderer conversation projection were no longer merely missing details; they directly conflicted with product requirements. The decision was not to append "future multi-task support" to the old file, but to rebuild system-level ownership while reusing the original module-design principles.

## 2026-09-18 — Adopted baseline

The architecture revision used inputs in this order:

1. the security, pi integration, and completion requirements in `AGENTS.md`;
2. the multi-project, multi-task, worktree, recovery, and result workflows in `product-requirements.md`;
3. the single-responsibility, high-cohesion, narrow-port, testable-boundary, and permission-matching methods in `module-structure.md`;
4. the SDK, security, extension documentation, and session runtime examples at pinned upstream commit `e5d18382a207a4b108d97f7cc97abdc90a23d32d`.

`module-structure.md` was treated as a source of design methods and module candidates, not as a single-runtime cardinality to be promoted unchanged into the new architecture.

## 2026-09-18 — Key decisions

### One window, multiple tasks

Keep a single instance and one main window, but do not retain one active workspace/runtime. The currently viewed task is only a Renderer navigation selection and is no longer the runtime owner.

### Task is the top-level isolation unit

Each top-level task binds a project, session, actual working directory, Git worktree, runtime slot, follow-ups, Agent tree, and result state. The same pi session must not be bound to two active tasks at once.

### Runtime registry plus task-scoped controller

Do not create a new all-powerful global `RuntimeController`. `RuntimeRegistry` only locates and closes task runtime controllers; each `TaskRuntimeController` owns only one task slot's current incarnation, generation, subscription, and replacement critical section.

### Two-level synchronization for catalog and task

A single global sequence would let a gap in any task force the entire UI to resynchronize. The new architecture uses a catalog stream and per-task streams: the catalog owns project-tree summaries, while task streams own detailed conversation, Agent, tool, and result data. When one task loses synchronization, only that task snapshot is fetched again.

### Main projection provides the linearization point

If one module reads a snapshot from Runtime while another publishes events, it cannot prove which events are included in the snapshot's sequence. The new architecture requires the projection reducer, sequence allocation, and committed sequence to complete within the same serial commit without `await`.

### A worktree is not a sandbox

A worktree establishes the default working directory and result-application boundary. It does not prevent shell commands, absolute paths, symbolic links, or extensions from accessing other user-writable locations. Neither copy nor implementation may describe it as security isolation.

### Architecture does not fabricate upstream capabilities

Sub-agent support and project trust/worktree mapping still require a spike against the pinned pi version. If the public API is insufficient, implementation should be blocked, a supported interface pursued, or product scope narrowed. The UI must not simulate stable semantics that do not exist.

## 2026-09-18 — Retained, changed, added, and removed

### Retained

- Electron/React/TypeScript technology direction;
- Renderer/Preload/Main permission boundaries;
- fixed allowlist IPC and runtime schemas;
- pi adapter, error redaction, and credential isolation;
- `contentIndex`, tool call ID, and `message_end.message` rules;
- extension UI request/response and idempotent cleanup;
- rebind after session replacement;
- import-boundary and fake-provider testing strategy.

### Changed

- global `RuntimeController` → `RuntimeRegistry` plus per-task `TaskRuntimeController`;
- global generation → task-slot generation plus runtime ID;
- global event sequence → catalog sequence plus per-task sequence;
- single runtime snapshot → catalog snapshot plus task snapshot;
- image attachments → controlled general attachments with explicit conversion semantics;
- session-level model selection → immutable per-message run snapshots and Desktop-delayed follow-ups;
- application-exit cleanup → bounded cleanup across tasks, runtimes, worktrees, and requests.

### Added

- project and task registries;
- multilevel scheduler and deadlock-prevention rules;
- worktree manager;
- sub-agent coordinator;
- task persistence and interrupted recovery;
- result revision, validation records, review/apply/discard;
- apply journal;
- Linux desktop notifications;
- per-task Renderer projection.

### Removed

- the recommendation that the first version have only one active working directory/runtime;
- the model where switching the current project or session replaces a global runtime;
- one globally authoritative Renderer conversation state;
- treating the runtime process-hosting approach as an accepted decision;
- building SDK and RPC backends simultaneously before implementation.

## 2026-09-18 — Documentation migration

- The new system architecture was created at [Electron System Architecture](../architecture/electron-architecture.md) with Proposed status.
- The complete old proposal moved to [Archived Electron Architecture](../archive/electron-architecture.md) with `Archived` status.
- `module-structure.md` and the existing `modules/` were archived on 2026-09-19 and no longer serve as the current implementation baseline.
- The documentation index and product-requirement links were redirected to the new architecture.

## Open items

The following are not decisions that this architecture document can replace with assumptions:

- whether the pi runtime runs in Electron Main or a separate utility/child process;
- sub-agent integration for the pinned pi version;
- whether project trust can be correctly applied through public APIs to internal worktrees without polluting the trust store;
- the task-persistence implementation and schema;
- the apply algorithm, supported Git change types, and journal recovery guarantees;
- formal acceptance of npm plus Electron Forge/Vite;
- the concrete attachment allowlist and limits.

These items require evidence from spikes and should then be evaluated separately for ADRs. This discussion did not unilaterally create Accepted ADRs on the user's behalf.
