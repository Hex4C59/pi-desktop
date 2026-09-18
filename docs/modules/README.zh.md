# 多任务模块设计索引

[English](README.md) | 中文

- 类型：Module Design
- 状态：Accepted
- 创建：2026-09-19
- 上次评审：2026-09-19
- 适用：多任务架构下首版实现
- 权威范围：模块清单、所有权摘要、文档状态及单模块设计链接；不覆盖 [`architecture/electron-architecture.zh.md`](../architecture/electron-architecture.zh.md) §8
- 取代：[`../archive/module-structure.zh.md`](../archive/module-structure.zh.md) 作为**当前**实现决策依据
- 相关：[产品需求 §26](../product-requirements.zh.md)、[架构 gate](../reference/architecture-gates.zh.md)、[`ACTIVE.md`](../../ACTIVE.md)
- 权威原文：[Multi-task module design index](README.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

> **不要按 [`../archive/modules/`](../archive/modules/) 实现。** 该套假设单活动 runtime 与全局 generation 路由。请用本索引与架构 §8 owner。

## 用法

1. 在下表找到你要改资源的 **owner**。
2. **Doc** 为 `stub` 或更高时打开模块页；仅在需要契约的工作项中展开接口。
3. 声称已交付前查 **Gate / ADR**。
4. IPC 与生命周期工作请尽早阅读 WI-002 与多 runtime 清理相关 stub。

### 文档状态

| 状态 | 含义 |
|------|------|
| `planned` | 架构已定义 owner；尚无模块文件 |
| `stub` | 职责与测试焦点已草拟；接口 TBD |
| `draft` | 接口修订中 |
| `accepted` | 该模块当前实现权威 |

## 核心模块表

计划代码路径见架构 §20；脚手架落地前为靶路径，变更须配合架构或 ADR。

| Module ID | Owner | 所有权摘要 | 不得（另见 §8.2） | Arch | PRD | Gate / ADR | Planned code path | Doc |
|-----------|-------|------------|-------------------|------|-----|------------|-------------------|-----|
| `project-registry` | `ProjectRegistry` | 已打开项目与项目上下文 | 持有 SDK runtime | §8.1 | §4–§6 | — | `src/main/projects/` | planned |
| `task-registry` | `TaskRegistry` | 任务记录；任务/会话/worktree 绑定 | 持有 SDK runtime | §8–§9 | §4, §26 | `gate-task-persistence` | `src/main/tasks/` | [stub](task-registry.zh.md) |
| `agent-scheduler` | `AgentScheduler` | 顶层与子 Agent 槽位与等待队列 | 执行模型调用；改 follow-up 队列 | §8–§9 | §26 | `gate-sub-agent` | `src/main/scheduler/` | planned |
| `task-runtime-controller` | `TaskRuntimeController` | 每任务 runtime 槽、incarnation、generation | 编排跨任务用户用例 | §8–§9 | §26 | `gate-runtime-host` | `src/main/runtime/`（每任务） | [stub](task-runtime-controller.zh.md) |
| `runtime-registry` | `RuntimeRegistry` | 查找各控制器；应用级 shutdown | 拥有 worktree 或持久化事实 | §8.1 | §26 | `gate-runtime-host` | `src/main/runtime/` | [stub](runtime-registry.zh.md) |
| `runtime-event-subscription` | `RuntimeEventSubscription` | 单次 incarnation 的 SDK 订阅 | 拥有业务状态 | §8.1 | §26 | — | `src/main/runtime/`、`src/main/pi/` | planned |
| `task-event-stream` | `TaskEventStream` | 每任务 sequence 与投影提交 | 替代 catalog 真理 | §8.1 | §26 | — | `src/main/tasks/` | planned |
| `task-catalog-projection` | `TaskCatalogProjection` | Catalog sequence；项目/任务摘要 | 每任务详细流式状态 | §8.1 | §6, §26 | — | `src/main/tasks/` | planned |
| `worktree-manager` | `WorktreeManager` | worktree 创建、校验、锁、删除 | 直接向目标工作区 apply | §8.1 | §4–§5, §26 | — | `src/main/worktrees/`、`src/main/git/` | planned |
| `task-result-service` | `TaskResultService` | diff、校验、`resultRevision` | 直接 apply 变更 | §8.1 | §26 | `gate-apply-journal` | `src/main/results/` | planned |
| `result-application-service` | `ResultApplicationService` | apply/discard journal | 未明确 discard 即删 worktree | §8.1 | §26 | `gate-apply-journal` | `src/main/results/` | planned |
| `attachment-service` | `AttachmentService` | 附件 token | — | §8.1 | §5, §26 | `gate-attachments` | `src/main/attachments/` | planned |
| `extension-ui-coordinator` | `ExtensionUiCoordinator` | 扩展待处理 UI 请求 | — | §8.1 | §5, §26 | — | `src/main/extensions/` | planned |
| `trust-prompt-coordinator` | `TrustPromptCoordinator` | trust 待处理请求 | — | §8.1 | §5, §26 | `gate-project-trust-worktree` | `src/main/trust/` | planned |
| `request-scope-registry` | `RequestScopeRegistry` | IPC 请求取消作用域 | — | §8.1 | §26 | — | `src/main/ipc/` | planned |
| `renderer-store` | `RendererStore` | Catalog 与每任务 UI 投影 | Main 持久化真理 | §8.1 | §6, §26 | — | `src/renderer/store/` | planned |
| `ipc-registration` | `IpcRegistration`, `IpcRouter` | 固定 allowlist IPC、schema 校验、分发 | 业务状态；任意宿主执行 | §6, §18 | §26 | — | `src/main/ipc/` | [stub](ipc-registration.zh.md) |
| `application-lifecycle` | `ApplicationLifecycle` | 启停；清理触发顺序（窗口/退出） | 各资源清理实现细节 | §17 | §26 | `gate-runtime-host` | `src/main/application/`、`src/main/bootstrap/` | [stub](application-lifecycle.zh.md) |

### 应用编排（尚无独立 stub）

架构 §6.1 用户用例由应用服务编排。**`TaskCoordinator`** 负责任务级 abort、删除与非 Git 写锁（§9、§17）；与 `TaskRegistry` 的拆分在相关 WI 再写。**`SubagentCoordinator`** 负责子 Agent 编排（§17 清理矩阵）。

| Module ID | Owner | Planned code path | Doc |
|-----------|-------|-------------------|-----|
| `task-coordinator` | `TaskCoordinator` | `src/main/application/` 或 `src/main/tasks/` | planned |
| `subagent-coordinator` | `SubagentCoordinator` | `src/main/scheduler/` 或 `src/main/tasks/` | planned |

## 实现顺序（指针）

遵循架构 §23（Phase 0 gate，再安全壳）。gate 见 [`architecture-gates.zh.md`](../reference/architecture-gates.zh.md)。工程队列见 [`ACTIVE.md`](../../ACTIVE.md)。

建议文档顺序：`ipc-registration` → `application-lifecycle` → `task-registry` / `runtime-registry` / `task-runtime-controller`（已有 stub）→ gate 关闭后扩展其余模块。

## 历史映射（仅 archive）

| 当前 owner | Archive 模块（**勿**按原文实现） | Archive 失效假设 |
|------------|-----------------------------------|------------------|
| `RuntimeRegistry`, `TaskRuntimeController` | `RuntimeController`, `RuntimeStateMachine` | 单一全局活动 runtime |
| `TaskCatalogProjection`, `RendererStore` | `RendererState`, `EventPublisher` | 单一 Renderer 会话投影 |
| `TaskEventStream` | `EventPublisher`, `RuntimeEventSubscription` | 全局 sequence |
| `TaskRegistry`, `TaskCoordinator` | `SessionCoordinator`, `WorkspaceCoordinator` | 切换项目/会话对后台的隐含替换 |
| `IpcRegistration`, `IpcRouter` | `archive/modules/` 同名 | IPC 模式可参考；须对照多任务契约 |
| `ApplicationLifecycle` | `ApplicationLifecycle` | 多任务清理矩阵以架构 §17 为准 |

复用 archive 文字前须核对架构 §8–§9、§17。

## 维护

- 仅当架构或 Accepted ADR 改变 owner 时增删行。
- 模块文档为 `accepted` 时更新本表链接，并在 `ACTIVE.md` Last session 记录工作项。
