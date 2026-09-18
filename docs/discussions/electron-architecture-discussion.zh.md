# Electron 系统架构讨论记录

[English](electron-architecture-discussion.md) | 中文

- 类型：Discussion
- 状态：Accepted
- 翻译状态：Machine Draft
- 权威原文：[electron-architecture-discussion.md](electron-architecture-discussion.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 创建日期：2026-09-18
- 最近更新：2026-09-18
- 权威范围：架构形成过程的历史背景；不是实现依据
- 对应架构：[Electron 系统架构](../architecture/electron-architecture.zh.md)
- 产品输入：[产品需求](../product-requirements.md)
- 已归档模块设计：[模块结构](../archive/module-structure.zh.md)
- 历史提案：[已归档 Electron 架构](../archive/electron-architecture.md)

> 本文保存架构形成过程，不是实现规范。当前系统结构以对应 Architecture 为准。

## 2026-09-18 — 为何不能直接扩写旧架构

旧提案已经建立了正确的基础边界：Renderer/Preload/Main/pi SDK 分层、类型化 IPC、SDK adapter、generation、snapshot/event handoff、凭据隔离和 extension UI 清理。

随后确认的首版产品方向改变了系统基数和所有权：

- 单窗口内需要多个项目和多个顶层任务并行；
- 每个 Git 顶层任务需要独立 worktree；
- 当前查看任务和后台运行任务必须解耦；
- 需要子 Agent、多级 scheduler、成果审查、apply/discard 和重启恢复；
- event、snapshot、trust、attachment 和 extension request 都必须 task-scoped。

因此，旧架构的全局唯一 `RuntimeController`、全局 `runtimeGeneration`、切换项目即 replacement、单一 Renderer conversation 投影不再只是细节缺失，而是与产品需求直接冲突。决定不是在旧文件末尾补充“未来支持多任务”，而是重建系统级 owner，再复用原模块设计原则。

## 2026-09-18 — 采用的基线

架构修订采用以下输入顺序：

1. `AGENTS.md` 的安全、pi 集成和完成标准；
2. `product-requirements.md` 的多项目、多任务、worktree、恢复和成果流程；
3. `module-structure.md` 的单一职责、高内聚、窄 port、可测试边界和权限匹配方法；
4. 固定上游 commit `e5d18382a207a4b108d97f7cc97abdc90a23d32d` 的 SDK、安全、extension 文档和 session runtime 示例。

`module-structure.md` 被作为设计方法和模块候选来源，而不是把其中的单 runtime 基数原样提升为新架构。

## 2026-09-18 — 关键决定

### 单窗口，多任务

保留单实例和单主窗口，但不保留单活动 workspace/runtime。当前查看任务只是 Renderer 导航选择，不再是 runtime owner。

### Task 是顶层隔离单元

每个顶层 task 绑定 project、session、实际工作目录、Git worktree、runtime slot、follow-up、Agent tree 和成果状态。相同 pi session 不得同时绑定两个活动 task。

### Runtime registry + task-scoped controller

不创建新的全能全局 `RuntimeController`。`RuntimeRegistry` 只查找和关闭 task runtime controller；每个 `TaskRuntimeController` 只拥有一个 task slot 的当前 incarnation、generation、subscription 和 replacement 临界区。

### Catalog 与 task 两级同步

全局单 sequence 会让任一 task 的缺口迫使整个 UI 重同步。新架构使用 catalog stream 和 per-task stream：catalog 负责项目树摘要，task stream 负责详细 conversation/Agent/tool/result。一个 task 失步只重取该 task snapshot。

### Main projection 提供线性化点

只在 Runtime 上读取 snapshot、同时由另一个模块发布 event，无法证明 snapshot 的 sequence 已包含哪些事件。新架构要求 projection reducer、sequence 分配和 committed sequence 在同一无 `await` 串行提交中完成。

### Worktree 不是 sandbox

worktree 解决默认工作目录和成果应用边界，不阻止 shell、绝对路径、符号链接或 extension 访问其他用户可写位置。文案和实现都不能把它描述成安全隔离。

### 架构不伪造上游能力

子 Agent 和项目 trust/worktree 映射仍需要固定 pi 版本 spike。若公共 API 不足，应阻止实现、推动受支持接口或收窄产品范围，不能用 UI 模拟不存在的稳定语义。

## 2026-09-18 — 保留、修改、新增、删除

### 保留

- Electron/React/TypeScript 技术方向；
- Renderer/Preload/Main 权限边界；
- fixed allowlist IPC 和 runtime schema；
- pi adapter、错误脱敏、凭据隔离；
- `contentIndex`、tool call ID 和 `message_end.message` 规则；
- extension UI request/response 和幂等清理；
- session replacement 后 rebind；
- import boundary 和 fake provider 测试策略。

### 修改

- 全局 `RuntimeController` → `RuntimeRegistry` + per-task `TaskRuntimeController`；
- 全局 generation → task slot generation + runtime ID；
- 全局 event sequence → catalog sequence + per-task sequence；
- 单 runtime snapshot → catalog snapshot + task snapshot；
- 图片附件 → 有明确转换语义的受控通用附件；
- session 级模型选择 → 消息级不可变运行快照和 Desktop 延迟 follow-up；
- 应用退出清理 → 多 task/runtime/worktree/request 的有界清理。

### 新增

- project/task registries；
- 多级 scheduler 和防死锁规则；
- worktree manager；
- sub-agent coordinator；
- task persistence 和 interrupted recovery；
- result revision、validation records、review/apply/discard；
- apply journal；
- Linux desktop notifications；
- per-task Renderer projection。

### 删除

- “首版只能有一个活动工作目录/runtime”的建议；
- “切换当前项目或 session 就替换全局 runtime”的模型；
- 全局唯一 Renderer conversation 权威状态；
- 把 runtime 进程承载方式当作已经接受的决定；
- 在实现前同时建设 SDK 和 RPC 两套 backend 的方向。

## 2026-09-18 — 文档迁移

- 新系统架构创建于 [Electron 系统架构](../architecture/electron-architecture.md)，状态为 Proposed。
- 旧完整提案移至[已归档 Electron 架构](../archive/electron-architecture.md)，状态为 `Archived`。
- `module-structure.md` 与现有 `modules/` 已于 2026-09-19 归档，不再作为当前实现基线。
- 文档索引和产品需求链接转向新架构。

## 未关闭事项

以下不是本次架构文档可以替代验证的决定：

- pi runtime 运行在 Electron Main 还是独立 utility/child process；
- 固定 pi 版本的子 Agent integration；
- project trust 是否能通过公共 API 正确应用到内部 worktree，而不污染 trust store；
- task persistence 存储实现和 schema；
- apply 算法、支持的 Git 变化类型和 journal 恢复保证；
- npm + Electron Forge/Vite 的正式接受；
- 附件具体 allowlist 和限制。

这些事项应通过 spike 得到证据，再分别评估 ADR。此次没有代替用户单方面创建 Accepted ADR。
