# RuntimeRegistry

[English](runtime-registry.md) | 中文

- 类型：Module Design
- 状态：stub
- Owner：`RuntimeRegistry`
- Planned code path：`src/main/runtime/`
- 权威原文：[runtime-registry.md](runtime-registry.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 职责

- 按稳定任务身份注册/查找各 `TaskRuntimeController`。
- **应用级** shutdown：遍历控制器，请求 abort/dispose，按策略超时。
- 为诊断与生命周期提供查询（不向 Renderer 暴露 SDK 类型）。

## 排除

- worktree、任务持久化、catalog 真理。
- 用户用例编排（`TaskCoordinator` 等）。
- 全局单一活动 runtime（禁止；多任务并行）。

## 依赖

- `ApplicationLifecycle`、`TaskRuntimeController`、`AgentScheduler`（全局并发视图 TBD）。

## 测试焦点

- 多任务：控制器独立；单任务 shutdown 不误删其他任务（除非删除任务）。
- 应用退出：遍历全部控制器；部分失败仍继续。
- 同一 `taskId` 替换规则下无重复控制器。
- 不向 IPC 泄漏 SDK 引用。

## 接口

TBD — 多 runtime 脚手架与 runtime-host ADR 之后。

## 未决

- 子进程时的监督模式（`gate-runtime-host`）。
- 与 archive `RuntimeController` 关系 — **勿**复制单活动所有权模型。
