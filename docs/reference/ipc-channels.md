# IPC channels (allowlist)

English | [中文](ipc-channels.zh.md)

- Type: Reference
- Status: Outline
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Contract ID: `contract-ipc`
- Authority: allowlisted IPC surface when status is `Outline` or `Living`; until then use [architecture](../architecture/electron-architecture.md) §6 and §18
- Module owner: [ipc-registration](../modules/ipc-registration.md)
- Related: [Reference index](README.md), [security playbook](../guides/agent/security.md)

> **Status: Outline** — Shell channels below are implemented in WI-002. Business channels require a new row and registration before use.

## Purpose

Single registry of invoke/subscribe channels (or equivalent), preload exposure, host handlers, and payload schema references.

## Architecture pointers

- [Main layering §6](../architecture/electron-architecture.md)
- [Security baseline §18](../architecture/electron-architecture.md)

## Channel registry

| Channel | Direction | Preload API | Host handler | Payload schema | Errors | Notes |
|---------|-----------|-------------|--------------|----------------|--------|-------|
| `app:getVersions` | Renderer → Main (invoke) | `piDesktop.getVersions()` | `readAppVersions` in `src/main/ipc/app-handlers.ts` | none | `INTERNAL` | Returns `{ node, electron, chrome }` from Main `process.versions` |
| `app:ping` | Renderer → Main (invoke) | `piDesktop.ping()` | `handleAppPing` | `AppPingRequestSchema` (`Type.Object({})`) in `src/shared/contracts/app-ipc.ts` | `INVALID_INPUT`, `INTERNAL` | Health check; `{}` only |

## Error envelope (invoke)

Host rejects with `IpcCallError` (`code`: `INVALID_INPUT` \| `INTERNAL`, `message`: user-safe string). No stack traces as primary renderer copy.

## Maintenance

When this document reaches `Living`, every new channel requires a row here, registration in `registerIpcHandlers`, schema in `src/shared/contracts`, and tests per [testing playbook](../guides/agent/testing.md).
