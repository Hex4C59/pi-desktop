# Agent and Maintainer Collaboration Guide

English | [中文](agent-collaboration.zh.md)

- Type: Guide
- Status: Accepted
- Created: 2026-09-19
- Last reviewed: 2026-09-19 (ADR triggers)
- Applies to: day-to-day development with coding agents and human product decisions
- Authority: collaboration process, session handoff, and work-item tracking conventions
- Related: [Documentation Index](../README.md), repository root [`ACTIVE.md`](../../ACTIVE.md), [`AGENTS.md`](../../AGENTS.md)

## 1. Purpose

pi-desktop is built through discussion between a maintainer (product judgment and acceptance) and coding agents (technical sequencing and implementation). Chat context does not persist across new windows or compression; **repository files** carry the current work item and handoff.

This guide does not define product behavior or system architecture. Those remain in `product-requirements.md` and `architecture/electron-architecture.md`.

## 2. Division of responsibility

| Maintainer | Coding agent |
|------------|----------------|
| States goals, preferences, and what feels wrong | Reads PRD, architecture, `AGENTS.md`, and `ACTIVE.md` |
| Chooses among proposed options (`yes` / `no` / `option B`) | Proposes the next work item, approach, risks, and acceptance steps |
| Accepts or rejects outcomes like an end user | Implements, runs checks, documents how to verify |
| Adds ideas to the parking lot | Keeps a single work in progress (WIP=1) |

The maintainer is not expected to know Electron, pi SDK, or agent internals. The agent proposes **what to do next**; the maintainer approves before large or irreversible code changes.

Agent proposals may conclude **“do not do this yet”**, **“current state is sufficient for this phase”**, or **“your premise does not match the repo”**—that is a valid proposal, not a failure to help. Do not pad responses with extra work items only because the maintainer asked an open-ended question; if unclear, ask whether they want a **go/no-go judgment** or **brainstorming**. See [judgment.md](agent/judgment.md).

## 3. Sources of truth

| Question | Authority |
|----------|-----------|
| Security and repo rules | `AGENTS.md` kernel and `docs/guides/agent/` playbooks (see kernel load map) |
| User-visible scope and acceptance | `product-requirements.md` (when `Accepted`; until then, treat as draft input) |
| Structure, boundaries, owners | `architecture/electron-architecture.md` |
| **What we are doing right now** | [`ACTIVE.md`](../../ACTIVE.md) at repository root |
| Why a past choice was made | Accepted ADRs in `docs/decisions/`; discussions are context only |
| Architecture gate status | [`docs/reference/architecture-gates.md`](../reference/architecture-gates.md) |

If chat and `ACTIVE.md` disagree, update `ACTIVE.md` after alignment.

## 4. Work in progress (WIP=1)

- Exactly **one** active work item (`WI-xxx`) in `ACTIVE.md` at a time.
- New ideas go to **Parking lot** in `ACTIVE.md`, not into implementation, until the maintainer reprioritizes on a planning pass.
- Architecture **gates** listed in `docs/README.md` (spikes, ADRs) must not be implemented as finished product features until closed.

## 5. Session rhythm

1. **Open** — Maintainer @-mentions **`ACTIVE.md` only** (or says 「继续 pi-desktop」). Agent reads `ACTIVE.md` and **this guide** (see [ACTIVE session pairing](../../AGENTS.md#active-session-pairing) and the session-contract summary at the top of `ACTIVE.md`), then restates: current WI, last session summary, proposed focus for today, and acceptance steps. Optional: PRD/architecture.
2. **Propose** — Agent gives a short plan (and options if needed), plus **Decision class**: `none` | `spike-only` | `adr-after-approval` (with gate ID if applicable). No broad implementation until the maintainer confirms (e.g. 「可以」「按 A 做」).
3. **Build** — Agent reads [code-style](code-style.md) and [typescript](agent/typescript.md), implements, runs lint/typecheck/tests as applicable, and reports results.
4. **Close** — Agent updates `ACTIVE.md` **Last session** (date, what changed, how to verify, suggested next step). If the maintainer confirmed a decision that requires an ADR, draft or update `docs/decisions/000x-….md` and [architecture-gates.md](../reference/architecture-gates.md) in the same session or flag `Decision: pending-adr` on the work item. Maintainer verifies using [code-review](code-review.md) when reviewing application code and replies pass/fail.

## 6. Maintainer prompts (copy-paste)

**New chat (routine):**

```text
继续 pi-desktop。只 @ ACTIVE.md。
先复述当前 WI、Last session、建议今天完成什么（含验收）；我确认后再改代码。
```

**Acceptance failed:**

```text
验收不通过：期望 … / 实际 …。请只修此问题，再给验收步骤，并更新 ACTIVE。
```

**Parking lot only:**

```text
停车场：……。不要实现，只写入 ACTIVE，继续当前 WI。
```

## 7. Agent obligations

- Propose the next step from PRD, architecture, and `ACTIVE.md` queue; do not require the maintainer to memorize a multi-step workflow.
- Confirm before scaffolding, ADRs, security-boundary changes, or breaking layout.
- On session end, update `ACTIVE.md` Last session even if work is incomplete.
- Report: what changed, commands to run, what was tested, known limits.
- Do not claim features from the first usable release are shipped until spikes, ADRs, and acceptance criteria are met.
- Follow [When to write an ADR](../decisions/README.md#when-to-write-an-adr); the maintainer does not need to remember triggers—the agent labels each proposal.

## 8. ADRs and gates (maintainer-friendly)

- **You approve**; the agent writes ADRs after approval when triggers apply.
- **ADR timing**: after spike/discussion is done and you confirm (not at first proposal).
- **Gate closure** always needs an Accepted ADR linked from [architecture-gates.md](../reference/architecture-gates.md).
- In `ACTIVE.md`, use **Gate ID** (e.g. `gate-build-baseline`) and **Decision** (`none` | `pending-adr` | `0001-slug`).

### Session close: gates and ADRs

When closing a session:

1. If the maintainer **confirmed** a gate-closing decision, draft or update the Accepted ADR, update [architecture-gates.md](../reference/architecture-gates.md), and update [decisions/README.md](../decisions/README.md) Accepted ADRs—or set `Decision: pending-adr` on ACTIVE if the ADR is not done yet.
2. If only spike work progressed, update [architecture-gates.md](../reference/architecture-gates.md) to `In spike` and ACTIVE Last session; **do not** add an Accepted ADR.
3. Proposals must state **gate ID** and **Decision class** so the maintainer does not need to remember ADR triggers.

### Documentation drift

After doc-heavy sessions or before closing a WI that touched gates, ADRs, modules, or reference contracts, run `npm run docs:verify`. For a full audit, follow [doc-drift-audit.md](agent/doc-drift-audit.md).

## 9. Phases (lightweight)

Each work item in `ACTIVE.md` is either:

- **Prepare** — scope, gates, contracts, or discussion; no feature implementation yet.
- **Build** — code and verification.

Finer steps (contracts, IPC before UI) are decided by the agent per work item and recorded in `ACTIVE.md` when relevant.

## Maintenance (session contract summary)

When §5–§8 change substantively, update the **Agent session contract** table at the top of [`ACTIVE.md`](../../ACTIVE.md) in the same change set so a maintainer who only @-mentions `ACTIVE.md` still gets an accurate summary.
