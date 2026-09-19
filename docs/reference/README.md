# Reference index (lookup and contracts)

English | [中文](README.zh.md)

- Type: Reference
- Status: Accepted
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Applies to: stable lookup material under `docs/reference/`
- Authority: navigation and contract document status; contract **facts** when status is `Outline` or `Living`
- Related: [Documentation Index](../README.md), [`architecture/electron-architecture.md`](../architecture/electron-architecture.md), [`modules/README.md`](../modules/README.md)

## Other reference documents

| Document | Purpose |
|----------|---------|
| [glossary.md](glossary.md) | Terminology for paired documentation |
| [architecture-gates.md](architecture-gates.md) | Gate IDs and status (authoritative for gates) |

Gate closure requires an Accepted ADR—see [decisions/README.md](../decisions/README.md). Contract pages do **not** close gates.

## Implementation contracts (catalog)

These files record **what the code must match** (IPC allowlist, DTOs, states, on-disk layout). They derive from architecture and ADRs; they do not replace them.

| Contract ID | File | Status | Fill when | Gate / WI | Module owner |
|-------------|------|--------|-----------|-----------|--------------|
| `contract-ipc` | [ipc-channels.md](ipc-channels.md) | `Outline` | Shell channels (WI-002); Living when business IPC stabilizes | WI-002 | [ipc-registration](../modules/ipc-registration.md) |
| `contract-events` | [domain-events.md](domain-events.md) | `Planned` | Single-task streaming slice | WI-004 (queued) | Adapter / `TaskEventStream` (see [modules](../modules/README.md)) |
| `contract-states` | [task-and-runtime-states.md](task-and-runtime-states.md) | `Planned` | With or just before domain events | WI-004 (queued) | `TaskRuntimeController`, Renderer |
| `contract-persistence` | [persistence-layout.md](persistence-layout.md) | `Planned` | After persistence ADR | `gate-task-persistence`, apply journal gate | `TaskRegistry`, persistence adapter |

### Contract document status

| Status | Meaning |
|--------|---------|
| `Planned` | Shell only—**not** an implementation authority |
| `Outline` | Structure and architecture links; partial tables |
| `Living` | Kept in sync with `src/shared/contracts` and tests in the same change set |
| `Superseded` | Replaced; kept for history |

## Authority chain

```text
electron-architecture + Accepted ADRs
        ↓ (summarize + link, do not duplicate long sections)
docs/modules/* (ownership, exclusions, tests)
        ↓
docs/reference/* contracts (shapes, enums, channels, paths)
        ↓ (same PR when Living)
src/shared/contracts + schema/contract tests
```

## Maintenance rules

1. When adding or changing IPC, domain events, task/runtime states, or persistence artifacts, update the relevant contract page in the **same change** once that page is `Outline` or `Living`.
2. Link to architecture sections instead of copying them; fix the contract page if architecture or an ADR changes.
3. Do not invent channel names, file paths, or schema versions on `Planned` pages.
4. `persistence-layout.md` uses one file with two sections (task store; apply journal). The apply section stays empty until `gate-apply-journal` is decided.

## Agent and maintainer use

- Before implementing IPC: [ipc-channels.md](ipc-channels.md) when WI-002 progresses (and [security playbook](../guides/agent/security.md)).
- Before adapter/renderer DTO work: [domain-events.md](domain-events.md), [task-and-runtime-states.md](task-and-runtime-states.md) when WI-004 progresses.
- Kernel load map: [AGENTS.md](../../AGENTS.md).
- Automated checks: `npm run docs:verify`; semantic audit: [doc-drift-audit playbook](../guides/agent/doc-drift-audit.md).
