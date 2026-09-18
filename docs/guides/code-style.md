# pi-desktop Code Style Charter

English | [中文](code-style.zh.md)

- Type: Guide
- Status: Accepted
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Applies to: all application source under `src/` (when present) and shared tooling that ships with the app
- Authority: engineering values, structure, naming, errors, trust boundaries, abstraction, and comment philosophy for human and agent authors
- Related: [typescript playbook](agent/typescript.md), [code review checklist](code-review.md), [boundaries](agent/boundaries.md), [security](agent/security.md), [change-policy](agent/change-policy.md)

This charter uses [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) terms: **must**, **must not**, **should**, **should not**, **may**. **Prefer** and **avoid** mean **should** and **should not**.

Agents implement against the [typescript playbook](agent/typescript.md) checklist; this document explains **why** and fills gaps the playbook does not repeat.

## 1. Goals

1. **Readable by humans** — linear flows, domain names, and types carry meaning; agents must not optimize for abstract “elegance.”
2. **Safe at boundaries** — validate and fail clearly at IPC, preload, persistence, and SDK edges; trust types inside a layer.
3. **Aligned with architecture** — module owners in [`modules/README.md`](../modules/README.md) and §20 paths in [`electron-architecture.md`](../architecture/electron-architecture.md).
4. **Reviewable** — scope matches [`ACTIVE.md`](../../ACTIVE.md); mechanical rules move to lint/format after WI-001 scaffold.

## 2. Layering and files

### Must

- Respect Renderer → Host → Adapter → pi runtime dependencies ([boundaries](agent/boundaries.md)). Renderer must not import Node, pi SDK, or host internals.
- Place code under the planned §20 paths for its **owner** in [`modules/README.md`](../modules/README.md). Cross-owner calls go through named coordinators or public module entry points, not deep imports into another owner’s internals.
- Keep `src/shared/contracts` (when present) limited to serializable shapes aligned with [`reference/`](../reference/README.md) contract pages when `Outline` or `Living`.

### Must not

- Add `core/`, `common/`, or catch-all `utils/` trees without an architecture or Accepted ADR update.
- Introduce a second abstraction layer “for future flexibility” with only one consumer.

### Should

- One primary concept per file (one registry group, one IPC surface area, one React feature domain). If a file grows past ~300 lines, split by semantic block or owner—not by arbitrary line count alone.

## 3. Naming

| Kind | Convention | Example |
|------|------------|---------|
| Non-UI modules | `kebab-case.ts` | `task-runtime-controller.ts` |
| React components | `PascalCase.tsx` matching export | `TaskComposer.tsx` |
| Hooks | `use` + `PascalCase` | `useTaskStream.ts` |
| Types / interfaces | noun phrase, no `I` prefix | `TaskRuntimeState` |
| Functions | verb phrase | `registerIpcHandlers` |
| Booleans | `is` / `has` / `can` | `isAborting` |
| IPC channels | verb + resource, match contract when Living | `task:send-message` |
| Tests | adjacent `*.test.ts` / `*.test.tsx` | `task-registry.test.ts` |

**Must not** use `Manager`, `Handler`, or `Util` as the main noun unless the architecture owner name requires it.

## 4. Types and control flow

### Must

- Keep `strict` TypeScript enabled. Avoid `any`; narrow `unknown` at trust boundaries with schemas or type guards.
- Model states and events as discriminated unions; handle exhaustively (`switch` + `never` helper for impossible cases).
- Support cancellation or explicit dispose for long-running work ([boundaries](agent/boundaries.md) streaming and §17 cleanup).
- Use `async`/`await`; propagate errors—do not swallow them.

### Must not

- Use `as` to bypass validation at boundaries, or non-null assertions (`!`) in application code (tests may use sparingly).
- Use string `enum` for event or IPC discriminant types; use string literal unions consistent with contracts.
- Use empty `catch`, log-and-continue as “handling,” or wrap entire functions in `try/catch` without a boundary reason.
- Nest more than three levels without refactoring or an documented exception in the work item.

### Should

- Prefer `readonly` and immutable updates in renderer state where practical.
- Prefer early return over deep nesting.
- Decide `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` when WI-001 creates `tsconfig` and document the choice in `README.md`.

## 5. Trust boundaries and “defensive” code

Validate where data is **untrusted** or **crosses a process/layer boundary**:

| Location | Trust | Validate / fail |
|----------|-------|-----------------|
| IPC payload, preload arguments | Low | Same rules as host; shared schema when Living |
| Persistence read, user-selected paths | Low | Schema + safe errors |
| pi SDK / RPC events at adapter | Medium | Map known variants; unknown → log + drop or domain error per [boundaries](agent/boundaries.md) |
| Same-module private calls after narrowing | High | **Must not** duplicate redundant null checks |

**Must not** implement different validation logic in preload and host for the same field. **Must not** add branches for states the architecture rules out unless the work item covers abort, crash, or session replacement cleanup.

## 6. Errors and logging

### Must

- Return structured failures over IPC (`code`, user-safe `message`, optional `recoverable`); do not send stack traces to the renderer as primary UI text.
- Map adapter failures to domain errors; preserve `cause` for diagnostics on the host only.
- Follow L0 in [`AGENTS.md`](../../AGENTS.md): no secrets, tokens, or auth file contents in renderer, ordinary logs, telemetry, or notifications.

### Should

- Log a given failure once at the boundary that owns recovery, not in every helper.
- User-visible strings should be ready for localization (English-only v1 is fine; avoid scattered magic sentences).

## 7. Abstraction and reuse

### May abstract when

- The same logic appears in **two or more** real call sites (not hypothetical future use).
- Isolating **pi SDK / RPC** shape changes (adapter layer).
- Implementing an architecture §8 **owner** or a **Living** contract in `src/shared/contracts`.

### Must not

- Introduce strategy/factory/registry patterns with a single implementation.
- Extract one-line or five-line helpers that do not improve a call site’s readability.
- Perform repo-wide refactors or dependency upgrades in the same task as a feature ([change-policy](agent/change-policy.md), [typescript](agent/typescript.md)).

### Should

- Prefer vertical slices that match `ACTIVE.md` work items over framework-style “platform” code during initialization.

## 8. Comments (philosophy)

Comments are a **fourth information channel** beside types, tests, and contract docs.

| Class | Purpose | Where |
|-------|---------|--------|
| **Contract** | Preconditions, invariants, link to contract ID | JSDoc on exported APIs and `shared/contracts` types |
| **Invariant** | Rule code does not enforce structurally | Adjacent to the branch or function that relies on it |
| **Rationale (why)** | Rejected alternatives, non-obvious trade-offs | Short note + link to ADR or module doc |
| **Beware** | “Do not simplify” warnings | Next to dispose order, subscription lifetime, generation/incarnation checks |

### Must

- Comment **why**, invariants, and **beware**—not what the next line does.
- Update or delete comments in the **same change** as behavior; treat stale comments as bugs.

### Must not

- Paste architecture sections into file headers; link [`modules/`](../modules/README.md) instead.
- Leave `TODO`/`FIXME` without a `WI-xxx`, gate ID, or tracked issue reference.
- Keep agent-generated step-by-step narrations of obvious code.

System-wide decisions belong in **ADRs**; channel and schema tables belong in **`docs/reference/`** when Living—not in long comment blocks.

## 9. Renderer-specific

Follow [ui.md](agent/ui.md) for product UX. **Must not** put business rules in large `useEffect` blocks; effects sync external systems (IPC subscriptions, layout observers). Prefer named hooks and small components over configuration-driven render trees.

## 10. Mechanical enforcement (WI-001)

Until the Electron scaffold exists, only documentation and manual review apply.

After WI-001:

- Add `npm run check` (or equivalent) combining **format**, **lint**, and **typecheck**; CI must call the same scripts ([commands](agent/commands.md)).
- Choose **Biome** or **ESLint + Prettier** to match the Forge/Vite template; record the choice in the WI-001 spike / build-baseline ADR.
- Initial lint goals (extend as needed): no `any`, no non-null assertion in app code, no unused disable directives without justification, optional `@typescript-eslint/no-unnecessary-condition` to reduce bogus defensive branches.

List rules that are **only** enforced by tooling in `README.md` after scaffold; this charter remains the source for judgment calls tooling cannot make.

## 11. Authority chain

On conflict: [`AGENTS.md`](../../AGENTS.md) L0 → this charter → [typescript playbook](agent/typescript.md) → topic playbooks (boundaries, security, ui, testing) → architecture and Living contracts.
