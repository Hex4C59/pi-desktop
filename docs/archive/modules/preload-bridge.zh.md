# Preload Bridge 模块

[English](preload-bridge.md) | 中文

- 类型：Module Design
- 状态：Archived
- 翻译状态：Machine Draft
- 权威原文：[preload-bridge.md](preload-bridge.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 层级：Electron Preload
- 建议实现：`desktop-api-bridge.ts`、`runtime-event-buffer.ts`、`preload.ts`
- 上游文档：[模块设计索引](../module-structure.zh.md)

## 职责

作为 Renderer 与 Main 之间唯一桥梁，暴露固定、类型化的 `PiDesktopApi`，并解决初始化期间 snapshot/event 竞态。

## 分工

- `DesktopApiBridge`：把 API 方法映射到固定 IPC channel；
- `RuntimeEventBuffer`：先监听并有界缓存事件，在 snapshot handoff 后按 sequence 重放；
- `preload.ts`：最小装配入口。

## 禁止暴露

- 原始 `ipcRenderer`；
- 通用 `send(channel, payload)`；
- 通用 `invoke(channel, payload)`；
- Node.js `process`、`fs`、`child_process`；
- Electron 完整 API。

## 初始化契约

1. 安装事件监听；
2. 缓存 snapshot 返回前事件；
3. Renderer 应用 snapshot；
4. 只重放 sequence 大于 snapshot sequence 的事件；
5. 转入实时消费。

## 测试重点

监听器清理、缓冲上限、事件重放顺序、重复 sequence 和 Renderer 重载。
