# 维护者代码评审清单

[English](code-review.md) | 中文

- 类型：Guide
- 状态：Accepted
- 创建：2026-09-19
- 最近评审：2026-09-19
- 适用范围：维护者验收 agent 或人对应用代码的改动
- 权威范围：快速通过/不通过；不凌驾于 [code-style](code-style.zh.md) 或 playbook
- 权威原文：[Code Review Checklist](code-review.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 相关：[code-style](code-style.zh.md)、[agent-collaboration](agent-collaboration.zh.md)、[`ACTIVE.md`](../../ACTIVE.md)

在 agent 报告 lint/typecheck/测试之后使用。补足工具无法覆盖的判断。**明显违反**任一项即不通过；只要求 agent 修该范围。

## 范围与流程

- [ ] Diff 对齐 [`ACTIVE.md`](../../ACTIVE.md) 当前 **WI** — 无无关重构、全库格式化或依赖升级。
- [ ] 未将架构 **gate** 或 ADR 触发项当作已交付（须 Accepted ADR，见 [architecture-gates](../reference/architecture-gates.zh.md)）。

## 结构与可读性

- [ ] 新文件在正确 §20 / 模块 **owner** 下；无新的 `common/` 或 `utils/` 垃圾场。
- [ ] 命名为领域语言（task、runtime、incarnation）— 非 `Manager`/`Handler`/`Util` 堆砌。
- [ ] 维护者能沿主路径阅读，无需穿过超过一层不必要的间接层。
- [ ] 无**仅一处调用**的新抽象（adapter 或契约边界除外）。

## 类型与控制流

- [ ] 状态/事件联合穷尽处理；无静默 `default: null`。
- [ ] 无 `any`、边界 `as`、应用代码中的 `!`。
- [ ] 工作项涉及流式、IPC 或 runtime 生命周期时，异步有 cancel/dispose。
- [ ] 无空 `catch` 或 log 后继续却当作已修复。

## 信任边界

- [ ] 校验在 IPC/preload/持久化/SDK 边缘 — 非同层内重复冗余。
- [ ] Renderer 仍无 Node、shell、凭据或 pi SDK 导入。
- [ ] 日志与 UI 不暴露密钥（L0）。

## 注释

- [ ] 无仅复述下一行的注释。
- [ ] 承载 **why** / **invariant** / **beware** 的注释紧贴受约束代码。
- [ ] 无与 diff 矛盾的陈旧注释；无无票 `TODO` 噪音。

## 验证

- [ ] Agent 列出已运行命令与结果（脚手架前诚实说明限制）。
- [ ] 行为变更时有增改测试；非无意义快照刷屏。

## Agent 会话

评审不通过时，用协作指南验收提示（[agent-collaboration §6](agent-collaboration.zh.md#6-维护者可复制提示)），修复后要求更新 `ACTIVE.md` Last session。
