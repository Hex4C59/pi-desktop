# Session Coordinator 模块

[English](session-coordinator.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[session-coordinator.md](session-coordinator.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 层级：Electron Main / Application
- 建议实现：`src/main/application/session-coordinator.ts`
- 权威范围：历史首版 session 用例编排、所有权边界、依赖和测试
- 上游文档：[模块设计索引](../module-structure.zh.md)

## 职责

编排 session 列表、新建、恢复、切换、fork 和重命名用例。

## 公共能力

- 列出当前工作目录下的 session；
- 创建新 session；
- 切换或恢复已有 session；
- 从指定分支点 fork；
- 重命名 session。

## 所有权

该模块不拥有 `AgentSession`。所有会替换活动 session 的操作都经 `RuntimeController` 的同一 replacement 入口完成。

## 不负责

- 自行递增 generation；
- 绑定 SDK listener；
- 解析或改写 session JSONL；
- 执行 prompt；
- 保存 Renderer 状态。

## 依赖

依赖 session 查询 port、runtime factory 和 `RuntimeController`，只使用项目领域类型。

## 测试重点

- 切换期间拒绝冲突操作；
- fork point 校验；
- replacement 失败；
- 旧 session 事件隔离；
- 重命名错误映射。
