# Agent Command Service 模块

[English](agent-command-service.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[agent-command-service.md](agent-command-service.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 层级：Electron Main / Application
- 建议实现：`src/main/application/agent-command-service.ts`
- 权威范围：历史首版 agent command 的职责、所有权、约束和测试
- 上游文档：[模块设计索引](../module-structure.zh.md)

## 职责

执行当前 session 上的 prompt、steer、follow-up、abort 和 clear queue 命令。

## Prompt 契约

`session.prompt()` 的完整运行不能占用长期 IPC invoke：

1. 校验 runtime 状态与输入；
2. 在受控 session 作用域调用 prompt；
3. 使用 `preflightResult` 尽快返回 `PromptAcceptance`；
4. 完整运行留在后台；
5. 后台 Promise 必须显式捕获失败；
6. 后续进度和失败通过领域事件报告。

## 所有权

不拥有 runtime、session 或队列。命令开始时向 `RuntimeController` 请求一次受控操作能力，回调结束后不得保留 SDK 引用。

## 不负责

- runtime replacement；
- event payload 转换；
- IPC schema 校验；
- 记录完整 prompt；
- Renderer optimistic queue 的维护。

## 测试重点

- preflight 接受与拒绝；
- 后台失败没有 unhandled rejection；
- switching/crashed 状态拒绝 prompt；
- abort 与 replacement 竞态；
- steer/follow-up 队列语义。
