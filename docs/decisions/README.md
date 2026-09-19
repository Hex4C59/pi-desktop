# Architecture Decision Record Index

English | [中文](README.zh.md)

- Type: Reference
- Status: Accepted
- Created: 2026-09-18
- Last reviewed: 2026-09-19
- Authority: ADR navigation and numbering rules
- Maintenance guide: [Documentation Organization and Maintenance Guide](../document-conventions.md)

This directory contains important decisions that affect system boundaries, security and trust models, persistence, public contracts, or choices that are difficult to reverse.

## Numbering and naming

ADRs use four-digit sequential numbers and lowercase kebab-case:

```text
0001-build-baseline.md
0002-runtime-host.md
```

Gate status (Open / In spike / Accepted) is authoritative in [architecture-gates.md](../reference/architecture-gates.md). This index lists **ADR files only**.

## Accepted ADRs

| ID | Title | Gate(s) closed | File |
|----|--------|----------------|------|
| 0001 | Build and packaging baseline | `gate-build-baseline` | [0001-build-baseline.md](0001-build-baseline.md) |

## Pending ADR

Maintainer confirmed a decision but the ADR file is not merged yet. Mirror `Decision: pending-adr` on [`ACTIVE.md`](../../ACTIVE.md).

| ID | Gate | ACTIVE WI | Notes |
|----|------|-----------|-------|
| — | — | — | *(empty)* |

## Expected queue (not ADRs)

Planned numbering hints only—**do not create Accepted ADR files until the maintainer confirms** after the linked spike or discussion.

| Planned ID | Gate | ACTIVE | When to create the file |
|------------|------|--------|-------------------------|
| `0002-runtime-host` | `gate-runtime-host` | WI-003 (queued) | After runtime-host spike and maintainer confirmation |
| *(TBD)* | `gate-sub-agent`, `gate-project-trust-worktree`, `gate-task-persistence`, `gate-apply-journal`, `gate-attachments` | — | Each closes only with its own Accepted ADR |

## Creation criteria

Create an ADR only when a decision meets at least one of these criteria:

- changes system, process, or module boundaries;
- changes the security, trust, or permission model;
- changes a persistence format or public contract;
- is difficult or expensive to reverse;
- rejects multiple competitive options;
- is likely to make future contributors ask, "Why was this done?"

Do not create ADRs for ordinary UI copy, component naming, or local implementation details.

## When to write an ADR

Write an ADR **after** the maintainer confirms a decision—not when the agent first proposes options.

| Trigger | ADR required? |
|---------|----------------|
| Close an [architecture gate](../reference/architecture-gates.md) (`Open` → `Accepted`) | **Yes** — Accepted ADR with gate ID in metadata or body |
| Maintainer chooses among durable options (hard to reverse) | **Yes** |
| Locks a public contract (IPC surface, persistence format, task IDs, event envelopes) | **Yes** |
| Changes security or project trust model | **Yes** |
| PRD or architecture says “spike/ADR before implementation” | **Yes**, before claiming the capability implemented |
| Brainstorming, spike not finished, or gate still `In spike` | **No** — use `docs/discussions/`, spike notes, or `ACTIVE.md` |
| Local implementation detail, easy to change | **No** |

### Discussion, spike, and ADR

| Artifact | Purpose | When |
|----------|---------|------|
| `docs/discussions/` | Process, options, reasoning | Substantive debate; not implementation authority |
| Spike evidence | Commands, pass/fail, blockers | During or after a spike work item; link from ADR |
| ADR `docs/decisions/000x-….md` | **Confirmed** decision and consequences | After maintainer approval (e.g. 「可以」「按 A 做」) when a trigger above applies |

Typical sequence for a gated topic: discussion or WI discussion draft → maintainer approves approach → spike (if needed) → maintainer confirms outcome → **write Accepted ADR** → update [architecture gates](../reference/architecture-gates.md) → continue build work.

Do not write an Accepted ADR for a failed or open spike. Update the gate to stay `Open` or `In spike` and record evidence in the work item or discussion.

### ADR document template

Create `000n-short-title.md` (English authoritative; add `000n-short-title.zh.md` when pairing). Suggested sections:

```markdown
# ADR 000n: Title

- Type: Decision
- Status: Accepted
- Created: YYYY-MM-DD
- Gate: gate-id (if applicable)
- Supersedes: none | ADR 000x
- Related: architecture section, ACTIVE WI-xxx, discussion link

## Context
## Decision
## Consequences
## Spike evidence (links or summary)
```

Keep ADRs short (about one screen). Details belong in architecture, `docs/modules/`, or `docs/reference/`.

### Quick check

```
Closing an architecture gate? ──yes──→ Accepted ADR required
        │no
Chosen among hard-to-reverse options? ──yes──→ ADR required
        │no
Locking IPC / persistence / security model? ──yes──→ ADR required
        │no
        └──→ No ADR (discussion / spike / code only)
```

Track gate status in [architecture-gates.md](../reference/architecture-gates.md). Link each Accepted ADR from that table.
