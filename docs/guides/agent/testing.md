# Agent playbook: Testing and verification

English | [中文](testing.zh.md)

- Type: Guide
- Status: Accepted
- Authority: test requirements and honesty about verification
- When: writing tests or claiming a task is complete

## Must

- Tests must not depend on real API keys, paid models, or unstable external services.
- Verify agent behavior with fake providers, fixtures, or mock transports.
- Adapter tests must cover at least: streaming text/thinking, tool lifecycle, queueing, abort, retry, compaction, errors, and session replacement.
- IPC/RPC tests must cover at least: malformed input, unknown messages, out-of-order responses, early subprocess exit, stderr noise, and request timeouts.
- Use component or end-to-end tests for critical UI flows, including keyboard and narrow layouts.
- After code changes, run repository lint, typecheck, and affected tests. When changing packaging or Linux integration, also verify dev startup and install artifacts.
- Do not claim commands passed without running them; explain when execution is impossible.

## Task completion

Align with [AGENTS.md](../../../AGENTS.md) completion criteria: end-to-end behavior, cleanup, tests run, security boundaries respected.
