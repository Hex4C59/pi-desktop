# Architecture gates tracker

English | [中文](architecture-gates.zh.md)

- Type: Reference
- Status: Accepted
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Applies to: first usable release architecture blockers listed in [Documentation Index](../README.md)
- Authority: gate identifiers, status, and links to ADRs and work items—not substitute for ADR text
- Related: [ADR index](../decisions/README.md), [`ACTIVE.md`](../../ACTIVE.md), [`architecture/electron-architecture.md`](../architecture/electron-architecture.md)

Each gate must reach **Accepted** (linked Accepted ADR) before docs or UI describe the capability as implemented. While **Open** or **In spike**, treat the area as Proposed only.

**Authoritative gate status lives in this file only.** [ADR files](../decisions/README.md#accepted-adrs) record decisions; do not duplicate status in `docs/README.md`.

## What to do by gate status

| Status | Meaning for development |
|--------|-------------------------|
| `Open` | No assigned spike WI yet—discuss whether to spike; do not implement features that depend on this gate |
| `In spike` | Work only within the linked **ACTIVE** work item (usually spike/scaffold); do not treat the gate as closed |
| `Accepted` | **Accepted ADR required**; implementation may rely on that ADR |

## Gate status values

| Status | Meaning |
|--------|---------|
| `Open` | Not decided; no accepted ADR |
| `In spike` | Active work item (see `ACTIVE.md`); experiment or discussion in progress |
| `Accepted` | Closed; link to `docs/decisions/000x-….md` with Status Accepted |

## Gates (first usable release)

| ID | Topic | Status | ADR | ACTIVE | Next action |
|----|--------|--------|-----|--------|-------------|
| `gate-build-baseline` | npm + Electron Forge/Vite and first Linux packaging evaluation | `Accepted` | [0001-build-baseline](../decisions/0001-build-baseline.md) | WI-001 (closed) | — |
| `gate-runtime-host` | pi runtime in Electron Main vs utility/child process | `Open` | — | WI-003 (queued) | Start WI-003 spike after toolchain baseline ADR |
| `gate-sub-agent` | Sub-agent integration for pinned pi version | `Open` | — | — | Spike per PRD/architecture before sub-agent features |
| `gate-project-trust-worktree` | Project trust public API mapping for internal worktrees | `Open` | — | — | ADR when trust/worktree flow is decided |
| `gate-task-persistence` | Task persistence implementation and schema | `Open` | — | — | ADR before persistence implementation |
| `gate-apply-journal` | Apply algorithm and recovery journal | `Open` | — | — | Spike + ADR before apply feature |
| `gate-attachments` | Attachment allowlist and limits | `Open` | — | — | ADR when allowlist is fixed |

Update this table when a gate moves status or when an ADR is added. Record conflicts in [Documentation Index](../README.md) if needed.

## When an ADR is required

See [When to write an ADR](../decisions/README.md#when-to-write-an-adr). Closing any row above requires an **Accepted** ADR (or an explicit documented deferral recorded in an ADR that states what is *not* decided yet—avoid empty Accepted ADRs).
