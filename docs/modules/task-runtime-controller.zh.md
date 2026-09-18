# TaskRuntimeController

[English](task-runtime-controller.md) | 中文

- 类型：Module Design
- 状态：stub
- Owner：`TaskRuntimeController`（每顶层任务槽一个逻辑控制器）
- Planned code path：`src/main/runtime/`（经 `RuntimeRegistry` 管理）
- 权威原文：[task-runtime-controller.md](task-runtime-controller.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 职责

- **单任务槽** runtime 生命周期：加锁、作废旧 incarnation、取消作用域工作、释放旧 runtime、创建/绑定新 runtime、安装 generation、提交任务快照。
- 任务内会话替换：卸监听、完成上游替换、重绑扩展、重订阅（§9.2）。
- runtime 崩溃：更新任务态、释放调度槽、按矩阵清理。
- 向应用服务暴露窄端口；不跨任务编排。

## 排除

- 任务 catalog 或项目列表。
- 跨任务调度限制（`AgentScheduler`）。
- 直接 worktree/apply。

## 依赖

- runtime 端口与 `src/main/pi/` 适配器、`RuntimeEventSubscription`、`TaskEventStream`、`AgentScheduler`。

## 测试焦点

- 替换：旧 incarnation 立即拒绝新操作；创建失败不谎称旧 runtime 健康。
- 会话替换：无重复监听；generation 路由正确。
- abort/崩溃：幂等清理；不影响其他任务。

## 接口

TBD — `gate-runtime-host` ADR 与 SDK spike 之后。

## 未决

- 同进程 SDK vs 子进程（`gate-runtime-host`）。
- 子 Agent（`SubagentCoordinator`、`gate-sub-agent`）。
