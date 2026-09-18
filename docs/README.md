# pi-desktop Documentation Index

English | [中文](README.zh.md)

- Type: Reference
- Status: Accepted
- Created: 2026-09-18
- Last reviewed: 2026-09-19 (module archive)
- Applies to: project documentation navigation, reading order, current authorities, and known documentation gaps
- Authority: project documentation navigation, reading order, current authorities, and known documentation gaps
- Maintenance guide: [Documentation Organization and Maintenance Guide](document-conventions.md) ([中文](document-conventions.zh.md))

> The repository is still in its initialization phase. Documents describe plans, proposals, and confirmed requirements; they do not imply that application features have been implemented.
>
> Bilingual documents are paired in the same directory: English uses `<name>.md`, and Chinese uses `<name>.zh.md`. English is the authoritative source. The first migration pass is complete; Chinese translations default to `Machine Draft` until human review. See the [Bilingual Documentation Guide](bilingual-documentation.md).

## Recommended Reading Order

1. Project goals and current status: [`../README.md`](../README.md)
2. Repository constraints: [`../AGENTS.md`](../AGENTS.md) ([中文](../AGENTS.zh.md))
3. First-release product scope: [`product-requirements.md`](product-requirements.md)
4. First-release Electron system architecture: [`architecture/electron-architecture.md`](architecture/electron-architecture.md)
5. Related decisions and discussion history

## Current Documentation Basis

### Repository Development and Security Constraints

- [`../AGENTS.md`](../AGENTS.md) ([中文](../AGENTS.zh.md)): the current repository-level constraints.

### Draft Product Requirements

- [`product-requirements.md`](product-requirements.md): a `Draft` that collects confirmed directions and constraints still requiring validation for the first usable release. The document must not be described as a final authoritative requirement before it reaches `Accepted`. English is authoritative; see [`product-requirements.zh.md`](product-requirements.zh.md) for Chinese (`Machine Draft`).
- [`discussions/product-requirements-discussion.md`](discussions/product-requirements-discussion.md) ([中文](discussions/product-requirements-discussion.zh.md)): the history behind those requirements. It provides context only.

### Architecture

- [`architecture/electron-architecture.md`](architecture/electron-architecture.md): the current `Proposed` system architecture, covering one window with multiple projects and top-level tasks, task runtime/worktree ownership, event synchronization, persistence, and security boundaries. English is authoritative; see [`architecture/electron-architecture.zh.md`](architecture/electron-architecture.zh.md) for Chinese (`Machine Draft`).
- [`discussions/electron-architecture-discussion.md`](discussions/electron-architecture-discussion.md) ([中文](discussions/electron-architecture-discussion.zh.md)): the rationale for what the new architecture retained, changed, added, or removed. It is not an implementation authority.
- [`architecture-review-guide.md`](architecture-review-guide.md) ([中文](architecture-review-guide.zh.md)): the architecture review method for module decomposition, interfaces, dependencies, contracts, ownership, and related dimensions.
- [`desktop-framework-options.md`](desktop-framework-options.md) ([中文](desktop-framework-options.zh.md)): research into desktop framework and TypeScript build options.
- [`archive/electron-architecture.md`](archive/electron-architecture.md) ([中文](archive/electron-architecture.zh.md)): the archived 2026-09-17 single-active-runtime proposal (`Superseded`).

### Development Guides

- [`../ACTIVE.md`](../ACTIVE.md): current work item, queue, parking lot, and last-session handoff for humans and coding agents (not a requirements or architecture authority).
- [`guides/agent/README.md`](guides/agent/README.md) ([中文](guides/agent/README.zh.md)): agent constraint playbooks (progressive load from root `AGENTS.md` kernel, [path triggers](guides/agent/path-triggers.md), and `ACTIVE.md`).
- [`guides/agent-collaboration.md`](guides/agent-collaboration.md) ([中文](guides/agent-collaboration.zh.md)): how maintainers and coding agents collaborate; read with `ACTIVE.md` at the start of each implementation session.
- [`guides/code-style.md`](guides/code-style.md) ([中文](guides/code-style.zh.md)): code style charter (structure, naming, trust boundaries, abstraction, comments).
- [`guides/code-review.md`](guides/code-review.md) ([中文](guides/code-review.zh.md)): maintainer pass/fail checklist for application code reviews.
- [`git-commit-convention.md`](git-commit-convention.md) ([中文](git-commit-convention.zh.md)): read only when creating, generating, changing, or reviewing Git commit messages or rewriting commit history. The guide and all commit messages use English.
- [`document-conventions.md`](document-conventions.md) ([中文](document-conventions.zh.md)): read before creating, moving, splitting, archiving, or substantially revising project documentation.
- [`bilingual-documentation.md`](bilingual-documentation.md) ([中文](bilingual-documentation.zh.md)): defines bilingual file pairing, English source authority, translation states, quality review, synchronization, and migration.
- Documentation consistency: `npm run docs:verify` (structural checks + `docs:i18n:check`); semantic audits use [`guides/agent/doc-drift-audit.md`](guides/agent/doc-drift-audit.md).

## Known Migration Gaps

### Multi-task module design

The module index and initial stubs live under [`modules/README.md`](modules/README.md) ([中文](modules/README.zh.md)), aligned with architecture §8 owners and §20 planned code paths. Stubs exist for IPC, application lifecycle, and the task/runtime triangle (`TaskRegistry`, `RuntimeRegistry`, `TaskRuntimeController`); other owners remain `planned` until work items expand them.

Archived single-runtime module documents remain under [`archive/module-structure.md`](archive/module-structure.md) and [`archive/modules/`](archive/modules/) for historical reference only.

### Architecture Gates Requiring a Spike or ADR

Tracked in [`reference/architecture-gates.md`](reference/architecture-gates.md) ([中文](reference/architecture-gates.zh.md)) with status `Open` | `In spike` | `Accepted`. Closing a gate requires an **Accepted** ADR; see [When to write an ADR](decisions/README.md#when-to-write-an-adr).

Topics: runtime host process model; sub-agent integration; project trust for worktrees; task persistence schema; apply algorithm and journal; npm + Electron Forge/Vite and Linux packaging; attachment allowlist and limits.

Until closed, these remain `Proposed`—not implemented in docs or UI as shipped capability.

## Documentation Categories

The repository is adopting type-based organization incrementally.

### Requirements

Not yet moved to the target directory:

- [`product-requirements.md`](product-requirements.md) · [`product-requirements.zh.md`](product-requirements.zh.md)

### Architecture

- [`architecture/electron-architecture.md`](architecture/electron-architecture.md) · [`architecture/electron-architecture.zh.md`](architecture/electron-architecture.zh.md)
- [`architecture-review-guide.md`](architecture-review-guide.md) ([中文](architecture-review-guide.zh.md))
- [`desktop-framework-options.md`](desktop-framework-options.md) ([中文](desktop-framework-options.zh.md))

### Module Design

- [`modules/README.md`](modules/README.md) ([中文](modules/README.zh.md)): current multi-task module index and document status.
- Stubs: [`ipc-registration`](modules/ipc-registration.md), [`application-lifecycle`](modules/application-lifecycle.md), [`task-registry`](modules/task-registry.md), [`runtime-registry`](modules/runtime-registry.md), [`task-runtime-controller`](modules/task-runtime-controller.md).
- Historical single-runtime material: [`archive/module-structure.md`](archive/module-structure.md) and [`archive/modules/`](archive/modules/).

### Decisions

- [`decisions/README.md`](decisions/README.md) ([中文](decisions/README.zh.md))

No ADRs have been backfilled yet. Create one only when a decision changes system boundaries, security, persistence, a public contract, or another choice that is difficult to reverse.

### Discussions

- [`discussions/README.md`](discussions/README.md) ([中文](discussions/README.zh.md))
- [`discussions/product-requirements-discussion.md`](discussions/product-requirements-discussion.md) ([中文](discussions/product-requirements-discussion.zh.md))
- [`discussions/electron-architecture-discussion.md`](discussions/electron-architecture-discussion.md) ([中文](discussions/electron-architecture-discussion.zh.md))
- [`discussions/bilingual-documentation-discussion.md`](discussions/bilingual-documentation-discussion.md) ([中文](discussions/bilingual-documentation-discussion.zh.md))

### Guides

- [`guides/code-style.md`](guides/code-style.md) · [`guides/code-style.zh.md`](guides/code-style.zh.md)
- [`guides/code-review.md`](guides/code-review.md) · [`guides/code-review.zh.md`](guides/code-review.zh.md)
- [`guides/agent-collaboration.md`](guides/agent-collaboration.md) ([中文](guides/agent-collaboration.zh.md))
- [`guides/agent/README.md`](guides/agent/README.md) ([中文](guides/agent/README.zh.md))

Not yet moved to the target directory:

- [`git-commit-convention.md`](git-commit-convention.md) ([中文](git-commit-convention.zh.md))
- [`document-conventions.md`](document-conventions.md) ([中文](document-conventions.zh.md))
- [`bilingual-documentation.md`](bilingual-documentation.md) ([中文](bilingual-documentation.zh.md))

### Reference

- This index.
- [`reference/README.md`](reference/README.md) ([中文](reference/README.zh.md)): reference and **implementation contract** catalog (status `Planned` | `Outline` | `Living`).
- [`reference/glossary.md`](reference/glossary.md) ([中文](reference/glossary.zh.md)): English-to-Chinese terminology for paired documentation.
- [`reference/architecture-gates.md`](reference/architecture-gates.md) ([中文](reference/architecture-gates.zh.md)): architecture gate IDs, status, and ADR links.
- Contracts (shells until WI/gate): [ipc-channels](reference/ipc-channels.md), [domain-events](reference/domain-events.md), [task-and-runtime-states](reference/task-and-runtime-states.md), [persistence-layout](reference/persistence-layout.md) (each with `.zh.md`).

### Assets

- [`assets/`](assets/)

### Archive

- [`archive/README.md`](archive/README.md) ([中文](archive/README.zh.md))
- [`archive/electron-architecture.md`](archive/electron-architecture.md) ([中文](archive/electron-architecture.zh.md))
- [`archive/module-structure.md`](archive/module-structure.md) ([中文](archive/module-structure.zh.md))
- [`archive/modules/`](archive/modules/) (bilingual pairs; historical single-runtime material)

## Document States

The project uses only these states:

- `Draft`: still being formed;
- `Proposed`: substantially complete and awaiting confirmation;
- `Accepted`: confirmed and currently applicable;
- `Superseded`: replaced by another document or decision;
- `Archived`: retained only for historical reference.

Legacy documents with nonstandard Chinese state names will be migrated when they receive a substantive revision; do not perform unrelated bulk edits solely to normalize those labels.

## Maintenance Requirements

When adding or substantially changing project documentation:

1. read [`document-conventions.md`](document-conventions.md);
2. confirm the document type, status, and authority;
3. search for an existing document with overlapping authority;
4. update this index;
5. update the corresponding discussion log after a substantive discussion;
6. evaluate whether an important long-lived decision requires an ADR;
7. repair relative links and record known conflicts;
8. do not treat discussions or archived documents as current implementation specifications.
