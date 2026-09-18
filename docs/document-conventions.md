# Documentation Organization and Maintenance Guide

English | [中文](document-conventions.zh.md)

- Type: Guide
- Status: Accepted
- Created: 2026-09-18
- Last reviewed: 2026-09-18
- Authority: classification, status, metadata, naming, links, discussion logs, and archiving for project documentation in the repository
- Related entry: [Documentation Index](README.md)
- Related guide: [Bilingual Documentation Guide](bilingual-documentation.md)

## 1. Purpose

This guide keeps requirements, architecture, module design, decisions, discussion history, operational guides, and historical material easy to find, assess, and maintain as volume grows.

The documentation system must help readers answer:

1. What type of document is this?
2. Is it currently valid?
3. What does it authoritatively define?
4. Which requirements, architecture, decisions, and discussion records does it relate to?
5. If documents conflict, which one wins?
6. How was this conclusion formed and revised?

## 2. Core Principles

- Directories express document type; document headers express status, scope, and relationships.
- Keep current valid conclusions separate from the process that produced them.
- One concept has one authoritative definition; other documents use summaries and links.
- Discussion logs preserve real reasoning; do not retroactively polish history to match final conclusions.
- Superseded views and documents must be marked explicitly; do not delete them silently.
- Do not use filenames such as `final`, `latest`, `new`, or `v2` to express status.
- Document status is expressed through metadata and Git history.
- Search for existing documents with the same authority before creating a new one.
- Documents must not contain credentials, secrets, full sensitive paths, or raw chat content unsuitable for the repository.
- Bilingual documents are paired page by page in the same directory; after migration completes, English `<name>.md` is the authoritative source for each pair, and Chinese uses `<name>.zh.md`. Translation status, synchronization, and migration rules are defined in the [Bilingual Documentation Guide](bilingual-documentation.md).

## 3. Directory Layout

The target structure is:

```text
docs/
├── README.md
├── requirements/
├── architecture/
├── modules/
├── decisions/
├── discussions/
├── guides/
├── reference/
├── assets/
└── archive/
```

Directory responsibilities:

- `requirements/`: product goals, user behavior, scope, and acceptance criteria;
- `architecture/`: system structure, process model, data flow, security boundaries, and architecture review;
- `modules/`: responsibilities, ownership, dependencies, prohibitions, and test boundaries for individual modules;
- `decisions/`: long-lived important decisions, i.e. ADRs;
- `discussions/`: requirements, architecture, and design discussions organized chronologically;
- `guides/`: operational standards for development, testing, commits, builds, packaging, and release;
- `reference/`: terminology, state models, protocols, and other lookup material;
- `assets/`: diagrams, images, and static resources used by documentation;
- `archive/`: complete documents that are no longer current but retain historical value.

The repository is still in its initialization phase. Do not move all existing files at once merely to tidy directories. Migrate existing documents on the next substantive revision, and fix all links and index entries at the same time.

## 4. Document Types

Each document should have exactly one primary type:

- `Requirement`: defines user needs, product behavior, scope, and acceptance criteria;
- `Architecture`: defines system structure, boundaries, ownership, and key technical constraints;
- `Module Design`: defines responsibilities, dependencies, and test focus for a single module;
- `Decision`: records the background, options, outcome, and consequences of an important choice;
- `Discussion`: preserves the discussion process that shaped requirements or design over time;
- `Guide`: explains how to execute a process;
- `Reference`: provides stable lookup information;
- `Archive`: preserves material that is no longer current.

A document has only one primary type. If it genuinely mixes multiple kinds of content, split it or define a single clear authority scope.

## 5. Document Status

Use only the following statuses:

- `Draft`: still forming; may change substantially;
- `Proposed`: content is largely complete and awaiting confirmation;
- `Accepted`: confirmed and currently authoritative;
- `Superseded`: replaced by another document or decision;
- `Archived`: no longer part of current design; kept for historical reference only.

To express review progress, add a separate review field; do not invent new statuses with similar meaning.

## 6. Metadata

When creating or substantially revising a document, provide applicable metadata after the title. Recommended format:

```markdown
# Document Title

- Type: Requirement
- Status: Draft
- Created: 2026-09-18
- Last reviewed: 2026-09-18
- Applies to: first usable release
- Domain: Task, Runtime, Scheduler
- Authority: user-visible task scheduling behavior
- Supersedes: none
- Superseded by: none
- Related documents: ...
- Discussion: ...
- Related decisions: ...
```

Use fields as needed, but readers must be able to determine:

- type;
- status;
- applicable scope or phase;
- authority scope;
- related current documents;
- corresponding discussion log (when one exists);
- supersession relationships (when they exist).

Do not maintain decorative fields that cannot stay accurate long term. Do not require Owner during solo work or before ownership is defined.

## 7. Authority and Conflict Resolution

Different documents are authoritative for different questions:

1. Root `AGENTS.md` (kernel) and `docs/guides/agent/` playbooks define repository development, security, and agent behavior constraints; the kernel load map states when each playbook applies;
2. Accepted Requirement defines user-visible behavior, product scope, and acceptance criteria;
3. Accepted Decision defines important choices within its stated scope;
4. current Architecture defines system structure, resource ownership, and technical boundaries;
5. Module Design defines internal module responsibilities and dependencies;
6. Guide and Reference define specific processes or lookup information;
7. Discussion provides historical context only; it is not a basis for current implementation;
8. Superseded and Archive documents do not participate in current implementation decisions.

When conflicts are found:

- do not silently pick a winner by guesswork;
- record the conflict under “Known conflicts” in `docs/README.md`;
- state which document is authoritative for which domain;
- revise affected documents or create an item awaiting decision;
- until the conflict is resolved, do not describe contradictory content as accepted.

## 8. Naming and Directory Depth

- Filenames use lowercase kebab-case, for example `runtime-orchestration.md`;
- ADRs use four-digit numbering, for example `0001-use-electron.md`;
- discussion files use the corresponding topic name, for example `product-requirements-discussion.md`;
- directories are usually at most `docs/<type>/<file>` or `docs/<type>/<topic>/<file>`;
- do not use dates in filenames to express version; dates belong on discussion timelines or logs that genuinely need time slicing;
- do not use names such as “final version”, “latest version”, or “new version”.

## 9. Links and Index

- `docs/README.md` is the top-level entry to the documentation system;
- update the main index when creating, moving, superseding, or archiving important documents;
- final documents and their corresponding discussions should link to each other both ways;
- ADRs should link to affected requirement or architecture documents;
- use repository-relative links; do not commit machine-specific absolute paths;
- when moving files, search and fix all relative links;
- do not copy large authoritative definitions to avoid linking; provide brief context and link to the source.

## 10. Discussion Logs

### 10.1 When to Record

Create or update a discussion when substantive conversation creates or significantly changes:

- product requirements;
- system or module architecture;
- security and trust models;
- persistence, recovery, or protocols;
- build, release, or compatibility strategy;
- important design that is hard to reverse or has multiple viable options.

Simple spelling fixes, mechanical formatting, obvious local repairs, and documentation edits without design decisions do not require a discussion log.

### 10.2 Organization

- By default, each important final document has one discussion file that grows over time;
- discussions live under `docs/discussions/`;
- when multiple chats focus on the same document, append to the same file;
- split only when the file is too long, the topic becomes its own document, or maintenance is clearly difficult;
- do not create a new file for every chat by default;
- do not copy full chats verbatim.

### 10.3 Timeline Entries

Each entry should include applicable sections:

```markdown
## 2026-09-18 — Topic

### Question

What needed to be answered at the time?

### Initial assumptions

What was believed when the discussion started?

### User reasoning

What goals, questions, concerns, or preferences did the user express?

### Agent analysis

What explanations, options, or recommendations did the agent provide?

### Options considered

- options and trade-offs;
- reasons rejected options were rejected.

### Decision

What did the user explicitly confirm?

### Impact

What changed in final documents, architecture, or follow-up work?

### Supersession

Which earlier assumptions were superseded?

### Open questions

What remains undecided?
```

Not every entry needs every subsection mechanically; keep only information that actually existed.

### 10.4 Fidelity Requirements

- clearly separate user views, agent suggestions, and final confirmation;
- do not write agent suggestions as if the user had already decided;
- do not invent reasons the user did not express at the time based on the final outcome;
- do not remove early mistakes, hesitation, or rejected options;
- when decisions change later, append a new entry and mark the old decision superseded;
- when attribution is unclear, write “raised in discussion”; do not guess;
- preserve key conceptual clarifications, such as why the user changed understanding;
- remove small talk, repeated confirmations, and operational detail that does not affect the reasoning;
- redact secrets and sensitive paths that may appear in raw chat;
- the final document is always the authoritative source for current behavior; discussion is not an implementation specification.

## 11. ADRs

Create an ADR only when at least one of the following applies:

- it changes system, process, or module boundaries;
- it changes security, trust, or permission models;
- it changes persistence format or public contracts;
- it is hard or costly to reverse;
- multiple competitive options were rejected;
- new contributors are likely to ask “why was it done this way?” later.

An ADR must include at least:

- Context;
- Options considered;
- Decision;
- Consequences;
- Status;
- Date;
- Related documents.

Do not create ADRs for ordinary UI copy, component naming, or local implementation details.

## 12. Archiving and Supersession

- when content is replaced by a new document, set status to `Superseded` and link to the replacement first;
- when a document no longer participates in current design as a whole, it may move to `archive/`;
- old entries in discussions are not moved or rewritten; append supersession notes only;
- archived files must retain provenance, original status, and supersession links;
- do not manufacture surface consistency by deleting history.

## 13. AI Maintenance Workflow

When creating, moving, splitting, archiving, or substantially modifying project documentation:

1. read this guide and `docs/README.md`;
2. search existing documentation to avoid duplicate authorities;
3. determine type, status, and authority scope;
4. choose a stable filename and directory;
5. update the corresponding final document;
6. if substantive discussion occurred, append the corresponding discussion timeline;
7. if a long-lived important decision was made, assess whether an ADR is needed;
8. update the main index and related bidirectional links;
9. record known conflicts and supersession relationships;
10. check all relative links, formatting, and sensitive information;
11. do not describe planned features as already implemented;
12. in the outcome, state which documents were added, updated, or still pending decision.

## 14. Current Migration Strategy

Documents currently keep their existing paths. Migrate progressively as follows:

- move requirement documents to `requirements/` on substantive revision;
- move system architecture documents to `architecture/` on substantive revision;
- module documents remain under `modules/`;
- the Git commit convention may later move to `guides/`;
- every move must update the index and all links;
- do not perform bulk path refactors unrelated to the current task.
