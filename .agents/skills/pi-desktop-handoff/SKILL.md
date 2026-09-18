---
name: pi-desktop-handoff
description: >-
  pi-desktop session start and work-item close. Use when the user @-mentions ACTIVE.md,
  continues pi-desktop, says to close or finish a WI, updates Last session, touches gates
  or ADRs, or ends a doc-heavy session. Maintainer may @ ACTIVE only; read ACTIVE.md and
  agent-collaboration first (see AGENTS.md ACTIVE session pairing); run npm run docs:verify;
  follow doc-drift-audit when triggers match. Authority stays in repo docs—do not duplicate rules here.
---

# pi-desktop handoff

Router for **session open** and **session / WI close**. Single source of truth: repository markdown and `package.json` scripts—not this file.

## Session open

1. Read [`ACTIVE.md`](../../../../ACTIVE.md) and [`docs/guides/agent-collaboration.md`](../../../../docs/guides/agent-collaboration.md).
2. Restate for the maintainer: current **WIP=1** ID, phase (Prepare / Build), **Gate ID**, **Decision** (`none` | `pending-adr` | `0001-slug`).
3. Before coding, load playbooks per [`docs/guides/agent/path-triggers.md`](../../../../docs/guides/agent/path-triggers.md) and [`AGENTS.md`](../../../../AGENTS.md) Load map.
4. Proposals must include **Gate ID** and **Decision class** (`adr-after-approval` when relevant). Do not mark gates **Accepted** or write **Accepted** ADRs without maintainer confirmation after spike/discussion.

## Session / WI close

1. Re-read [`ACTIVE.md`](../../../../ACTIVE.md) and agent-collaboration §8 (gates, ADRs) and §9 (phases).
2. From repository root, run:

   ```bash
   npm run docs:verify
   ```

   Fix all **errors** before claiming the WI or session is closed. Collect **warnings** for the handoff.

3. **Doc-drift audit** — If any item in [`doc-drift-audit.md`](../../../../docs/guides/agent/doc-drift-audit.md) *When to run* applies (e.g. closed a WI that touched docs, IPC, modules, gates, or ADRs; or before marking a contract `Living`), follow that playbook: scoped P0–P2 check, dated report (`docs/reference/doc-audit-YYYY-MM-DD.md` or maintainer-chosen path). Do **not** rewrite PRD or `electron-architecture` during an audit without maintainer approval.

4. **Gate / ADR** — If the maintainer **confirmed** a gate-closing decision: draft Accepted ADR, update [`architecture-gates.md`](../../../../docs/reference/architecture-gates.md) and [`decisions/README.md`](../../../../docs/decisions/README.md), set ACTIVE `Decision` to the ADR slug. If only spike progressed, update gate to `In spike` and Last session; **no** Accepted ADR yet. For **WI-001** / `gate-build-baseline`, use the numbered ADR close checklist in ACTIVE § *ADR 收尾* only after maintainer accepts the spike.

5. Update **Last session** in [`ACTIVE.md`](../../../../ACTIVE.md): date, what changed, how to verify, next-session hint.

6. Handoff to maintainer: `docs:verify` exit summary, audit report path (if any), and parking-lot / queue titles only for follow-ups—wait for confirmation before changing authoritative docs beyond what the closed WI already required.

## Do not

- Copy playbook text into chat as if it were new policy; link paths instead.
- Create Accepted ADRs or set gates to **Accepted** without maintainer confirmation.
- Treat `docs/archive/modules` or `docs/discussions` as implementation authority.
