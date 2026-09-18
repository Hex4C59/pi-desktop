# Agent playbook：进程与模块边界

[English](boundaries.md) | 中文

- 类型：Guide
- 状态：Accepted
- 权威范围：分层边界与流式生命周期（见 [AGENTS.md](../../../AGENTS.md)）
- 适用：跨越 Renderer、宿主、adapter 或 pi runtime 的工作
- 权威原文：[boundaries.md](boundaries.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 分层

无论桌面框架：

- **Renderer/UI**：视图、输入、短生命周期 UI 状态。
- **Desktop host**：窗口外能力、类型化 IPC、pi runtime 生命周期、持久化协调。
- **Pi adapter**：SDK 事件或 RPC 消息 → 内部领域事件；隔离上游版本变化。
- **Pi runtime**：模型、agent、工具、资源、配置、会话语义（上游）。

## 必须

- Renderer 不得获得 shell、任意文件 I/O、Node.js API 或 provider 凭据。
- UI 不得直接依赖 pi SDK 类型；经 adapter 与项目窄接口传递可序列化数据。
- 流式须遵循 pi 事件语义：
  - 用 `contentIndex` 与 tool call ID 关联增量事件；
  - 以 `message_end.message` 为完成消息的权威值；
  - 用 tool call ID 关联工具开始、更新与结束；
  - 会话替换后重新绑定订阅，不保留旧 `AgentSession` 监听器；
  - 中止、切换会话、关闭窗口或 runtime 崩溃时，清理监听器、子进程与 pending request。

## 指针

- 系统 owner 与 IPC：`docs/architecture/electron-architecture.md`
- 安全：[security.zh.md](security.zh.md)
- pi API：[pi-integration.zh.md](pi-integration.zh.md)
