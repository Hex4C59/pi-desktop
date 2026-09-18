# Task and runtime states

English | [中文](task-and-runtime-states.zh.md)

- Type: Reference
- Status: Planned
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Contract ID: `contract-states`
- Authority: state enums and transitions when `Outline` or `Living`
- Related: [Reference index](README.md), [task-runtime-controller module](../modules/task-runtime-controller.md)

> **Status: Planned** — Fill with **WI-004** or when multi-task UI states are first implemented. Distinguish task record state, runtime incarnation health, and connection/sync state.

## Purpose

Shared vocabulary for UI, tests, and adapter: legal states, user-visible labels, and which states allow prompt/abort/apply.

## Architecture pointers

- Runtime lifecycle §9.1
- Task/catalog projections and background task behavior (architecture)

## Task-level states

| State | User-visible | Allows prompt | Allows abort | Notes |
|-------|--------------|---------------|--------------|-------|
| *(TBD)* | — | — | — | |

## Runtime / incarnation states

| State | Applies to | Notes |
|-------|------------|-------|
| *(TBD)* | — | |

## Transitions

TBD — state diagram or table when `Outline`.

## Maintenance

Keep aligned with [domain-events.md](domain-events.md) and PRD empty/loading/streaming/error states.
