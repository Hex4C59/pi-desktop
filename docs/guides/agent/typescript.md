# Agent playbook: TypeScript and code quality

English | [中文](typescript.zh.md)

- Type: Guide
- Status: Accepted
- Last reviewed: 2026-09-19
- Authority: executable checklist for TypeScript in application packages
- When: implementing or reviewing `.ts` / `.tsx` in application packages

Read the [code style charter](../code-style.md) for rationale. This playbook is what agents **must** follow in implementation sessions.

## Must

### Types and data

- Enable and keep **strict** type checking. Avoid `any`; use `unknown` with schemas or type guards at trust boundaries.
- Model events and state with **discriminated unions**; exhaustively handle pi messages, tools, and lifecycle events (`never` for impossible cases).
- Do not use string `enum` for IPC or domain event discriminants; use literal unions aligned with contract pages when `Outline` or `Living`.
- Do not use `as` at boundaries or non-null assertions (`!`) in application code.

### Modules and imports

- Keep imports at file top. Avoid hidden dynamic imports unless desktop packaging or explicit lazy loading requires them.
- Place files under the correct architecture §20 path and module owner ([modules/README.md](../../modules/README.md)).
- Do not add `core/`, `common/`, or catch-all `utils/` directories without architecture or ADR update.

### Naming and files

- Non-UI files: `kebab-case.ts`. React components: `PascalCase.tsx` matching the export. Hooks: `use` + `PascalCase`.
- Functions: verb phrases. Booleans: `is` / `has` / `can`. IPC names follow Living contract when available.
- Do not name types or modules `Manager`, `Handler`, or `Util` as the primary noun unless architecture requires it.

### Control flow and async

- Prefer early return; do not nest more than three levels without refactoring.
- Use `async`/`await`. Long-running work must support **AbortSignal** or explicit dispose per [boundaries.md](boundaries.md).
- Do not use empty `catch`, swallow errors, or wrap whole functions in `try/catch` without a boundary reason.

### Trust boundaries

- Validate IPC, preload args, persistence reads, and adapter-facing SDK data once at the edge with shared rules when Living.
- Do not duplicate redundant null checks inside the same layer after types narrow.
- Do not add defensive branches for states ruled out by architecture except documented abort/crash/session-replacement cleanup.

### Errors and logging

- IPC failures: structured, user-safe messages; no stack traces as primary renderer UI text.
- Do not log credentials, tokens, or auth file contents ([security.md](security.md), `AGENTS.md` L0).

### Abstraction and scope

- Extract shared code only after **two** real duplications, or to isolate pi SDK/RPC, or to implement a contract/§8 owner.
- Do not introduce single-consumer factories, strategies, or generic registries.
- Do not perform unrelated refactors, bulk formatting, or dependency upgrades in the same task ([change-policy.md](change-policy.md)).

### Comments

- Comment **invariants**, **why**, and **beware**—not line-by-line narration. Link ADRs and module docs instead of pasting them.
- Update or remove comments in the same change as behavior. No `TODO` without `WI-xxx`, gate ID, or issue reference.

### Verification

- Run project `check`/lint/typecheck/test scripts when they exist; report results before claiming done ([testing.md](testing.md), [commands.md](commands.md)).

## Should

- Use `readonly` where it clarifies intent. Prefer immutable renderer updates when practical.
- Log a failure once at the owning boundary, not in every helper.
- Keep one primary concept per file; split when readability suffers (~300 lines is a signal, not a hard cap).
- Prefer vertical slices matching [`ACTIVE.md`](../../../ACTIVE.md) over platform-style frameworks.

## Pointers

- Charter: [code-style.md](../code-style.md)
- Maintainer checklist: [code-review.md](../code-review.md)
- Layers and streaming: [boundaries.md](boundaries.md)
- Contracts: [reference/README.md](../../reference/README.md)
- Renderer UX: [ui.md](ui.md)
- Mechanical rules after scaffold: [code-style §10](../code-style.md#10-mechanical-enforcement-wi-001), [commands.md](commands.md)
