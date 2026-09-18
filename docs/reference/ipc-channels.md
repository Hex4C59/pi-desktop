# IPC channels (allowlist)

English | [中文](ipc-channels.zh.md)

- Type: Reference
- Status: Planned
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Contract ID: `contract-ipc`
- Authority: allowlisted IPC surface when status is `Outline` or `Living`; until then use [architecture](../architecture/electron-architecture.md) §6 and §18
- Module owner: [ipc-registration](../modules/ipc-registration.md)
- Related: [Reference index](README.md), [security playbook](../guides/agent/security.md)

> **Status: Planned** — Do not implement from this page alone. Populate rows starting in **WI-002** in the same change set as host/preload code.

## Purpose

Single registry of invoke/subscribe channels (or equivalent), preload exposure, host handlers, and payload schema references.

## Architecture pointers

- [Main layering §6](../architecture/electron-architecture.md)
- [Security baseline §18](../architecture/electron-architecture.md)

## Channel registry

| Channel | Direction | Preload API | Host handler | Payload schema | Errors | Notes |
|---------|-----------|-------------|--------------|----------------|--------|-------|
| *(none yet)* | — | — | — | — | — | Add rows with WI-002 |

## Maintenance

When this document reaches `Living`, every new channel requires a row here, registration in `IpcRegistration`, schema in `src/shared/contracts`, and tests per [testing playbook](../guides/agent/testing.md).
