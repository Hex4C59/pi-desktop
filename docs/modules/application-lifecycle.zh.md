# ApplicationLifecycle

[English](application-lifecycle.md) | 中文

- 类型：Module Design
- 状态：stub
- 创建：2026-09-19
- 上次评审：2026-09-19
- Owner：`ApplicationLifecycle`
- Planned code path：`src/main/application/`、`src/main/bootstrap/`
- 权威原文：[application-lifecycle.md](application-lifecycle.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 职责

- 应用启动：组装模块、单实例策略、创建主窗口（安全默认值）。
- 决定窗口关闭与应用退出时的清理**触发顺序**（架构 §17.2）。
- 调用各 owner 完成清理，不实现其资源逻辑。
- 清理幂等；部分失败后继续；聚合失败仅进脱敏诊断。

## 排除

- 拥有 SDK runtime、worktree 或持久化文件。
- 每任务 runtime 替换顺序（`TaskRuntimeController`）。
- PRD 级用户可见行为定义。

## 依赖

- `RuntimeRegistry` 关闭全部任务 runtime。
- `IpcRegistration` / `RequestScopeRegistry`。
- `ApplicationCompositionRoot`（planned，多任务布线不同于 archive）。

## 测试焦点

- 关窗：trust/扩展对话框与附件 token 按矩阵清理。
- 退出：尝试关闭全部任务/runtime 与刷盘；超时行为符合 PRD 有界退出。
- 重复关窗/退出不 double-free。
- 退出不假装模型优雅结束；持久化按 gate 约定。

## 接口

TBD — 随脚手架与 runtime-host ADR 定义阶段钩子。

## 未决

- `gate-runtime-host` 与子进程监督。
- 单实例第二窗口策略（仅可参考 archive）。
