# IPC channel（allowlist）

[English](ipc-channels.md) | 中文

- 类型：Reference
- 状态：Outline
- 创建：2026-09-19
- 上次评审：2026-09-19
- Contract ID：`contract-ipc`
- 权威范围：状态为 `Outline`/`Living` 时的 IPC 面；此前以 [架构](../architecture/electron-architecture.zh.md) §6、§18 为准
- 模块 owner：[ipc-registration](../modules/ipc-registration.zh.md)
- 相关：[Reference 索引](README.zh.md)、[security playbook](../guides/agent/security.zh.md)
- 权威原文：[ipc-channels.md](ipc-channels.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

> **状态：Outline** — 下表壳层通道已在 WI-002 实现。业务通道须先增行并注册后再用。

## 目的

invoke/subscribe（或等价）channel、preload 暴露、宿主 handler、payload schema 引用的唯一登记表。

## 架构指针

- [Main 分层 §6](../architecture/electron-architecture.zh.md)
- [安全基线 §18](../architecture/electron-architecture.zh.md)

## Channel 登记表

| Channel | 方向 | Preload API | Host handler | Payload schema | 错误 | 备注 |
|---------|------|-------------|--------------|----------------|------|------|
| `app:getVersions` | Renderer → Main（invoke） | `piDesktop.getVersions()` | `readAppVersions`（`src/main/ipc/app-handlers.ts`） | 无 | `INTERNAL` | 由 Main `process.versions` 返回 `{ node, electron, chrome }` |
| `app:ping` | Renderer → Main（invoke） | `piDesktop.ping()` | `handleAppPing` | `AppPingRequestSchema`（`src/shared/contracts/app-ipc.ts`） | `INVALID_INPUT`、`INTERNAL` | 健康检查；仅 `{}` |

## 错误封装（invoke）

宿主以 `IpcCallError` 拒绝（`code`：`INVALID_INPUT` \| `INTERNAL`，`message` 为用户可读文案）。不以堆栈作为 Renderer 主文案。

## 维护

本页升为 **Living** 后，每新增 channel 须同步本表、`registerIpcHandlers` 注册、`src/shared/contracts` schema，并按 [testing playbook](../guides/agent/testing.zh.md) 补测试。
