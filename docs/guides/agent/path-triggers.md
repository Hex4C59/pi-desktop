# Agent path triggers (playbook loading)

English | [中文](path-triggers.zh.md)

- Type: Guide
- Status: Accepted
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Applies to: coding agents editing repository files (any editor or host)
- Authority: when to load agent playbooks by path pattern; does not add constraints beyond linked playbooks and [`AGENTS.md`](../../../AGENTS.md)
- Related: [Playbook index](README.md), [Load map](../../../AGENTS.md#load-map-read-before-coding-in-that-area)

Before editing files that match a row below, read the linked playbook in full. Patterns follow the planned layout in [`architecture/electron-architecture.md`](../../architecture/electron-architecture.md) §20; adjust patterns only when that layout or an Accepted ADR changes.

## Trigger table

| Path patterns (examples) | Read first | Reminders |
|--------------------------|------------|-----------|
| `src/**/adapter/**`, `src/**/main/**`, `src/**/preload/**`, `**/adapter/**`, `**/ipc/**` | [boundaries.md](boundaries.md) | No Node/shell/credentials in Renderer; adapter → serializable events; streaming invariants |
| `src/**/preload/**`, `src/**/main/**`, `**/*preload*`, `**/*ipc*` | [security.md](security.md) | Allowlisted IPC; host validation; no generic host execution; trust flow |
| `src/**/adapter/**`, `**/*adapter*`, `**/*pi-*` | [pi-integration.md](pi-integration.md) | SDK default; no session JSONL; pin versions |
| `src/**/renderer/**`, `**/*.tsx` | [ui.md](ui.md), [boundaries.md](boundaries.md) | Dev-tool UX; stable streaming layout; no host/pi imports in renderer |
| `src/shared/**`, `**/contracts/**` | [reference/README.md](../../reference/README.md) | Contract pages when `Outline`/`Living`; do not invent DTOs from `Planned` shells |
| `**/*.{ts,tsx}` (app source, not docs-only) | [code-style.md](../code-style.md), [typescript.md](typescript.md) | Trust boundaries; no single-consumer abstractions; comments = why/invariant |
| `**/*.test.*`, `**/*.spec.*`, `**/tests/**`, `**/__tests__/**` | [testing.md](testing.md) | Fakes/fixtures; run checks before claiming done |
| `docs/**` | [documentation.md](documentation.md), [document-conventions.md](../../document-conventions.md) | Update index; English authority for pairs |

## Task-based triggers (no path)

Use the [AGENTS.md load map](../../../AGENTS.md#load-map-read-before-coding-in-that-area) when the work item type is clearer than paths (for example gates, ADRs, or `ACTIVE.md` WI scope).

## Maintenance

When `src/` layout changes materially, update patterns in this file in the same change set as architecture §20 or module index updates.
