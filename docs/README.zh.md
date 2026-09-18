# pi-desktop 文档索引

[English](README.md) | 中文

- 类型：Reference
- 状态：Accepted
- 翻译状态：Machine Draft
- 创建日期：2026-09-18
- 最近评审：2026-09-19
- 适用范围：项目文档导航、阅读顺序、当前权威来源和已知文档缺口
- 权威范围：项目文档导航、阅读顺序、当前权威来源和已知文档缺口
- 权威原文：[Documentation Index](README.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-19
- 维护规范：[文档组织与维护规范](document-conventions.md)

> 仓库仍处于初始化阶段。文档描述计划、提案和已确认需求，不表示应用功能已经实现。
>
> 双语文档采用同目录配对：英文 `<name>.md`，中文 `<name>.zh.md`，以英文为权威原文。项目文档已完成首轮配对；中文译文默认 `Machine Draft`，需人工复核后才可视为可靠实现依据。规则见 [`bilingual-documentation.zh.md`](bilingual-documentation.zh.md)。

## 推荐阅读顺序

1. 项目目标与当前状态：[`../README.zh.md`](../README.zh.md)
2. 仓库约束：[`../AGENTS.zh.md`](../AGENTS.zh.md)（[English](../AGENTS.md)）
3. 首版产品范围：[`product-requirements.zh.md`](product-requirements.zh.md)（英文原文 [`product-requirements.md`](product-requirements.md) 为权威）
4. 首版 Electron 系统架构：[`architecture/electron-architecture.zh.md`](architecture/electron-architecture.zh.md)（英文原文 [`architecture/electron-architecture.md`](architecture/electron-architecture.md) 为权威）
5. 相关决策和讨论历史

## 当前文档依据

### 仓库开发与安全约束

- [`../AGENTS.zh.md`](../AGENTS.zh.md)（[English](../AGENTS.md)）：当前有效的仓库级约束。

### 产品需求草案

- [`product-requirements.zh.md`](product-requirements.zh.md)：状态为 Draft，汇总首个可用版本的已确认方向和待验证约束；在转为 Accepted 前，不应把整份文档描述为最终权威需求。权威英文原文为 [`product-requirements.md`](product-requirements.md)；译文状态为 Machine Draft。
- [`discussions/product-requirements-discussion.zh.md`](discussions/product-requirements-discussion.zh.md)（[English](discussions/product-requirements-discussion.md)）：上述需求的讨论过程，仅用于解释思考和决定形成历史。

### 架构

- [`architecture/electron-architecture.zh.md`](architecture/electron-architecture.zh.md)：当前 Proposed 系统架构；定义单窗口多项目、多顶层任务、task runtime/worktree、事件同步、持久化和安全边界。权威英文原文为 [`architecture/electron-architecture.md`](architecture/electron-architecture.md)；译文状态为 Machine Draft。
- [`discussions/electron-architecture-discussion.zh.md`](discussions/electron-architecture-discussion.zh.md)（[English](discussions/electron-architecture-discussion.md)）：新架构的保留、修改、新增和删除依据，不作为实现规范。
- [`architecture-review-guide.md`](architecture-review-guide.md)（[中文](architecture-review-guide.zh.md)）：模块划分、公共接口、依赖、契约、所有权及相关维度的架构评审方法。
- [`desktop-framework-options.md`](desktop-framework-options.md)（[中文](desktop-framework-options.zh.md)）：桌面框架与 TypeScript 构建方案调研。
- [`archive/electron-architecture.zh.md`](archive/electron-architecture.zh.md)（[English](archive/electron-architecture.md)）：已归档的 2026-09-17 单活动 runtime 提案（`Superseded`）。

### 开发指南

- [`../ACTIVE.md`](../ACTIVE.md)：当前工作项、排队、停车场与上次会话交接（供人与 coding agent 使用；非需求或架构权威）。
- [`guides/agent/README.zh.md`](guides/agent/README.zh.md)（[English](guides/agent/README.md)）：agent 约束 playbook（由根目录 `AGENTS.md` 内核、[路径触发](guides/agent/path-triggers.zh.md) 与 `ACTIVE.md` 渐进加载）。
- [`guides/agent-collaboration.zh.md`](guides/agent-collaboration.zh.md)（[English](guides/agent-collaboration.md)）：维护者与 coding agent 的协作方式；每次实现会话应与 `ACTIVE.md` 一并阅读。
- [`guides/code-style.zh.md`](guides/code-style.zh.md)（[English](guides/code-style.md)）：代码风格宪章（结构、命名、信任边界、抽象、注释）。
- [`guides/code-review.zh.md`](guides/code-review.zh.md)（[English](guides/code-review.md)）：维护者评审应用代码时的通过/不通过清单。
- [`git-commit-convention.zh.md`](git-commit-convention.zh.md)（[English](git-commit-convention.md)）：只在创建、生成、修改或审查 Git commit message 及整理提交历史时读取；规范与 commit message 全部使用英文。
- [`document-conventions.zh.md`](document-conventions.zh.md)（[English](document-conventions.md)）：创建、移动、拆分、归档或实质性修改项目文档时读取。
- [`bilingual-documentation.md`](bilingual-documentation.md)（[中文](bilingual-documentation.zh.md)）：双语文档的文件配对、英文原文权威性、翻译状态、质量评审、同步和迁移规范。
- 文档一致性：运行 `npm run docs:verify`（结构检查 + `docs:i18n:check`）；语义审计见 [`guides/agent/doc-drift-audit.zh.md`](guides/agent/doc-drift-audit.zh.md)。

## 已知迁移缺口

### 多任务模块设计

模块索引与首批 stub 见 [`modules/README.zh.md`](modules/README.zh.md)（[English](modules/README.md)），与架构 §8 owner 及 §20 计划代码路径对齐。已有 IPC、应用生命周期与任务/runtime 三角（`TaskRegistry`、`RuntimeRegistry`、`TaskRuntimeController`）的 stub；其余 owner 为 `planned`，随工作项扩展。

单 runtime 归档见 [`archive/module-structure.md`](archive/module-structure.md) 与 [`archive/modules/`](archive/modules/)，仅作历史参考。

### 尚待 spike/ADR 的架构 gate

在 [`reference/architecture-gates.zh.md`](reference/architecture-gates.zh.md)（[English](reference/architecture-gates.md)）跟踪，状态为 `Open` | `In spike` | `Accepted`。关闭 gate 须有 **Accepted** ADR；见 [何时写 ADR](decisions/README.zh.md#何时写-adr)。

主题：runtime 进程模型；子 Agent 集成；worktree 项目 trust；任务持久化 schema；apply 与 journal；npm + Forge/Vite 与 Linux 打包；附件 allowlist 与限制。

未关闭前仍为 Proposed——不得在文档或 UI 中当作已交付能力。

## 文档分类

当前采用按类型组织的目标结构，并渐进迁移现有文件。

### Requirements

当前文件暂未迁移：

- [`product-requirements.md`](product-requirements.md) · [`product-requirements.zh.md`](product-requirements.zh.md)

### Architecture

- [`architecture/electron-architecture.md`](architecture/electron-architecture.md) · [`architecture/electron-architecture.zh.md`](architecture/electron-architecture.zh.md)
- [`architecture-review-guide.md`](architecture-review-guide.md)（[中文](architecture-review-guide.zh.md)）
- [`desktop-framework-options.md`](desktop-framework-options.md)（[中文](desktop-framework-options.zh.md)）

### Module Design

- [`modules/README.zh.md`](modules/README.zh.md)（[English](modules/README.md)）：多任务模块索引与文档状态。
- Stub：[`ipc-registration`](modules/ipc-registration.zh.md)、[`application-lifecycle`](modules/application-lifecycle.zh.md)、[`task-registry`](modules/task-registry.zh.md)、[`runtime-registry`](modules/runtime-registry.zh.md)、[`task-runtime-controller`](modules/task-runtime-controller.zh.md)。
- 历史单 runtime：[`archive/module-structure.md`](archive/module-structure.md) 与 [`archive/modules/`](archive/modules/)。

### Decisions

- [`decisions/README.zh.md`](decisions/README.zh.md)（[English](decisions/README.md)）

当前尚未补录 ADR。后续只有在决定影响系统边界、安全、持久化、公共 contract 或难以逆转时才创建。

### Discussions

- [`discussions/README.zh.md`](discussions/README.zh.md)（[English](discussions/README.md)）
- [`discussions/product-requirements-discussion.zh.md`](discussions/product-requirements-discussion.zh.md)（[English](discussions/product-requirements-discussion.md)）
- [`discussions/electron-architecture-discussion.zh.md`](discussions/electron-architecture-discussion.zh.md)（[English](discussions/electron-architecture-discussion.md)）
- [`discussions/bilingual-documentation-discussion.zh.md`](discussions/bilingual-documentation-discussion.zh.md)（[English](discussions/bilingual-documentation-discussion.md)）

### Guides

- [`guides/code-style.zh.md`](guides/code-style.zh.md) · [`guides/code-style.md`](guides/code-style.md)
- [`guides/code-review.zh.md`](guides/code-review.zh.md) · [`guides/code-review.md`](guides/code-review.md)
- [`guides/agent-collaboration.zh.md`](guides/agent-collaboration.zh.md)（[English](guides/agent-collaboration.md)）
- [`guides/agent/README.zh.md`](guides/agent/README.zh.md)（[English](guides/agent/README.md)）

当前文件暂未迁移：

- [`git-commit-convention.zh.md`](git-commit-convention.zh.md)（[English](git-commit-convention.md)）
- [`document-conventions.zh.md`](document-conventions.zh.md)（[English](document-conventions.md)）
- [`bilingual-documentation.md`](bilingual-documentation.md)（[中文](bilingual-documentation.zh.md)）

### Reference

- 本索引。
- [`reference/README.zh.md`](reference/README.zh.md)（[English](reference/README.md)）：reference 与**实现契约**目录（状态 `Planned` | `Outline` | `Living`）。
- [`reference/glossary.md`](reference/glossary.md)（[中文](reference/glossary.zh.md)）：配对文档的英中术语表。
- [`reference/architecture-gates.zh.md`](reference/architecture-gates.zh.md)（[English](reference/architecture-gates.md)）：架构 gate ID、状态与 ADR 链接。
- 契约（WI/gate 前为外壳）：[ipc-channels](reference/ipc-channels.zh.md)、[domain-events](reference/domain-events.zh.md)、[task-and-runtime-states](reference/task-and-runtime-states.zh.md)、[persistence-layout](reference/persistence-layout.zh.md)（均有 `.zh.md`）。

### Assets

- [`assets/`](assets/)

### Archive

- [`archive/README.zh.md`](archive/README.zh.md)（[English](archive/README.md)）
- [`archive/electron-architecture.zh.md`](archive/electron-architecture.zh.md)（[English](archive/electron-architecture.md)）
- [`archive/module-structure.zh.md`](archive/module-structure.zh.md)（[English](archive/module-structure.md)）
- [`archive/modules/`](archive/modules/)（双语配对；历史单 runtime 材料）

## 文档状态

项目只使用以下状态：

- `Draft`：正在形成；
- `Proposed`：内容基本完成，等待确认；
- `Accepted`：已经确认，是当前有效依据；
- `Superseded`：已被其他文档或决定取代；
- `Archived`：仅保留历史参考。

旧文档中尚未统一的中文状态会在实质性修订时逐步迁移，不单独进行无关批量修改。

## 维护要求

新增或实质性修改项目文档时：

1. 阅读 [`document-conventions.zh.md`](document-conventions.zh.md)；
2. 确认文档类型、状态和权威范围；
3. 搜索是否已有重复文档；
4. 更新本索引；
5. 对实质性讨论更新对应 discussion；
6. 对重要且长期有效的决定评估是否创建 ADR；
7. 修复相对链接并记录已知冲突；
8. 不把 discussion 或 archive 当作当前实现规范。
