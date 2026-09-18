# Renderer State 模块

[English](renderer-state.md) | 中文

- 类型：Module Design
- 状态：Archived
- 翻译状态：Machine Draft
- 权威原文：[renderer-state.md](renderer-state.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 层级：Electron Renderer / Store
- 建议实现：`renderer-store.ts`、`runtime-synchronizer.ts`
- 上游文档：[模块设计索引](../module-structure.zh.md)

## 职责

维护 Main snapshot 和 event 在 Renderer 中的唯一状态投影，并协调首次同步和失步恢复。

## RendererStore 所有权

- 当前 generation；
- 最后应用 sequence；
- 权威 snapshot 投影；
- 临时 text/thinking/tool 流式状态；
- 必要的短生命周期共享 UI 状态。

## RuntimeSynchronizer 职责

- 先订阅 event，再请求 snapshot；
- 完成 preload buffer handoff；
- sequence 缺口时停止增量应用并重新请求 snapshot；
- 卸载时取消订阅。

## Reducer 规则

- 丢弃旧 generation；
- 重复或乱序 sequence 不得破坏状态；
- `message.completed` 使用完整消息替换临时增量；
- 不猜测丢失事件；
- 对 `DesktopEvent` 穷尽处理。

## 不负责

- pi SDK 业务语义；
- Electron 或 Node.js 调用；
- 凭据持久化；
- 浏览器存储中的 prompt/文件内容副本。

## 测试重点

初始化竞态、旧 generation、sequence 缺口、完成消息替换和高频 delta 的稳定订阅。
