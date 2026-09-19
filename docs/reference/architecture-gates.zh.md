# 架构 gate 跟踪表

[English](architecture-gates.md) | 中文

- 类型：Reference
- 状态：Accepted
- 创建：2026-09-19
- 上次评审：2026-09-19
- 适用：[文档索引](../README.zh.md) 所列首版架构阻塞项
- 权威范围：gate 标识、状态、与 ADR 及工作项的链接——不替代 ADR 正文
- 相关：[ADR 索引](../decisions/README.zh.md)、[`ACTIVE.md`](../../ACTIVE.md)、[`architecture/electron-architecture.zh.md`](../architecture/electron-architecture.zh.md)
- 权威原文：[Architecture gates tracker](architecture-gates.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

每个 gate 须达到 **Accepted**（链接 Status 为 Accepted 的 ADR）后，文档或 UI 才能将该能力描述为已实现。处于 **Open** 或 **In spike** 时，相关范围仍视为 Proposed。

**Gate 状态仅以本文件为准。** [ADR 文件](../decisions/README.zh.md#accepted-adrs) 记录决定；不要在 `docs/README.zh.md` 重复维护状态表。

## 按 gate 状态该怎么做

| 状态 | 对开发的含义 |
|------|----------------|
| `Open` | 尚未指派 spike 工作项——先讨论是否 spike；不实现依赖该 gate 的功能 |
| `In spike` | 仅在链接的 **ACTIVE** 工作项范围内工作（多为 spike/脚手架）；gate 仍未关闭 |
| `Accepted` | **必须有 Accepted ADR**；实现可依该 ADR |

## Gate 状态取值

| 状态 | 含义 |
|------|------|
| `Open` | 未决定；无 Accepted ADR |
| `In spike` | 有活动工作项（见 `ACTIVE.md`）；实验或讨论进行中 |
| `Accepted` | 已关闭；链接 `docs/decisions/000x-….md` 且 Status 为 Accepted |

## Gate 列表（首版）

| ID | 主题 | 状态 | ADR | ACTIVE | 下一步 |
|----|------|------|-----|--------|--------|
| `gate-build-baseline` | npm + Electron Forge/Vite 与首批 Linux 打包评估 | `Accepted` | [0001-build-baseline](../decisions/0001-build-baseline.zh.md) | WI-001（已关闭） | — |
| `gate-runtime-host` | pi runtime 位于 Main 或 utility/child process | `Open` | — | WI-003（排队） | 工具链 ADR 后启动 WI-003 spike |
| `gate-sub-agent` | 固定 pi 版本的子 Agent 集成 | `Open` | — | — | 子 Agent 功能前须 spike |
| `gate-project-trust-worktree` | 内部 worktree 的项目 trust 公共 API 映射 | `Open` | — | — | 流程定案时写 ADR |
| `gate-task-persistence` | 任务持久化实现与 schema | `Open` | — | — | 实现持久化前 ADR |
| `gate-apply-journal` | Apply 算法与恢复 journal | `Open` | — | — | apply 功能前 spike + ADR |
| `gate-attachments` | 附件 allowlist 与限制 | `Open` | — | — | allowlist 固定时 ADR |

gate 状态变化或新增 ADR 时更新本表。若有冲突，在 [文档索引](../README.zh.md) 记录。

## 何时需要 ADR

见 [何时写 ADR](../decisions/README.zh.md#何时写-adr)。关闭上表任一行须有 **Accepted** ADR（或在 ADR 中明确记录暂缓项——避免无内容的 Accepted ADR）。
