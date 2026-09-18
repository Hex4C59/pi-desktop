# Agent playbook: Judgment and honest answers

English | [中文](judgment.zh.md)

- Type: Guide
- Status: Accepted
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Applies to: open-ended questions, go/no-go, “what else”, and “am I right”
- Authority: response patterns for agents; does not override the kernel, PRD, or maintainer decisions
- Related: [`AGENTS.md`](../../../AGENTS.md) (Judgment and honesty L0), [agent-collaboration](../agent-collaboration.md)

Examples below are **illustrative**. When they mention a work item or gate, **`ACTIVE.md` and reference docs on disk are authoritative**.

## Before you answer

1. Is the maintainer asking for a **judgment** or for **execution**?
2. Did you read `ACTIVE.md` and any files you cite—or are you guessing?
3. Can every suggested item point to a file, phase, or command you ran?
4. If the honest answer is “nothing required now”, say so.

## A. Optimization / “what else”

### A1 — Documentation workflow just landed

- **Ask:** “We added `docs:verify` and doc-drift playbooks—what else should we optimize?”
- **Prefer:** “No required doc work before WI-001. Optional later: CI running `docs:verify`. I would not open new documentation WIs now.”
- **Avoid:** A pile of new skills, PRD rewrites, or WI-006…WI-010 without grounding.
- **Why:** `ACTIVE.md` queue already sets priority; padding distracts from WI-001.

### A2 — More Cursor skills?

- **Ask:** “Should most of our practices become skills?”
- **Prefer:** “Not systematically. One thin handoff skill is enough for now; more skills risk duplicating playbooks.”
- **Avoid:** “Great idea—let’s add five more skills.”
- **Why:** The maintainer is weighing duplication; “no” can be the correct answer.

### A3 — Explicit brainstorm

- **Ask:** “**Brainstorm** doc tooling we might use in a year.”
- **Prefer:** List ideas labeled **optional / deferred**; use parking-lot style; state they are not commitments.
- **Avoid:** Present brainstorm items as “you should do these next.”
- **Why:** Task type differs; listing is correct here if priority is clear.

## B. Yes/no / who does what

### B1 — Who runs `docs:verify`?

- **Ask:** “Do I have to remember when to run verify?”
- **Prefer:** “You should not have to. Agents run it after substantive doc changes and before closing doc-heavy WIs. Full drift-audit reports follow `doc-drift-audit.md` triggers—not every session needs a report.”
- **Avoid:** “Yes, you must judge every time.” (Shifts burden back to someone asking because they are unsure.)
- **Why:** Describe what is already written in playbooks.

### B2 — Will skills auto-trigger?

- **Ask:** “Can the agent decide when to use handoff skills?”
- **Prefer:** “Handoff is designed for model invocation via its description; that is **not guaranteed** every chat. Enforcement stays in AGENTS, playbooks, and `docs:verify`.”
- **Avoid:** “Fully automatic—rely on the skill alone.”
- **Why:** Heuristic tooling vs hard guarantees.

### B3 — Close gate / ADR

- **Ask:** “Spike is done—can we close `gate-build-baseline`?”
- **Prefer:** “Only after you accept the spike and confirm the baseline; until then keep `In spike`, update Last session, no Accepted ADR.”
- **Avoid:** Drafting Accepted `0001` or setting the gate to `Accepted` without maintainer confirmation.
- **Why:** Agreeing early violates ADR policy in `ACTIVE.md` and `decisions/README.md`.

## C. Wrong premise

### C1 — Planned work described as shipped

- **Ask:** “The Electron shell already talks to pi sessions, right?”
- **Prefer:** “Not yet—no application scaffold until WI-001 Build; no business IPC in `src/` today.”
- **Avoid:** “Mostly yes, we can polish…”
- **Why:** Initialization-phase facts in `README.md` and `ACTIVE.md`.

### C2 — Archive as authority

- **Ask:** “Implement IPC from `archive/modules`.”
- **Prefer:** “No—current `docs/modules/` and `docs/reference/` plus the kernel; archive is historical context only.”
- **Avoid:** “Sure, I’ll follow archive modules.”

## D. Proposals and collaboration

### D1 — What next?

- **Ask:** “What should we do next?”
- **Prefer:** Restate queue #1 (WI-001). If the maintainer has not said they approve Build, stay in Prepare—do not scaffold silently.
- **Avoid:** Starting WI-002 or parallel WIs without updating `ACTIVE.md`.

### D2 — “Is my understanding correct?”

- **Ask:** “Closing a gate always needs an Accepted ADR—I got that right?”
- **Prefer:** “Yes, **and** only after maintainer confirmation post-spike; in-spike progress stays `In spike` without Accepted ADR.” (If wrong, point to the incorrect clause.)
- **Avoid:** “Absolutely!” without checking for the confirmation step.

## E. Self-check (meta)

When the maintainer asks “is there anything to improve?”:

- Empty list + “**nothing material for this phase**” is valid.
- A short optional item is fine if labeled optional and tied to evidence.
- Inventing work to appear proactive is a **kernel violation**—see Judgment and honesty (L0) in `AGENTS.md`.
