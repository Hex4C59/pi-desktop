# TaskRegistry

[English](task-registry.md) | 中文

- 类型：Module Design
- 状态：stub
- Owner：`TaskRegistry`
- Planned code path：`src/main/tasks/`
- 权威原文：[task-registry.md](task-registry.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 职责

- 创建、恢复、重命名、删除**任务记录**（每项目顶层任务）。
- 维护 `taskId`、会话引用、worktree 标识、恢复所需元数据（非 SDK 实例）。
- 为 catalog 投影与应用服务提供一致读视图。
- 与非 Git 并行写任务规则协同（与 `TaskCoordinator` 分工 TBD）。

## 排除

- 持有或释放 pi SDK runtime。
- worktree 文件操作（`WorktreeManager`）。
- Git 结果 apply（`ResultApplicationService`）。

## 依赖

- `ProjectRegistry`、`WorktreeManager`、持久化适配器（`gate-task-persistence`）、pi 会话 API（非 JSONL 手搓）。

## 测试焦点

- 持久化 gate 允许时重启后 task 身份稳定。
- 删除/丢弃无孤儿绑定。
- 并发更新下 catalog 与明细一致。
- 部分损坏时显式错误态。

## 接口

TBD — 持久化 ADR 与 shared contracts 之后。

## 未决

- 持久化 schema（`gate-task-persistence`）。
- `TaskRegistry` 与 `TaskCoordinator` 命令边界。
