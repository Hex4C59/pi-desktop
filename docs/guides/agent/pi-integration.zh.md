# Agent playbook：上游 pi 集成

[English](pi-integration.md) | 中文

- 类型：Guide
- 状态：Accepted
- 权威范围：pi SDK/RPC 集成约束
- 适用：adapter、runtime、会话、包 pin、RPC 模式
- 权威原文：[pi-integration.md](pi-integration.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 必须

- 桌面端为呈现层——不重新实现 agent loop、provider、工具、compaction 或 session 管理。
- Node.js 宿主默认优先 `@earendil-works/pi-coding-agent` SDK。
- 仅在子进程隔离、非 Node 宿主或独立故障域时使用 `pi --mode rpc`。
- 不得为会话功能读写 session JSONL；使用 `AgentSessionRuntime`、`SessionManager` 或 RPC 会话命令。
- 不移植上游 TUI 组件；复用行为与数据模型，按桌面交互重设计。
- 不以 `pi-client`、`pi-protocol`、`pi-server` 为稳定基础，除非任务要求并加兼容性保护。
- 固定 pi npm 版本并提交 lockfile；升级时读 changelog 并验证事件、消息、会话与认证。
- 使用本地 `../pi` 时记录 commit；本地源码不得成为发布隐式依赖。

## 编码前

1. 阅读 `../pi/packages/coding-agent/docs/` 与 `examples/sdk/` 中与本任务相关的部分。
2. 对照 pinned 包版本核对导出类型。

## 指针

- `../pi/packages/coding-agent/docs/` 下 sdk、rpc、security、session-format、extensions
- 流式与 adapter：[boundaries.zh.md](boundaries.zh.md)
