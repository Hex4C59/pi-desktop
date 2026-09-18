# Domain events (Renderer-facing DTOs)

English | [中文](domain-events.zh.md)

- Type: Reference
- Status: Planned
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Contract ID: `contract-events`
- Authority: serializable event union when `Outline` or `Living`; until then [architecture](../architecture/electron-architecture.md) event and identity sections
- Related: [Reference index](README.md), [boundaries playbook](../guides/agent/boundaries.md)

> **Status: Planned** — Populate with **WI-004** (single-task streaming). Renderer must not import pi SDK types.

## Purpose

Discriminated union of domain events crossing Main → Renderer (or subscription stream), aligned with pi streaming semantics (`contentIndex`, tool call IDs, `message_end.message`).

## Architecture pointers

- [Core domain and identity §7](../architecture/electron-architecture.md)
- Event synchronization and catalog/task snapshots (architecture multi-task sections)

## Event variants

| Variant | Key fields | Correlation IDs | Ordering | Notes |
|---------|------------|-----------------|----------|-------|
| *(none yet)* | — | — | — | Add with adapter mapping tests |

## Maintenance

Living status requires exhaustive handling in adapter tests and Renderer projection; update this table when variants change.
