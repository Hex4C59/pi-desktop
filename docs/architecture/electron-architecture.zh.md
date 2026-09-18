# pi-desktop 首版 Electron 系统架构

[English](electron-architecture.md) | 中文

- 类型：Architecture
- 状态：Proposed
- 翻译状态：Machine Draft
- 权威原文：[electron-architecture.md](electron-architecture.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-19
- 创建日期：2026-09-18
- 最近评审：2026-09-18
- 适用阶段：首个可用版本
- 权威范围：首版系统结构、进程边界、模块分层、资源所有权、事件同步、安全、持久化和生命周期约束
- 取代：[`../archive/electron-architecture.md`](../archive/electron-architecture.md)
- 产品需求：[`../product-requirements.md`](../product-requirements.md)
- 模块设计（已归档）：[`../archive/module-structure.md`](../archive/module-structure.md)
- 讨论记录：[`../discussions/electron-architecture-discussion.zh.md`](../discussions/electron-architecture-discussion.zh.md)
- 评审方法：[`../architecture-review-guide.md`](../architecture-review-guide.md)
- 上游参考 commit：`e5d18382a207a4b108d97f7cc97abdc90a23d32d`

> 本文描述计划架构，不表示应用已经实现。产品可见行为以产品需求为准；本文将这些行为分配到系统边界和资源 owner；单模块的接口细节以 `docs/modules/` 下待编写的多任务模块设计为准。已归档的单 runtime 模块文档不得覆盖本文的多任务所有权模型。

## 1. 架构结论

首版采用 Electron + React + Vite + TypeScript，提供单实例、单主窗口、多项目、多顶层任务的 Linux Agent 工作台。

系统遵循以下核心结论：

1. Renderer 只是呈现层，不获得 Node.js、shell、通用文件读写、pi SDK 或 provider 凭据。
2. Electron Main 是桌面宿主和高权限协调层，通过固定、类型化、运行时校验的 IPC 向 Renderer 暴露能力。
3. 每个顶层任务拥有独立任务记录、工作目录、pi session 绑定和 runtime slot；切换当前查看任务不替换或中止后台 runtime。
4. Git 项目的写任务使用独立 worktree；worktree 是工作流隔离，不是系统权限沙箱。
5. Main 内部保持 `IPC → Application Services → Task/Runtime/Capability Services → Pi Adapter → pi SDK` 的单向依赖。
6. 项目代码不复制 pi 的 agent loop、provider、工具、compaction 或 session 文件语义；只通过固定版本 pi 的公共 API 集成。
7. 多任务事件以 project、task、agent、runtime incarnation 身份寻址；全局摘要和任务详情分别同步，一个任务失步不得冻结其他任务。
8. task、runtime、worktree、pending request、附件 token、成果版本和应用 journal 都必须有唯一 owner。
9. 已保存凭据、完整 prompt、附件内容和敏感诊断不回传 Renderer，也不进入普通日志、系统通知或 Renderer 持久化。
10. pi runtime 的最终进程承载方式必须通过前置 spike 和 ADR 关闭；独立进程提供故障隔离，但不构成权限沙箱。

## 2. 文档分工和依赖

文档按以下方向逐级细化：

```text
product-requirements.md
  用户行为、范围、验收
        ↓
architecture/electron-architecture.md
  系统结构、边界、所有权、不变量
        ↓
docs/modules/*.md（待编写）
  模块清单、依赖、关键流程与单模块接口
        ↓
（历史单 runtime 材料见 archive/module-structure.md 与 archive/modules/）
        ↓
TypeScript / schema / lint / tests
  可执行约束
```

发生冲突时不得静默选择：

- `AGENTS.md` 的安全和开发约束优先；
- 产品可见行为以当前需求文档中已确认的方向为架构输入；
- 本文负责系统级结构和 owner；
- 模块文档只能细化本文，不能恢复全局唯一 runtime 等已被取代的假设；
- Discussion、Superseded 和 Archive 只提供历史背景。

## 3. 架构目标和非目标

### 3.1 目标

- 支持单窗口内多个项目和多个顶层任务并行运行；
- 同一 Git 项目的不同顶层任务使用独立 worktree；
- 支持主 Agent、子 Agent、工具、队列、重试、压缩和 extension UI 的可观察性；
- 保持当前查看任务和后台任务的身份、状态、错误与待处理交互不会串线或丢失；
- 提供任务成果审查、整项应用、明确丢弃和异常恢复；
- 重启后恢复项目、任务、session 引用、worktree 和未处理成果，但不自动继续模型请求；
- 隔离上游 SDK 变化，允许未来替换 runtime transport；
- 形成可由类型、schema、import rule 和自动化测试证明的边界。

### 3.2 非目标

首版不提供：

- Windows 或 macOS 支持；
- 多主窗口或关闭窗口后驻留托盘；
- 远程 Agent 服务和多设备同步；
- 非 Git 项目中的同项目并行写任务；
- 自动提交、自动合并或自动创建 Pull Request；
- 按文件或 hunk 选择性应用；
- 内置 Git 冲突解决器；
- 自定义 session JSONL 格式或直接改写 session 文件；
- 将 worktree、project trust 或独立 runtime 进程描述成系统沙箱；
- 同时维护 SDK 与 RPC 两套产品级 backend；
- 依赖上游 experimental `pi-client`、`pi-protocol` 或 `pi-server` 作为稳定基础。

## 4. 系统上下文

```text
┌─────────────────────────────────────────────────────────────┐
│ User                                                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ keyboard / pointer / dialogs
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Electron Renderer                                           │
│ project/task tree · conversation · task details · settings  │
└──────────────────────────────┬──────────────────────────────┘
                               │ fixed PiDesktopApi
                               │ command / result / event / snapshot
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Electron Main / Desktop Host                                │
│ IPC · application services · registries · scheduler         │
│ worktree/result services · persistence · lifecycle          │
└───────────────┬──────────────────┬──────────────────┬────────┘
                │                  │                  │
                │ runtime port     │ structured APIs  │ OS APIs
                ▼                  ▼                  ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────┐
│ Pi Runtime Host(s)   │  │ Git / filesystem │  │ dialogs /    │
│ SDK + tools + ext.   │  │ task worktrees   │  │ notifications│
└───────────┬──────────┘  └──────────────────┘  └──────────────┘
            │ provider APIs
            ▼
┌──────────────────────┐
│ Model providers      │
└──────────────────────┘
```

Desktop 只能约束自身的 IPC、日志、持久化和 UI。pi、extension、工具及其启动的进程仍以启动用户权限运行，并可能访问 worktree 之外的用户可写位置。

## 5. 进程模型

### 5.1 Renderer

Renderer 负责：

- React 视图和语义化交互；
- 当前查看项目与任务等短生命周期导航状态；
- Composer 草稿、焦点、面板开合等 UI 状态；
- 消费 Main 提供的摘要 snapshot、任务 snapshot 和领域事件；
- 向 Preload 调用固定业务命令。

Renderer 不得：

- 导入 Electron、Node.js 或 pi SDK；
- 执行 shell 或任意文件读写；
- 获得原始路径授权以外的通用主机能力；
- 获取已保存 API key、OAuth token 或认证文件；
- 持有 SDK class、Main service 或 runtime transport；
- 在浏览器存储中保存 prompt、follow-up、附件内容或 session 消息副本。

### 5.2 Preload

Preload 是 Renderer 与 Main 的唯一桥梁：

- 使用 `contextBridge` 暴露固定 `PiDesktopApi`；
- 每个方法映射到固定 IPC channel；
- 先安装事件监听并有界缓存，再完成 snapshot handoff；
- 返回明确的 unsubscribe；
- 不解释业务规则。

禁止暴露原始 `ipcRenderer`、动态 channel、通用 `send`/`invoke`、`process`、`fs`、`child_process` 或完整 Electron API。

### 5.3 Electron Main

Main 是桌面宿主和协调层，负责：

- 单实例、窗口、导航、系统对话框和桌面通知；
- IPC schema 校验、请求取消、错误映射和事件传输；
- project、task、runtime、worktree 和 result 生命周期；
- 多级并发调度；
- project trust、凭据、附件和 extension UI；
- 应用持久化、恢复、诊断和退出清理；
- 监督 runtime host，但不复制 pi 的 agent 语义。

### 5.4 Pi Runtime Host

逻辑上，每个顶层任务有一个 runtime slot。slot 内某一时刻至多有一个有效 runtime incarnation；该 incarnation 包装一个 pi `AgentSessionRuntime` 或等价隔离后端。

Runtime host 负责：

- 创建 cwd-bound pi services 和 session runtime；
- session replacement 后重新绑定 extension 与 event subscription；
- 将 prompt、steer、follow-up、abort、model 和 session 操作映射到固定版本公共 API；
- 把 SDK event 转成项目领域事件；
- 释放 session、listener、extension 和部分创建资源。

### 5.5 尚待关闭的进程承载决策

首版必须在业务实现前通过 spike 选择一种 backend：

1. **Electron Main 同进程 SDK**：链路短，但一个 extension 的死循环、`process.exit()`、OOM 或 native crash 可能带走整个应用和全部任务；
2. **utility/child process 中使用 SDK 或随应用分发的 RPC runtime**：可隔离崩溃和 event loop 阻塞，但需要序列化协议、supervisor、超时、重启和打包支持。

无论选择哪种方式，Application Services 只依赖项目自有的窄 runtime ports。不得让 Renderer、Shared 或业务模块依赖 SDK class。独立进程不改变 pi 的用户权限，也不构成文件或网络沙箱。

该决定必须形成 ADR；在关闭前，只能进行受控 spike，不应大规模实现多 runtime。

## 6. Main 内部分层和依赖规则

```text
IpcRegistration / IpcRouter
        ↓
Application Services
        ↓
Project / Task / Scheduler / Runtime / Capability Services
        ↓
Consumer-owned ports
        ↓
Pi Adapter / Git Adapter / Persistence Adapter / OS Adapter
        ↓
pi SDK / Git / filesystem / Electron
```

### 6.1 Application Services

按用户用例编排，不持有 SDK 实例或长生命周期资源：

- project open、remove 和资源决定；
- task create、restore、rename、delete；
- session list、create、switch、fork、rename；
- prompt、steer、follow-up、abort 和 queue；
- model/thinking 配置；
- result review、validate、apply 和 discard；
- snapshot query。

### 6.2 Capability Services

围绕资源和规则形成高内聚边界：

- project/task registries；
- scheduler；
- per-task runtime controller；
- worktree manager；
- result inspector 和 application journal；
- trust、credentials、attachments、extension UI；
- persistence、notifications、diagnostics。

### 6.3 Adapter

只有 adapter 层可以直接导入对应高权限或外部实现：

- `main/pi/`：pi SDK；
- `main/git/`：Git process/API；
- `main/persistence/`：文件和数据库实现；
- `main/platform/`：Electron dialog、notification、shell openExternal 等。

Application service 定义自己需要的窄 port。不得创建一个让所有调用者都能访问 prompt、model、session、dispose、Git 和持久化的巨型 host interface。

### 6.4 Shared Contracts

`src/shared` 只包含跨进程所需的：

- 可序列化领域类型；
- command/result/event/snapshot contract；
- runtime schema；
- branded ID 和稳定错误码。

Shared 不依赖 Electron、Node.js、pi SDK 或 Main/Renderer 实现。按 project、task、agent、session、runtime、model、auth、attachment、extension、result 等用例域拆分，禁止巨型 `types.ts`、`commands.ts` 或模糊 barrel。

## 7. 核心领域和身份

### 7.1 Project

`Project` 对应用户选择的规范化原始工作目录及其 pi、Git 和任务上下文，拥有稳定 `projectId`。项目资源决定绑定原始项目身份，不绑定内部 worktree 路径。

### 7.2 Top-level Task

`Task` 是用户可管理的顶层工作单元，拥有稳定 `taskId`，并绑定：

- `projectId`；
- 一个 pi session 引用；
- 一个实际工作目录；
- Git 项目中的独立 worktree；
- base commit、目标工作区和预期目标 ref；
- runtime slot；
- follow-up 队列；
- Agent、验证和成果状态；
- 当前 `resultRevision`。

同一个 pi session 同一时刻不得绑定两个活动顶层任务。

### 7.3 Main Agent 与 Sub-agent

每个顶层任务同一时刻最多运行一个主 Agent。子 Agent：

- 归属于一个 task 和父 Agent；
- 与父任务共享 worktree；
- 拥有稳定 `agentId` 和父子关系；
- 可独立排队、运行、等待、失败、完成或取消；
- 不能由用户直接发送消息；
- 中止主任务时必须级联取消。

子 Agent 不是当前 SDK 可直接假定的一等稳定能力。进入实现前必须通过公共 API、受支持的 extension/custom tool 或兼容性保护协议完成 spike；失败时应阻止实现或修订产品范围，不能伪造状态。

### 7.4 Runtime Slot 与 Incarnation

`RuntimeSlot` 归属于一个 `taskId`，跨 runtime 重建保持稳定。每次创建、恢复或替换实际 runtime 时产生新的 incarnation：

- `runtimeId`：该 incarnation 的唯一 ID；
- `generation`：task slot 内单调递增；
- `state`：starting、ready、running、waiting、aborting、replacing、error、crashed、disposed 等；
- event subscription 和取消句柄；
- 对应 session/runtime adapter。

旧 incarnation 一旦失效，其迟到事件和响应不得影响当前 task。

### 7.5 当前查看任务与后台任务

当前查看任务只是 Renderer 导航选择。切换它：

- 不替换 runtime；
- 不改变 scheduler 状态；
- 不取消 prompt、tool、extension request 或 follow-up；
- 不丢弃后台事件；
- 只改变需要加载的详细 snapshot 和中央视图。

## 8. 模块组和资源所有权

### 8.1 核心 owner

- project registry：`ProjectRegistry`；
- task record、task/session/worktree 绑定：`TaskRegistry`；
- 顶层与子 Agent 的并发槽位和等待队列：`AgentScheduler`；
- task runtime slot、当前 incarnation 和 generation：`TaskRuntimeController`；
- 全部 task runtime controller 的查找和应用级关闭：`RuntimeRegistry`；
- runtime SDK subscription：对应 `RuntimeEventSubscription`；
- task event sequence 和 task projection commit：对应 task 的 `TaskEventStream`；
- catalog sequence 和项目/任务摘要 projection：`TaskCatalogProjection`；
- worktree 创建、验证、锁和删除：`WorktreeManager`；
- Git diff、validation record 和 `resultRevision`：`TaskResultService`；
- apply/discard journal：`ResultApplicationService`；
- attachment token：`AttachmentService`；
- extension pending request：`ExtensionUiCoordinator`；
- trust pending request：`TrustPromptCoordinator`；
- IPC request cancellation：`RequestScopeRegistry`；
- Renderer catalog 和 per-task projection：`RendererStore`；
- window geometry 和非敏感 UI 偏好：对应 store；
- session、认证、pi settings/resources 和 trust store 的事实：pi 公共 API。

### 8.2 禁止双重所有权

- `TaskRegistry` 不持有 SDK runtime；
- `RuntimeRegistry` 不拥有 worktree 或持久化事实；
- `TaskRuntimeController` 不编排 project/task 用户用例；
- `AgentScheduler` 不执行模型调用，也不修改 follow-up 队列；
- `TaskResultService` 不直接应用变更；
- `ResultApplicationService` 不删除未经明确 discard/cleanup 决定的 worktree；
- Renderer projection 不是 Main 持久化事实；
- adapter 不成为业务状态 owner。

## 9. Runtime、Session 和调度

### 9.1 Runtime 生命周期

每个 task 的 runtime 变化只影响该 task：

```text
Task command
  → TaskRuntimeController 锁定该 task slot
  → 旧 incarnation 立即失效并拒绝新操作
  → 取消 task-scoped pending operation
  → unsubscribe / abort / dispose 旧 runtime
  → 通过 RuntimeFactory 创建新 runtime
  → 绑定 extensions 和 SDK subscription
  → 安装新 runtimeId + generation
  → 提交 task snapshot
  → 状态 ready
```

新 runtime 创建失败时，不得把旧 runtime 宣称为仍可用。task 进入明确 error/crashed/interrupted 状态，其他 task 不受影响。

### 9.2 Session replacement

`newSession()`、`switchSession()`、`fork()` 和 import 属于 task slot 内的 replacement。上游 `AgentSessionRuntime` replacement 后 `runtime.session` 会变化，因此必须：

1. 失效旧 incarnation 或旧 session binding；
2. 解除旧 listener；
3. 完成上游 replacement；
4. 对新 `runtime.session` 重新 bind extensions；
5. 重新订阅；
6. 发布新的 task snapshot。

切换 Renderer 当前会话不是 replacement；只有用户明确改变某个 task 的 session 绑定时才执行上述流程。

### 9.3 Scheduler

Scheduler 管理三类限制：

- 同时运行的顶层任务；
- 每个 task 的子 Agent；
- 全局主 Agent和子 Agent总数。

必须满足：

- 超限请求进入明确的 scheduler queue；
- scheduler queue 与 follow-up queue、provider retry 分离；
- waiting for user 不占模型执行槽；
- 父 Agent 等待子 Agent 时释放模型执行槽；
- 已被父任务依赖的 queued 子 Agent 优先于新顶层任务，避免占槽等待死锁；
- 支持取消、有界等待和饥饿保护；
- 动态降低上限不强制终止已运行 Agent。

### 9.4 Prompt 与消息级模型快照

Prompt command 必须经过 task-scoped preflight：

- task/runtime 可用；
- 输入和附件有效；
- 项目资源决定适用；
- provider 已认证；
- 模型和 thinking level 可用；
- 实际工作目录与 task 绑定一致；
- scheduler 接受或排队。

使用 pi `preflightResult` 尽快返回 `PromptAcceptance`；完整 `prompt()` Promise 留在后台并显式捕获失败。

普通 prompt 在开始一轮前应用不可变模型快照。steer 继承当前 run 配置，不在运行中换模型。需要独立模型快照的 follow-up 由 Desktop 持有，直到真正开始下一轮前才设置模型和 thinking level；不能提前交给无法保留该快照的上游队列。

## 10. 事件寻址、一致性和同步

### 10.1 两类事件流

为避免一个 task 失步冻结全部任务，使用两个逻辑流：

1. **Catalog stream**：项目、任务摘要、未读、waiting、失败、成果状态和聚合用量；
2. **Task stream**：某个 task 的 conversation、thinking、tool、Agent tree、queue、runtime、validation 和 result details。

### 10.2 Event envelope

概念契约如下，最终字段由 Shared Contracts 固化：

```typescript
interface DesktopEventEnvelope {
  stream: "catalog" | "task";
  catalogSequence?: number;
  taskSequence?: number;
  projectId?: ProjectId;
  taskId?: TaskId;
  agentId?: AgentId;
  runtimeId?: RuntimeId;
  generation?: number;
  event: DesktopEvent;
}
```

约束：

- catalog stream 使用应用进程内单调递增的 `catalogSequence`；
- 每个 task stream 使用 task 生命周期内单调递增的 `taskSequence`，runtime replacement 不重置；
- runtime 来源事件必须带 `runtimeId + generation`；
- tool call ID 只在 `taskId + agentId` 范围内解释；
- 旧 runtime 的事件在 Main commit 前丢弃；
- Renderer 仍需校验身份，形成第二道防线。

### 10.3 Main projection 与线性化

Main 维护可序列化的 catalog projection 和 per-task projection。它们是同步协议的权威投影，不替代 pi session 或 TaskStore 的持久化事实。

每个 stream 的以下步骤必须在同一串行提交序列中完成，提交回调内不得 `await`：

1. 校验 task、runtime incarnation 和 generation；
2. 用领域 reducer 更新 Main projection；
3. 分配对应 sequence；
4. 形成 event envelope；
5. 记录 snapshot 可见的 committed sequence。

由此建立不变量：

> `snapshot.sequence = N` 表示该 snapshot 已包含对应 stream 中所有 `sequence <= N` 的已提交变化。

发送给窗口可以发生在 commit 之后。发布失败不得回滚已经提交的 projection；Renderer 通过 snapshot 重同步恢复。

### 10.4 Snapshot

提供两类查询：

- `getCatalogSnapshot()`：项目和任务摘要、catalog sequence；
- `getTaskSnapshot(taskId)`：指定 task 的完整可序列化详情、task sequence、当前 runtimeId/generation。

Renderer 初始化：

```text
Preload 先订阅并有界缓存 catalog event
  → 请求 catalog snapshot
  → 原子应用 snapshot
  → 重放更大 catalogSequence
  → 切换实时消费
```

打开 task 详情时对该 task 执行同样 handoff。发现缺口时只暂停对应 stream：

- catalog 缺口重新请求 catalog snapshot；
- task 缺口只重新请求该 task snapshot；
- 其他 task 继续消费；
- 不猜测丢失状态。

### 10.5 Pi event 转换

`PiEventAdapter` 必须保持上游语义：

- 用 `contentIndex` 关联 text/thinking block；
- 用 tool call ID 关联工具生命周期；
- `message_update` 只作为增量；
- `message_end.message` 是完成消息权威值；
- `tool_execution_update.partialResult` 是累计结果；
- SDK event 必须穷尽处理或显式记录受控的不支持分支；
- 领域事件服务桌面状态，不要求与 SDK event 一一对应。

## 11. 关键端到端流程

### 11.1 打开项目

```text
IpcRouter
  → ProjectCoordinator
  → PathValidator / GitInspector
  → ProjectTrustCoordinator
  → ProjectRegistry 保存项目记录
  → TaskRecoveryService 加载并验证已有 task/worktree
  → catalog projection commit
  → Renderer project/task tree
```

取消目录选择不报错、不改变状态。信任决定完成前不得加载受保护项目资源。

### 11.2 创建 Git 顶层任务

```text
TaskCoordinator
  → 验证 project 与原始 workspace
  → WorktreeManager 记录 base commit 并创建独立 worktree
  → TaskStore 持久化 task/worktree/session binding
  → RuntimeRegistry 创建 task slot
  → Scheduler 接受或排队
  → TaskRuntimeController 创建 runtime
  → 绑定 subscription 并提交 task snapshot
```

任一步失败都必须清理本次创建的部分资源；已持久化事实和残留 worktree 必须可诊断，不得创建空 task 冒充成功。

### 11.3 创建非 Git 任务

非 Git 项目直接使用原目录，但 `TaskCoordinator` 必须通过项目级写任务锁阻止第二个活动或保留的并行写任务。不得自动复制目录或静默共享目录并行。

### 11.4 发送 prompt

```text
IpcRouter
  → AgentCommandService(taskId)
  → task-scoped preflight
  → AgentScheduler
  → TaskRuntimeController.withReadyRuntime
  → PiRuntimeAdapter.prompt(preflightResult)
  → 尽快返回 PromptAcceptance
  → PiEventAdapter
  → TaskEventStream commit
  → Renderer task projection
```

后台 Promise 必须显式捕获；接受后的失败通过 task event 和安全错误状态报告。

### 11.5 切换当前查看任务

```text
Renderer 更新 selectedTaskId
  → 订阅/恢复目标 task stream
  → 请求目标 task snapshot
  → 应用 snapshot 并重放缓存
```

该流程不调用 `RuntimeRegistry.replace`，不改变 scheduler，也不中止原任务。

### 11.6 子 Agent

主 Agent 通过经过 spike 验证的能力请求创建子 Agent：

```text
Parent runtime request
  → SubagentCoordinator 校验 task/parent/worktree
  → AgentScheduler 获取 task/global slot
  → 创建 child agent identity
  → child event 路由到同一 task stream
  → 父 Agent等待或继续
```

单独中止只作用于目标 child；中止主任务级联取消全部未结束 child。

### 11.7 Extension UI

```text
Runtime extension request
  → ExtensionUiCoordinator 生成 requestId
  → 绑定 projectId/taskId/agentId/runtimeId/generation
  → task 进入 waiting，catalog 显示持久标记
  → Renderer dialog / Linux notification
  → 用户响应
  → Main 校验 request scope 和 incarnation
  → resolve 对应 Promise
```

重复、迟到或错误来源的响应必须拒绝。abort、runtime replacement/crash、task 删除、窗口关闭、应用退出和 timeout 必须结束 pending Promise，且只 settle 一次。

### 11.8 退出和重启

退出时：

1. 停止接收新 command 和新调度；
2. snapshot 当前 task 状态并建立有界清理上下文；
3. 取消所有主 Agent并级联子 Agent；
4. settle extension/trust/request pending operation；
5. flush 受控 follow-up 和 task metadata；
6. unsubscribe、dispose 或终止全部 runtime host；
7. flush settings 和脱敏诊断；
8. 达到 timeout 后记录残留并退出，不能无限等待。

重启时把之前 running、queued、waiting、aborting 的 task 标记为 interrupted，验证 session、worktree、Git 和 metadata 事实。不得自动继续模型、命令或子 Agent。

## 12. Project Trust

Project trust 绑定稳定 `projectId` 和原始规范化项目路径，不绑定内部 worktree 路径。

Main 必须通过固定 pi 版本的公共 API 复现以下语义：

- 检查 `.pi/settings.json`、项目 extension/skill/prompt/theme/system prompt、项目 package 和项目 `.agents/skills`；
- saved decision 按 canonical path 和父路径匹配；
- user/global 与 CLI extension 可以参与 `project_trust`；
- “加载并记住”和“不加载项目资源”使用 pi trust store；
- “仅本次加载”只存在 Main 的 project-scoped process registry；
- context file 的上游加载语义不得被错误描述为 trust sandbox；
- 不自行解析或改写 `trust.json`。

项目资源决定改变后只影响新建或重建 runtime，不能热切换正在运行的 runtime。创建 task worktree runtime 时显式应用原始项目决定，不为 worktree 留下独立持久信任记录。

公共 API 是否足以完成该流程是实现前 spike；不足时应推动受支持接口或调整方案，不能依赖 `../pi` 私有路径。

## 13. Worktree 和任务成果生命周期

### 13.1 Worktree 创建

`WorktreeManager` 负责：

- 检查 Git 可用性和 repo identity；
- 以任务创建时原始工作区 `HEAD` 为默认 base；
- 记录 immutable base commit；
- 创建受管理 worktree 和唯一 identity；
- 锁定同一 task 的并发 lifecycle 操作；
- 验证外部删除、移动、损坏或 ref 变化；
- 删除前再次确认 task、runtime 和成果状态。

原始工作区有未提交修改时可以创建任务，但不自动 stash、commit、复制或修改这些变化；UI 必须说明 task 看不到它们。

### 13.2 Result revision

任务成果定义为 `base commit → 当前 worktree 文件状态`，包括 task 内提交和未提交变化。`TaskResultService` 计算稳定的 `resultRevision`，并关联：

- 文件清单和完整 diff；
- validation records；
- 目标 workspace/ref 状态；
- review 时间和适用性。

worktree、目标 ref、目标 workspace 或文件状态变化后，旧 review、validation 和 applicable 状态立即失效。

### 13.3 Apply

首版只允许整项应用。`ResultApplicationService` 必须：

1. 对目标 repo、workspace、cleanliness、base、target ref、worktree 和 `resultRevision` 做预检查；
2. 为支持的变化类型生成明确计划；
3. 在写入前创建持久 journal；
4. 遇到冲突、权限、磁盘或不支持类型时安全停止；
5. 不留下未声明的冲突标记；
6. 重启后可识别 pending/unknown/completed journal；
7. 只在可验证完成后标记 applied；
8. 保留 worktree，直到用户确认清理。

在具体 Git 算法、重命名、二进制、模式、符号链接、submodule、LFS、稀疏检出和异常注入测试完成前，不得承诺跨文件绝对原子。

### 13.4 Discard

Discard 是不可恢复的独立用例：

- 先停止并清理 task runtime 和子 Agent；
- 显示 project、task、worktree 和变化摘要；
- 二次确认；
- 删除未应用成果和 worktree；
- 删除失败时保持可恢复记录并提供诊断；
- 不修改已应用到目标 workspace 的内容。

## 14. 附件、凭据和 Extension UI

### 14.1 Credentials

凭据持久化事实由 pi `ModelRuntime`/credential store 管理。Desktop 只协调：

- 不含秘密的认证状态；
- 一次性 API key 提交；
- OAuth 开始、取消和 timeout；
- logout；
- `CredentialSynchronizationError` 后重新查询状态，而不是盲目重试 mutation。

秘密不进入 Renderer 持久化、普通日志、通知、错误或遥测。

### 14.2 Attachments

`AttachmentService` 拥有短生命周期 token。token 至少绑定：

- window；
- project/task；
- 目标 message draft；
- 允许的文件 identity 和 metadata；
- 过期与消费状态。

Main 通过系统选择器或批准的拖放/粘贴授权后，重新校验文件类型、大小、可读性、普通文件属性、选择后变化和模型能力。Renderer 只持有 metadata 和 token。

首版产品入口可接受通用文件，但只有存在明确转换语义的类型才能发送：图片转上游图片内容；受限文本按编码和大小转消息内容；PDF、办公文档、压缩包和其他二进制在安全解析方案完成前明确拒绝。附件不复制进 worktree，不跨 task/message 复用。

### 14.3 Extension UI

首版领域契约覆盖 `select`、`confirm`、`input`、`editor` 和 `notify`。所有 extension 文本按不可信纯文本处理；不执行 HTML、脚本或远程 UI。阻塞请求按 task 确定排序，并与 Agent waiting 状态、项目树标记和通知联动。

## 15. Renderer 状态架构

RendererStore 分为：

### 15.1 Catalog projection

- project summaries；
- task summaries；
- running/queued/waiting/failed/interrupted/review counts；
- 未读和待处理请求；
- 聚合用量；
- 最后应用的 catalog sequence。

### 15.2 Per- task projection

每个加载过的 task 独立保存：

- 当前 runtimeId/generation；
- 最后 task sequence；
- 完成消息；
- 临时 text/thinking/tool streaming state；
- Agent tree；
- follow-up 和 scheduler 状态；
- model snapshot 和用量；
- validation 和 result details；
- 失步、loading、error 状态。

### 15.3 UI-only state

- selected project/task；
- Composer draft；
- 附件 metadata/token 引用；
- 焦点、面板、展开状态；
- 未提交的设置编辑。

UI-only state 不得冒充 Main 权威状态。optimistic queue、runtime、result 或 apply 状态只能作为临时视觉反馈，最终由 Main event/snapshot 确认。

高频 delta 使用细粒度订阅，不能通过大范围 React Context 造成 Composer、导航或任务详情不可控跳动。具体 store 库留到实现时选择。

## 16. 持久化和恢复

### 16.1 pi 管理

继续由 pi 公共 API 管理：

- session JSONL；
- 认证和模型目录；
- pi settings；
- trust store；
- extension、skill、prompt、theme 和 context 资源。

Desktop 不直接解析或改写 session JSONL、`auth.json` 或 `trust.json` 来实现业务功能。

### 16.2 pi-desktop 管理

Main 控制的应用存储至少包含：

- project identity 和规范化原始 workspace；
- task identity、名称和 session 引用；
- worktree identity/path、base commit、目标 workspace/ref；
- runtime 可恢复 metadata，不保存 SDK 实例；
- Agent、validation 和 result lifecycle 状态；
- `resultRevision` 和 apply/discard journal；
- 受控的未执行 follow-up 内容、顺序、模型快照和暂停状态；
- 窗口几何和非敏感偏好；
- 通知去重所需的非敏感状态。

未执行 follow-up 是用户内容，不是普通 metadata：必须存放在 Main 控制、权限受限的专用区域，具有执行、清空、task 永久删除时的删除生命周期，且不得进入日志、通知或诊断摘要。若无法安全实现，必须收窄重启恢复承诺。

### 16.3 恢复原则

缓存不是事实。恢复时必须重新验证：

- project/workspace 路径；
- repo identity、worktree 和 base commit；
- session 可恢复性；
- 目标 workspace/ref；
- apply journal；
- 成果和 validation 对应的 revision。

局部损坏不得导致删除仍可恢复的 session、worktree 或成果。不能恢复的 task 进入明确错误状态，并提供审查、应用、丢弃或手动恢复路径。

## 17. 生命周期和清理

### 17.1 Scope

所有长生命周期资源明确归入：

- application scope；
- window scope；
- project scope；
- task scope；
- runtime incarnation scope；
- agent scope；
- request/message scope。

owner 实现清理细节，Lifecycle/Coordinator 决定触发顺序。不得通过隐藏全局事件总线让模块自行猜测清理时机。

### 17.2 清理矩阵

| 触发事件 | 必须处理的资源 | 协调者 |
| --- | --- | --- |
| runtime replacement | incarnation request、extension UI、subscription、SDK runtime | `TaskRuntimeController` |
| child Agent abort | child scheduler slot、child operation、child pending UI | `SubagentCoordinator` |
| main task abort | main run、全部 child、paused follow-up 状态、pending UI | `TaskCoordinator` |
| task delete/discard | runtime、request、attachment、worktree、task record | `TaskCoordinator` / `ResultApplicationService` |
| window close | window IPC request、trust/extension dialog、attachment token、event target | `ApplicationLifecycle` |
| runtime crash | incarnation、pending response、scheduler slot、task status | `TaskRuntimeController` |
| application exit | 全部 task/runtime、pending request、store flush、diagnostics | `ApplicationLifecycle` |

每个 cleanup 方法必须幂等；一个 participant 失败后继续清理其他 participant；聚合失败只进入脱敏诊断。pending Promise 只能 settle 一次。

## 18. 安全和权限

### 18.1 Electron 安全基线

主窗口至少启用：

- `nodeIntegration: false`；
- `contextIsolation: true`；
- `sandbox: true`；
- `webSecurity: true`；
- 生产环境严格 CSP；
- 不加载远程应用代码；
- 拒绝任意窗口创建和页面远程跳转；
- 外链经过 allowlist 协议校验后交给系统浏览器；
- 拒绝 `javascript:` 和任意外部 `file:` 导航。

### 18.2 IPC

- 只注册固定 allowlist command；
- Main 将输入视为 `unknown` 并使用对应 schema 收窄；
- command 显式携带所需 project/task/request identity；
- 校验调用窗口、资源 scope 和当前 runtime incarnation；
- 不提供通用 execute、readFile、invoke 或 host method 接口；
- 所有长请求支持取消或 timeout；
- 跨进程错误只返回稳定错误码、用户消息、可恢复性和可选 diagnostic ID。

### 18.3 不可信内容

Markdown、HTML、模型输出、工具/终端输出、diff、路径、链接、extension 文本和附件 metadata 全部按不可信数据处理。禁止任意脚本执行，限制外部导航，正确处理 ANSI、超长无换行文本和编码混淆链接。

### 18.4 Worktree 和 trust 不是 sandbox

worktree 只防止 pi-desktop 默认工作目录中的任务成果直接污染原始 workspace；绝对路径、符号链接、extension、shell 和子进程仍可能访问其他用户可写位置。真正隔离必须使用容器、VM、micro-VM 或 OS sandbox。

## 19. 错误、诊断和通知

用户可见错误必须说明：

- 失败操作；
- task/worktree/成果是否安全；
- 是否可恢复；
- 下一步；
- 必要的 `diagnosticId`。

`DiagnosticReporter` 不记录完整 prompt、文件/附件内容、环境变量、凭据、认证文件、完整 IPC payload 或敏感完整路径。原始 cause 不跨进程。

Linux 通知只用于后台 task 的 waiting、failed 和用户启用的 completed 状态；内容脱敏、去重，并携带可验证的 project/task/request deep-link identity。通知不可用时，项目树持久状态仍是权威入口。

## 20. 推荐实现目录

```text
src/
├── main/
│   ├── bootstrap/
│   ├── window/
│   ├── ipc/
│   ├── application/
│   ├── projects/
│   ├── tasks/
│   ├── scheduler/
│   ├── runtime/
│   ├── pi/
│   ├── git/
│   ├── worktrees/
│   ├── results/
│   ├── trust/
│   ├── credentials/
│   ├── attachments/
│   ├── extensions/
│   ├── persistence/
│   ├── notifications/
│   ├── preferences/
│   ├── diagnostics/
│   └── platform/
├── preload/
├── renderer/
│   ├── app/
│   ├── store/
│   ├── features/
│   └── components/
├── shared/
│   ├── contracts/
│   └── domain/
└── tests/
    ├── fixtures/
    ├── fakes/
    ├── contracts/
    └── helpers/
```

目录表达依赖和变化原因，不要求“一类一文件”。具体文件只在消除重复、隔离外部变化或表达明确 owner 时拆分。

## 21. 构建和打包约束

技术方向为 Electron + React + Vite + TypeScript strict。包管理器、Forge/Vite 组合和发布 maker 仍需通过构建 ADR 关闭；当前提案继续优先验证 npm + Electron Forge/Vite。

所有直接依赖固定精确版本并提交 lockfile。正式构建不得引用 `../pi`。固定 pi 版本后必须验证 Electron 内置 Node.js 满足其最低要求。

脚手架阶段必须完成 packaged spike：

```text
打包 Electron
  → 启动 production main
  → 检查 process.versions.node
  → 导入固定 pi SDK 或启动随包 runtime
  → 创建不调用真实模型的最小 runtime
  → 验证 ESM / assets / WASM / native dependency / ASAR
  → 正常 dispose 或 terminate
```

只对确实不能位于 ASAR 的资源配置 unpack，不默认关闭整个 ASAR。首批 Linux 产物当前优先评估 RPM 和 deb；发布格式需单独确认，不影响核心模块边界。

## 22. 测试和自动化边界

### 22.1 静态约束

- Renderer 禁止导入 Electron、Node.js、pi SDK 和 Main；
- Shared 禁止导入任何进程实现或高权限依赖；
- Main 中只有对应 adapter 目录导入 pi SDK、Git/Electron 高权限实现；
- IPC input 必须有 TypeScript 类型和 runtime schema；
- event、state 和 result 使用可辨识联合并穷尽处理；
- 禁止 `any` 和未声明的动态 channel。

### 22.2 Contract 和单元测试

至少覆盖：

- SDK event 到领域 event 的 text/thinking/tool/queue/retry/compaction 映射；
- 相同 tool ID 在不同 task/agent 下不串线；
- per-task generation、runtimeId 和 sequence；
- catalog/task snapshot 线性化和 gap recovery；
- session replacement 后 rebind 与旧事件丢弃；
- scheduler 上限、取消、优先级、饥饿和防死锁；
- project trust 的 remembered/once/declined 和 worktree 复用；
- 附件伪造、变化、过期和跨 task 重放；
- extension UI 重复/迟到响应和全部清理路径；
- task store 损坏和局部恢复；
- worktree 创建/锁/外部删除；
- `resultRevision` 失效；
- apply journal 的磁盘、权限和进程退出异常注入；
- 日志、通知、错误和 snapshot 的秘密扫描。

### 22.3 UI 和 E2E

使用 fake provider、fixture 或 mock runtime，不调用真实 key、付费模型或不稳定服务。覆盖产品需求中的关键验收场景，尤其是：

- 跨项目并行；
- 同项目 worktree 隔离；
- 非 Git 并行拒绝；
- 后台 task 继续运行；
- 子 Agent观察和中止；
- follow-up 与 abort；
- 后台 extension request；
- 成果审查、apply 阻止和 discard；
- 退出、interrupted 恢复和局部损坏；
- 多任务事件隔离；
- 键盘、焦点、窄窗口和不可信内容。

### 22.4 打包测试

CI 和发布前使用与 `package.json` 相同 scripts 验证：

- production bundle 启动；
- runtime backend 创建和清理；
- app data 路径；
- Electron sandbox；
- RPM/deb 安装、启动和卸载；
- 无凭据时安全失败。

## 23. 实施顺序和质量门

按纵向结果推进，不按模块清单横向创建空实现。

### 阶段 0：关闭架构阻塞项

- runtime 进程承载 ADR 和 spike；
- consumer-owned runtime ports；
- catalog/task sequence 与 snapshot commit contract；
- task/runtime/worktree/pending resource 清理矩阵；
- 子 Agent integration spike；
- apply 算法和 journal spike；
- 构建与打包基线决定。

出口：关键安全、所有权、并发和生命周期规则达到可实施级。

### 阶段 1：安全壳

- Electron/React/TypeScript 脚手架；
- 安全窗口、Preload、IPC schema 和错误模型；
- import boundary、测试框架和 packaged SDK spike；
- 空的 project/task catalog UI。

### 阶段 2：单任务 runtime 闭环

- fake provider；
- project open/trust；
- 一个 Git task worktree；
- prompt、text stream、abort、dispose；
- task snapshot/event handoff。

### 阶段 3：Task registry 和多任务

- 多项目和多 task registry；
- per-task runtime、event、Renderer projection；
- 后台运行和当前 task 切换；
- scheduler 顶层限制；
- 退出和 interrupted 恢复。

### 阶段 4：Session、Queue、Tools 和 Models

- session create/restore/switch/fork；
- tool lifecycle；
- steer/follow-up 与消息级配置；
- model/auth；
- 附件。

### 阶段 5：Sub-agent 和交互

- 子 Agent协议与多级 scheduler；
- Agent tree；
- extension UI；
- 通知；
- 用量聚合。

### 阶段 6：成果闭环

- diff/result revision；
- validation records；
- review；
- apply journal 和异常恢复；
- discard 与 worktree 清理。

### 阶段 7：发布闭环

- 完整 Markdown/code/diff UI；
- 可访问性和窄窗口；
- 打包、安装 smoke、已知限制和发布清单。

每个切片必须满足 Definition of Ready 和 `AGENTS.md` 的完成标准，并在结束时同步代码、测试和文档。

## 24. 待关闭的架构决策

以下事项仍是进入相应实现前的 gate：

1. **Runtime host**：Electron Main 同进程还是 utility/child process；
2. **Sub-agent integration**：固定 pi 版本是否提供足够公共能力，或采用何种兼容性保护的 custom tool/runtime 协议；
3. **Build baseline**：npm + Electron Forge/Vite 是否正式接受；
4. **Task persistence**：存储实现、schema 版本、权限和迁移/损坏策略；
5. **Apply algorithm**：支持的 Git 变化类型、journal 状态机和恢复保证；
6. **Packaging**：首批 RPM/deb 的具体 maker 和验证矩阵；
7. **附件规格**：具体 allowlist、编码、大小、数量和总量限制。

这些问题必须有 owner、spike、接受标准和决定时点。未关闭部分不得被文档或 UI 描述成已实现能力。

## 25. 架构完成判定

开始大规模实现前，以下问题必须各有唯一答案：

- 谁拥有 project、task 和 runtime registries？
- 谁拥有每个 task 的 runtime incarnation 和 generation？
- catalog 和 task sequence 分别由谁分配？
- snapshot 与 event 在何处线性化？
- 谁拥有 scheduler slot、follow-up queue 和 sub-agent tree？
- 谁可以直接导入 pi SDK？
- project trust 如何跨多个 worktree 生效？
- task、session 和 worktree 如何持久化并恢复？
- 谁创建、验证、锁定和删除 worktree？
- 谁计算 `resultRevision`，谁执行 apply/discard journal？
- runtime replacement、task abort、window close 和 app exit 分别由谁触发清理？
- 单个 task 失步或崩溃为何不会污染或冻结其他 task？
- 哪些承诺已被 fake、contract test、E2E 和 packaged smoke 自动验证？

一个资源出现两个竞争 owner、一个模块因多个无关原因变化，或某项安全边界只能靠实现者记忆时，架构仍未达到可实施级。

## 26. 参考资料

### 项目内

- [`../../AGENTS.md`](../../AGENTS.md)
- [`../product-requirements.md`](../product-requirements.md)
- [`../archive/module-structure.md`](../archive/module-structure.md)（已归档）
- [`../architecture-review-guide.md`](../architecture-review-guide.md)
- [`../desktop-framework-options.md`](../desktop-framework-options.md)
- [`../document-conventions.md`](../document-conventions.md)

### 上游 pi（参考 commit `e5d18382a207a4b108d97f7cc97abdc90a23d32d`）

- `../pi/packages/coding-agent/docs/sdk.md`
- `../pi/packages/coding-agent/docs/security.md`
- `../pi/packages/coding-agent/docs/extensions.md`
- `../pi/packages/coding-agent/docs/session-format.md`
- `../pi/packages/coding-agent/examples/sdk/13-session-runtime.ts`

### 外部

- [Electron 进程模型](https://www.electronjs.org/docs/latest/tutorial/process-model)
- [Electron 安全建议](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
