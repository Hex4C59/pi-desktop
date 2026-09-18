# IPC channel（allowlist）

[English](ipc-channels.md) | 中文

- 类型：Reference
- 状态：Planned
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

> **状态：Planned** — 勿仅依本页实现。**WI-002** 起与 host/preload 代码同变更填表。

## 目的

invoke/subscribe（或等价）channel、preload 暴露、宿主 handler、payload schema 引用的唯一登记表。

## 架构指针

- [Main 分层 §6](../architecture/electron-architecture.zh.md)
- [安全基线 §18](../architecture/electron-architecture.zh.md)

## Channel 登记表

| Channel | 方向 | Preload API | Host handler | Payload schema | 错误 | 备注 |
|---------|------|-------------|--------------|----------------|------|------|
| *（尚无）* | — | — | — | — | — | WI-002 起增行 |

## 维护

升为 `Living` 后，每个新 channel 须在本表增行、在 `IpcRegistration` 注册、在 `src/shared/contracts` 有 schema，并按 [testing playbook](../guides/agent/testing.zh.md) 加测。
