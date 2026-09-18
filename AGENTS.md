# AGENTS.md

English | [中文](AGENTS.zh.md)

This kernel applies to the entire `pi-desktop` repository for human contributors and coding agents. Detailed constraints live in [`docs/guides/agent/`](docs/guides/agent/README.md) and load progressively (see **Load map**). Those playbooks are binding for their topic.

## Authority stack

On conflict: (1) this kernel and agent playbooks for engineering constraints; (2) `product-requirements.md` for user-visible behavior; (3) `architecture/electron-architecture.md` for structure and owners; (4) `ACTIVE.md` for current work item; (5) `docs/discussions/` and `docs/archive/` are context only—not implementation authority.

For questions of fact, phase, or repository state, **evidence in the repo outweighs agreeing with the maintainer’s framing**. Product tradeoffs and whether to start work remain the maintainer’s decision.

## Project facts

- Linux desktop client for pi only (not Windows/macOS today).
- Initialization phase: do not describe planned features as shipped.
- Sibling `../pi` is read-only unless the user explicitly requests changes there.
- Production builds must not depend on `../pi`, absolute paths to it, or undeclared workspace links.
- pi behavior and public APIs come from upstream code, types, and docs—not assumption.

## Non-negotiables (L0)

- pi runs as the launching user; project trust is not a sandbox—UI and copy must not imply otherwise.
- Saved API keys, OAuth tokens, and auth file contents must not reach the renderer, frontend persistence, telemetry, ordinary logs, or notifications. New credentials use a dedicated one-shot IPC channel and are cleared from UI state after submit.
- Expose only named, allowlisted IPC operations; validate input in the host. No generic “run arbitrary host code” API.
- Do not read or write session JSONL for session features; use SDK or RPC session APIs.
- Do not reimplement pi’s agent loop, providers, tools, compaction, or session management in the desktop app.
- Do not create, modify, merge, or rewrite Git commits unless the user explicitly asks.

## Judgment and honesty (L0)

- Give a **clear conclusion** when the repo allows one (`yes` / `no` / `partly` / `not yet` / `unknown`). Do not default to agreement because the question sounds like it expects praise or more work.
- Ground claims in **this repository** (`ACTIVE.md`, phase, gates, files, commands you ran). Do not invent gaps to appear helpful.
- When asked what to optimize or do next, you **may** answer that **nothing material is needed now**, that **`ACTIVE.md` queue is sufficient**, or that an idea is **premature for the current phase**. List optional ideas only when the maintainer **explicitly** asks for brainstorming, options, or a backlog dump.
- If the maintainer’s premise conflicts with docs or facts, **say so** and cite what you checked. Be specific and professional—not dismissive.
- If evidence is insufficient, say what is missing; do not fake confidence either way.
- This section does not override security L0 above, explicit maintainer instructions for a **scoped task**, or “do not commit unless asked.”

**Mini-examples**

- Maintainer: “We added `docs:verify`—what else should we optimize?”  
  **Good:** “Nothing required before WI-001; optional later: CI for `docs:verify`.”  
  **Bad:** Unrelated new WIs, skills, or rewrites without evidence.

- Maintainer: “Write the Accepted build-baseline ADR now?”  
  **Good:** “No—spike unconfirmed; gate stays `In spike` per `ACTIVE.md`.”  
  **Bad:** Draft Accepted ADR early to please the question.

More patterns: [judgment.md](docs/guides/agent/judgment.md).

## Layer model (L1 summary)

- **Renderer**: views, input, short-lived UI state only—no Node, shell, arbitrary FS, credentials, or pi SDK types.
- **Host**: typed IPC, pi runtime lifecycle, persistence coordination, system capabilities outside the window.
- **Adapter**: SDK/RPC → internal domain events; isolate upstream version changes.
- **pi runtime**: models, agents, tools, resources, sessions (upstream).

Streaming: correlate with `contentIndex` and tool call IDs; treat `message_end.message` as authoritative; rebind after session replacement; on abort, switch, close, or crash, clean up listeners, child processes, and pending requests. Details: [boundaries.md](docs/guides/agent/boundaries.md).

## ACTIVE session pairing

The maintainer may @-mention **only** [`ACTIVE.md`](ACTIVE.md) (or say 「继续 pi-desktop」) to start a session. That is equivalent to attaching both `ACTIVE.md` and the collaboration guide for the agent’s obligations:

1. Read `ACTIVE.md` (including the **Agent session contract** summary at the top and the current WI).
2. Read [`docs/guides/agent-collaboration.md`](docs/guides/agent-collaboration.md) in full **before** proposing or editing application code.

Skip step 2 only for read-only answers with no WI or code changes, unless gates, ADRs, or session-close rules apply. Optional router: [pi-desktop-handoff](.agents/skills/pi-desktop-handoff/SKILL.md) for session or WI close.

## Before you start

1. Read this kernel, [`ACTIVE.md`](ACTIVE.md), [`README.md`](README.md), current tree, `package.json` when present, and relevant tests.
2. For implementation sessions, follow **ACTIVE session pairing** above (collaboration guide is mandatory for agents even when the maintainer did not @ it).
3. Preserve the user’s unrelated Git changes; use the repo’s package manager and scripts—do not swap the stack for preference.
4. If the task changes security, persistence, or pi integration strategy, clarify impact and record the decision before large changes.

## Load map (read before coding in that area)

| If you are… | Read first |
|-------------|------------|
| Starting any implementation session | Maintainer: [`ACTIVE.md`](ACTIVE.md) only; agent: [ACTIVE session pairing](#active-session-pairing) + [agent-collaboration](docs/guides/agent-collaboration.md) |
| Judgment questions (`is this right`, `what else`, optimizations, go/no-go) | [judgment](docs/guides/agent/judgment.md) |
| Defining user-visible behavior | `docs/product-requirements.md`, `docs/architecture/electron-architecture.md` |
| Module ownership and per-module design | [`docs/modules/README.md`](docs/modules/README.md) |
| Public contract shapes (IPC, events, states, persistence) | [`docs/reference/README.md`](docs/reference/README.md) when `Outline`/`Living` |
| Cross-layer, streaming, adapter, lifecycle | [boundaries](docs/guides/agent/boundaries.md) |
| pi SDK, RPC, sessions, upgrades | [pi-integration](docs/guides/agent/pi-integration.md) |
| IPC, preload, credentials, trust, shell | [security](docs/guides/agent/security.md) |
| TypeScript in app source | [code-style](docs/guides/code-style.md), [typescript](docs/guides/agent/typescript.md) |
| Maintainer acceptance of code changes | [code-review](docs/guides/code-review.md) |
| Renderer / UI | [ui](docs/guides/agent/ui.md) |
| Tests or claiming verification | [testing](docs/guides/agent/testing.md) |
| Scripts, CI, dev/build/package | [commands](docs/guides/agent/commands.md) |
| Breaking refactors or repo layout | [change-policy](docs/guides/agent/change-policy.md) |
| Docs structure, index, discussions | [documentation](docs/guides/agent/documentation.md) |
| Creating commits or commit messages | [`docs/git-commit-convention.md`](docs/git-commit-convention.md) (English only) |
| Editing by file path (which playbook to open) | [path-triggers](docs/guides/agent/path-triggers.md) |

Index: [docs/guides/agent/README.md](docs/guides/agent/README.md).

## Task completion (kernel)

1. End-to-end usable behavior—not static UI only.
2. Types, errors, cancellation, cleanup, and empty states handled.
3. Relevant tests added or updated and actually run; lint/typecheck pass.
4. Security boundaries not expanded without explicit verification.
5. User-visible and command changes reflected in docs when applicable.

Further detail: [testing.md](docs/guides/agent/testing.md), [documentation.md](docs/guides/agent/documentation.md).

## Upstream pointers

- `../pi/packages/coding-agent/docs/sdk.md`, `rpc.md`, `security.md`, `session-format.md`, `extensions.md`
- `../pi/packages/coding-agent/examples/sdk/`
- For pi integration tasks, read those docs and verify exported types; record local `../pi` commit when used—it must not become a release dependency.
