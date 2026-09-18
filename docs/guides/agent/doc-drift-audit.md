# Agent playbook: Documentation drift audit

English | [中文](doc-drift-audit.zh.md)

- Type: Guide
- Status: Accepted
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Applies to: periodic or milestone documentation consistency reviews
- Authority: audit procedure and report format; does not change product or architecture conclusions without maintainer approval
- Related: [documentation playbook](documentation.md), [reference index](../../reference/README.md)

## Purpose

The maintainer cannot manually re-read every document. Use **automated checks first**, then an **agent audit** for semantic drift that scripts cannot see.

## Step 1 — Run automated verification (required)

From repository root:

```bash
npm run docs:verify
```

This runs:

- **Structural verify** — broken links, gate vs ADR consistency, contract catalog vs file `Status`, ADR index vs files on disk, warnings for risky archive links
- **docs:i18n:check** — bilingual pairs and translation metadata

Fix all **errors** before reporting audit complete. **Warnings** go into the audit report with suggested actions.

## Step 2 — Scope (do not audit everything)

| Priority | Documents | Agent checks |
|----------|-----------|--------------|
| P0 | [`architecture-gates.md`](../../reference/architecture-gates.md), [`decisions/README.md`](../../decisions/README.md), [`ACTIVE.md`](../../../ACTIVE.md) | Status, WI, Decision, ADR links match each other |
| P1 | [`reference/README.md`](../../reference/README.md) + contracts with `Outline` or `Living` | Catalog status, tables vs architecture §8 / modules index |
| P2 | [`modules/README.md`](../../modules/README.md) | Owner names vs architecture §8.1 (spot check, not full architecture re-read) |
| P3 | `product-requirements`, `electron-architecture` | Only when a WI claims PRD/architecture alignment; sample sections tied to the WI |
| Skip | `Planned` contract shells, `archive/*`, `discussions/*` | Unless linked as current authority (script warns on archive module links) |

Do **not** rewrite PRD or architecture during an audit. Record findings; propose edits separately.

## Step 3 — Code alignment (when `src/` exists)

If the repository has application source:

- For each contract page with `Status: Living`, compare to `src/shared/contracts` and related tests.
- If code exists but contracts are still `Planned`, recommend upgrading catalog + contract page in a dedicated WI—not silently edit Living.

## Step 4 — Write the audit report

Create or append a dated report (maintainer chooses location):

- **Recommended**: `docs/reference/doc-audit-YYYY-MM-DD.md` (English; add `.zh.md` only if maintainer wants a paired summary)
- **Alternative**: short section in the relevant `docs/discussions/*.md` work log

Use this structure:

```markdown
# Documentation drift audit — YYYY-MM-DD

- WI / trigger: …
- docs:verify: pass | fail (paste error summary)
- Agent: …

## Blockers (must fix before next release/WI)
- …

## Should fix (schedule in ACTIVE or parking lot)
- …

## Info / deferred
- …

## Confirmed aligned (sample)
- …
```

Do **not** mark blockers fixed unless `npm run docs:verify` passes and the maintainer agrees.

## Step 5 — Maintainer handoff

Deliver:

1. `docs:verify` exit code and summary
2. Link or path to the audit report
3. Proposed ACTIVE/parking-lot items (titles only) for should-fix items

Wait for maintainer confirmation before changing authoritative docs or code.

## When to run

- After closing a WI that touched docs, IPC, modules, gates, or ADRs
- Before marking a contract `Living`
- Monthly or before a milestone, if the maintainer requests “doc drift audit”

## Maintainer prompt (copy-paste)

```text
运行 pi-desktop 文档漂移审计：先执行 npm run docs:verify 并修复所有 error，再按 docs/guides/agent/doc-drift-audit.md 的 P0–P2 范围检查，输出分级报告（不要未经确认修改 PRD/架构正文）。
```
