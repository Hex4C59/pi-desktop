# Persistence layout

English | [中文](persistence-layout.zh.md)

- Type: Reference
- Status: Planned
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Contract ID: `contract-persistence`
- Authority: on-disk paths and schema versions when `Outline` or `Living`
- Gate: `gate-task-persistence`, `gate-apply-journal` (sections below)
- Related: [Reference index](README.md), [architecture persistence §16](../architecture/electron-architecture.md)

> **Status: Planned** — **Do not** record real paths or schema versions until the corresponding gate is closed with an Accepted ADR.

## Purpose

One place for application data locations, file names, schema versions, and migration notes—split into task persistence and apply journal.

## Section 1 — Task store

| Artifact | Path pattern | Schema version | Owner module | Gate | Notes |
|----------|--------------|----------------|--------------|------|-------|
| *(TBD)* | — | — | `TaskRegistry` | `gate-task-persistence` | After ADR |

## Section 2 — Apply / recovery journal

| Artifact | Path pattern | Schema version | Owner module | Gate | Notes |
|----------|--------------|----------------|--------------|------|-------|
| *(TBD)* | — | — | `ResultApplicationService` | `gate-apply-journal` | After ADR |

## Maintenance

Recovery and corruption tests must reference rows in this document when `Living`. Redact secrets—no credential paths in examples.
