# Agent constraint playbooks

English | [中文](README.zh.md)

- Type: Guide
- Status: Accepted
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Applies to: coding agents and maintainers implementing pi-desktop
- Authority: detailed agent constraints referenced from root [`AGENTS.md`](../../../AGENTS.md) load map; equally binding with the kernel for their topic
- Related: [`agent-collaboration.md`](../agent-collaboration.md), [`../../../ACTIVE.md`](../../../ACTIVE.md)

The kernel [`AGENTS.md`](../../../AGENTS.md) is always loaded. These playbooks load **on demand** via the kernel load map, [path triggers](path-triggers.md), and session context (`ACTIVE.md`).

## Repository skills (Cursor)

| Skill | When |
|-------|------|
| [pi-desktop-handoff](../../../.agents/skills/pi-desktop-handoff/SKILL.md) | Session open; WI / session close (`docs:verify`, drift audit, gates, Last session) |

Authority remains in playbooks and `ACTIVE.md`; the skill is a thin router.

## Playbooks

| Playbook | When to read |
|----------|----------------|
| [path-triggers.md](path-triggers.md) | Before editing matched source or `docs/` paths (see trigger table) |
| [judgment.md](judgment.md) | Go/no-go, “what else”, “am I right”; honest answers without padding |
| [doc-drift-audit.md](doc-drift-audit.md) | Periodic or post-WI documentation drift audit (`npm run docs:verify` first) |
| [change-policy.md](change-policy.md) | Refactors, breaking layout, dependency or IPC contract changes |
| [boundaries.md](boundaries.md) | Any cross-layer work; streaming, adapter, or runtime lifecycle |
| [pi-integration.md](pi-integration.md) | pi SDK, RPC, sessions, adapters, package upgrades |
| [security.md](security.md) | IPC, preload, credentials, trust, shell, logs, untrusted content |
| [code-style.md](../code-style.md) | Code style charter (values, naming, boundaries, comments) |
| [code-review.md](../code-review.md) | Maintainer pass/fail checklist after agent delivery |
| [typescript.md](typescript.md) | Executable TypeScript checklist for agents |
| [ui.md](ui.md) | Renderer, components, layout, accessibility |
| [testing.md](testing.md) | Tests, fixtures, verification before claiming done |
| [commands.md](commands.md) | `package.json` scripts, CI, dev/build/package commands |
| [documentation.md](documentation.md) | Creating or restructuring repo documentation |

Product behavior and system structure remain in `product-requirements.md` and `architecture/electron-architecture.md`, not in these playbooks.
