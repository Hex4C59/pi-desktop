# Agent playbook: Documentation

English | [中文](documentation.zh.md)

- Type: Guide
- Status: Accepted
- Authority: when and how to update repo documentation
- When: creating, moving, splitting, or substantially revising docs

## Must

- Before creating, moving, splitting, archiving, or substantially revising project documentation, read [`docs/document-conventions.md`](../../document-conventions.md) and update the index, authorities, and known conflicts in [`docs/README.md`](../../README.md). Simple spelling fixes and small non-structural edits do not require the full guide.
- When substantive discussion creates or significantly changes requirements, architecture, module design, security, persistence, protocols, or important decisions, create or update the chronological discussion log under `docs/discussions/`. Do not copy chats verbatim; separate user reasoning, agent suggestions, options, confirmed decisions, superseded assumptions, and open questions.
- Ordinary code changes and tasks without design decisions do not require a discussion log.

## Drift and consistency

- After substantive documentation changes or before closing a doc-heavy work item, run `npm run docs:verify` from the repository root.
- For semantic drift beyond scripts, follow [doc-drift-audit.md](doc-drift-audit.md) and produce a dated audit report; do not rewrite PRD or architecture during an audit without maintainer approval. Current behavior is governed by requirements, Accepted ADRs, architecture, and module documents—not discussions or archive alone.

## README and architecture sync

Update `README.md` and relevant architecture docs when changing:

- desktop/UI framework or package manager;
- pi SDK vs RPC strategy;
- Node.js, system libraries, or Linux requirements;
- storage locations for configuration, credentials, sessions, or app data;
- dev, test, packaging, and release commands;
- implemented features, limitations, and platform support.

When citing pi behavior, link to specific upstream documentation; do not copy large sections that go stale quickly.

## Bilingual

Follow [`docs/bilingual-documentation.md`](../../bilingual-documentation.md) for paired English sources and Chinese translations.
