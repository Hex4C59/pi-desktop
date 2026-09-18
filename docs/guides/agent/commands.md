# Agent playbook: Commands and CI

English | [中文](commands.zh.md)

- Type: Guide
- Status: Accepted
- Authority: single source of truth for dev/test/build commands
- When: adding scripts, CI, packaging, or documenting how to run the app

## Must

- Until `package.json` exists, there are no standard app commands—do not invent hidden one-off workflows.
- After the scaffold exists:
  - define commands only in `package.json` scripts;
  - document install, dev, check, test, and Linux packaging in `README.md`;
  - CI must call the same scripts—no CI-only hidden workflows;
  - do not bypass failing lint, typecheck, or tests to finish a task.
- WI-001 must add mechanical enforcement aligned with [code-style §10](../code-style.md#10-mechanical-enforcement-wi-001): format + lint + typecheck via `npm run check` (name may match template). Choose Biome or ESLint + Prettier with the Forge/Vite scaffold; record the choice in the build-baseline ADR.

## Pointers

- Build and packaging gates: `docs/architecture/electron-architecture.md` §21
- Current work item: [`ACTIVE.md`](../../../ACTIVE.md)
