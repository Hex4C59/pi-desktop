# pi-desktop 首版模块设计索引

[English](module-structure.md) | 中文

- 类型：Module Design
- 状态：Archived
- 翻译状态：Machine Draft
- 权威原文：[module-structure.md](module-structure.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 记录日期：2026-09-18
- 归档日期：2026-09-19
- 原适用阶段：首个可用版本
- 被取代：[首版 Electron 系统架构](../architecture/electron-architecture.md)
- 归档索引：[归档文档索引](README.md)
- 评审方法：[软件架构评审指南](../architecture-review-guide.md)
- 权威范围：历史首版模块边界、所有权、约束和测试重点；不作为当前实现依据

> 本文及 [`modules/`](modules/) 下的细化文档均为归档历史材料。其全局唯一 runtime、全局 generation/sequence 和单一 Renderer 投影已被多任务架构取代，不参与实现决策。当前系统 owner 以 [`../architecture/electron-architecture.md`](../architecture/electron-architecture.md) 为准。文档描述的模块尚未实现。

## 高层系统架构图

[![pi-desktop 高层系统架构（提案）](../assets/pi-desktop-architecture.svg)](../assets/pi-desktop-architecture.html)

> 架构图严格表达当前文档中的首版提案；仓库尚无应用源码实现。点击图片可打开支持节点搜索、路径追踪和主题切换的交互式版本。可维护源文件见 [`../assets/pi-desktop-architecture.json`](../assets/pi-desktop-architecture.json)。

## 1. 划分原则

- 每个主要架构模块使用一个独立 `.md` 文件说明；
- 每份模块文档至少明确职责、所有权、禁止事项、依赖和测试重点；
- `RuntimeController` 只拥有 runtime，不承接全部 runtime 相关用例；
- Workspace、Session、Agent command 和 Model 分别由应用服务编排；
- generation 由 `RuntimeController` 拥有，sequence 由 `EventPublisher` 拥有；
- Renderer、Preload、Main 和 pi SDK 之间保持单向依赖；
- Shared contract 是纯 TypeScript，不依赖 Electron、Node.js 或 pi SDK；
- 拆分服务于独立变化原因和资源所有权，不追求机械地“一函数一文件”。

## 2. 模块文档

### Main application

- [`WorkspaceCoordinator`](modules/workspace-coordinator.md)：选择/打开目录、项目信任与 runtime replacement 的用例编排；
- [`SessionCoordinator`](modules/session-coordinator.md)：session 列表、新建、切换、fork 和重命名；
- [`AgentCommandService`](modules/agent-command-service.zh.md)：prompt、steer、follow-up、abort 和 queue 命令；
- [`ModelCoordinator`](modules/model-coordinator.zh.md)：模型列表、选择和 thinking level；
- [`RuntimeQueryService`](modules/runtime-query-service.md)：取得一致性 runtime 读取视图；
- [`RuntimeSnapshotBuilder`](modules/runtime-snapshot-builder.md)：构造 Renderer snapshot。

### Runtime 与 pi 集成

- [`RuntimeController`](modules/runtime-controller.md)：活动 runtime 的唯一 owner 和原子 replacement 边界；
- [`RuntimeStateMachine`](modules/runtime-state-machine.md)：定义并验证 runtime 状态转换；
- [`RuntimeEventSubscription`](modules/runtime-event-subscription.md)：绑定特定 generation 的 SDK 事件源；
- [`EventPublisher`](modules/event-publisher.zh.md)：分配 sequence 并向 Renderer 发布领域事件；
- [`PiRuntimeFactory`](modules/pi-runtime-factory.md)：构造 pi runtime adapter；
- [`PiRuntimeAdapter`](modules/pi-runtime-adapter.md)：将项目 runtime port 映射到 SDK；
- [`PiEventAdapter`](modules/pi-event-adapter.zh.md)：将 SDK event 转成领域事件。

### Main 高权限能力

- [`ApplicationCompositionRoot`](modules/application-composition-root.zh.md)：创建模块实例并连接依赖；
- [`ApplicationLifecycle`](modules/application-lifecycle.zh.md)：协调启动、窗口生命周期和退出清理；
- [`SingleInstancePolicy`](modules/single-instance-policy.md)：保证首版单实例；
- [`MainWindow`](modules/main-window.zh.md)：创建并持有安全主窗口；
- [`NavigationPolicy`](modules/navigation-policy.zh.md)：限制导航、新窗口和外部链接；
- [`WindowStateStore`](modules/window-state-store.md)：持久化窗口几何状态；
- [`IpcRegistration`](modules/ipc-registration.zh.md)：注册固定 IPC handlers；
- [`IpcRouter`](modules/ipc-router.zh.md)：IPC schema 校验和命令分派；
- [`RequestScopeRegistry`](modules/request-scope-registry.md)：管理请求与窗口的取消关系；
- [`DesktopErrorMapper`](modules/desktop-error-mapper.zh.md)：转换并脱敏跨进程错误；
- [`ProjectTrustCoordinator`](modules/project-trust-coordinator.md)：取得项目信任结果；
- [`TrustPromptCoordinator`](modules/trust-prompt-coordinator.md)：管理待响应的信任请求；
- [`Credentials`](modules/credentials.zh.md)：认证状态、API key、OAuth 和 logout；
- [`Attachments`](modules/attachments.zh.md)：图片选择、校验、短生命周期 token 和消费；
- [`Extension UI`](modules/extension-ui.zh.md)：扩展交互请求、响应和取消；
- [`ApplicationPreferencesStore`](modules/application-preferences-store.zh.md)：持久化非敏感应用偏好；
- [`DiagnosticReporter`](modules/diagnostic-reporter.zh.md)：记录脱敏诊断。

### Preload 与 Renderer

- [`Preload Bridge`](modules/preload-bridge.md)：固定桌面 API 和 snapshot/event 初始化缓冲；
- [`Renderer State`](modules/renderer-state.md)：snapshot/event 投影、流式状态和失步恢复；
- [`Renderer Features`](modules/renderer-features.md)：Conversation、Tools、Composer、Sessions、Models 等 UI 功能。

### 跨进程契约

- [`Shared Contracts`](modules/shared-contracts.md)：command/result/event、schema、snapshot 和序列化领域类型。

## 3. 总体依赖方向

```text
Renderer Features
    ↓
Renderer State
    ↓
Preload Bridge
    ↓
IPC Transport
    ↓
Main Application Services
    ↓
Runtime Controller / Capability Services
    ↓
Pi SDK Adapter
    ↓
@earendil-works/pi-coding-agent
```

`src/shared` 是 Main、Preload 和 Renderer 共同依赖的纯 contract，不反向依赖任何进程实现。

## 4. 核心所有权

- 活动 runtime、generation、replacement 临界区：`RuntimeController`；
- event sequence：`EventPublisher`；
- attachment token：`AttachmentService`；
- extension pending request：`ExtensionUiCoordinator`；
- trust pending request：`TrustPromptCoordinator`；
- Renderer 状态投影：`RendererStore`；
- session、认证、settings、resources 和 trust store 的持久化事实：pi SDK。

## 5. 推荐实现目录

```text
src/
├── main/
│   ├── bootstrap/
│   ├── window/
│   ├── ipc/
│   ├── application/
│   ├── runtime/
│   ├── pi/
│   ├── trust/
│   ├── credentials/
│   ├── attachments/
│   ├── extensions/
│   ├── preferences/
│   └── diagnostics/
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
```

具体文件职责、禁止依赖和测试边界以各模块文档为准。

## 6. 关键流程

### 打开工作目录

```text
IpcRouter
  → WorkspaceCoordinator
  → ProjectTrustCoordinator
  → RuntimeController.replace
  → PiRuntimeFactory
  → RuntimeEventSubscription
  → RuntimeSnapshotBuilder / EventPublisher
  → RendererStore
```

### 发送 prompt

```text
IpcRouter
  → AgentCommandService
  → RuntimeController 的受控 session 作用域
  → PiRuntimeAdapter
  → preflight 后尽快返回 PromptAcceptance
  → PiEventAdapter
  → EventPublisher
  → RendererStore
```

### 切换 session

```text
IpcRouter
  → SessionCoordinator
  → RuntimeController.replace
  → teardown 旧 runtime/session
  → 旧 generation 失效
  → 创建和安装新 runtime/session
  → 绑定新订阅并发布完整 snapshot
```

### Renderer 初始化

```text
Preload 先监听并缓存 event
  → RuntimeQueryService 返回 snapshot(generation, sequence)
  → RendererStore 原子应用 snapshot
  → 仅重放更大 sequence
  → 切换实时消费
```

## 7. 自动化边界

脚手架建立后应使用 lint、TypeScript 和测试强制：

1. Renderer 不导入 Electron、Node.js、pi SDK 或 Main；
2. Shared 不导入任何进程实现或高权限依赖；
3. Main 中只有 pi adapter 目录直接导入 pi SDK；
4. IPC 输入必须经过 runtime schema；
5. SDK event adapter 和 Renderer reducer 必须穷尽处理；
6. 普通日志不得记录 prompt、文件内容、环境变量或 credential payload；
7. replacement、窗口关闭和退出路径必须验证资源清理。

## 8. 完成判定

模块设计落地后，以下问题必须各有唯一答案：

- 谁拥有活动 runtime？
- 谁递增 generation？
- 谁分配 sequence？
- 谁可以直接导入 pi SDK？
- 谁编排 workspace、session 和 agent command？
- 谁持有 attachment、trust 和 extension pending request？
- 谁构造 snapshot、谁恢复失步？
- 窗口关闭、session replacement 和退出时，谁触发并执行清理？

如果一个资源出现两个竞争 owner，或一个模块因多个不相关原因频繁变化，应继续调整相应模块文档。
