# pi-desktop 首版 Electron 架构（单活动 runtime 提案）

[English](electron-architecture.md) | 中文

- 类型：Architecture
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[electron-architecture.md](electron-architecture.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 创建日期：2026-09-17
- 取代日期：2026-09-18
- 原适用阶段：首个可用版本
- 原权威范围：单活动工作目录、单活动 runtime 下的 Electron 首版架构提案
- 被取代：[`../architecture/electron-architecture.md`](../architecture/electron-architecture.md)
- 归档索引：[`README.zh.md`](README.zh.md)
- 相关调研：[桌面框架与 TypeScript 构建方案调研](../desktop-framework-options.zh.md)
- 评审方法：[软件架构评审指南](../architecture-review-guide.md)
- 原模块细化：[首版模块结构](module-structure.zh.md)（已归档）

> 本文是已失效的完整历史提案，不参与当前实现决策。当前架构请阅读 [`../architecture/electron-architecture.md`](../architecture/electron-architecture.md)。下文“当前建议”“待决定”和模块职责均仅代表当时的单 runtime 提案。

## 1. 架构目标

首版重点解决以下问题：

1. 直接复用 `@earendil-works/pi-coding-agent` SDK，不复制 pi 的 agent loop、provider、工具、compaction 或 session 管理逻辑；
2. 将高权限 pi runtime 与 renderer 隔离，renderer 不直接获得 Node.js、shell、任意文件访问或 provider 凭据；
3. 正确处理流式消息、工具调用、队列、中止、重试、压缩和 session replacement；
4. 兼容用户已有的 `~/.pi/agent` 配置、认证、资源和 session；
5. 建立可测试、可审计、可序列化的类型化 IPC；
6. 保留未来将 pi runtime 移至独立进程的可能，但不为尚未确定的需求提前实现两套 runtime；
7. 建立可重复的 Linux 开发、测试和打包流程。

## 2. 总体架构

```text
┌──────────────────────────────────────────────────────┐
│ Electron renderer                                    │
│                                                      │
│ React UI                                             │
│ ├── Conversation UI                                  │
│ ├── Tool activity UI                                 │
│ ├── Composer                                         │
│ ├── Session/project navigation                       │
│ └── Renderer domain store                            │
│                                                      │
│ 无 Node.js、shell、任意文件访问或 provider 凭据       │
└────────────────────────┬─────────────────────────────┘
                         │
                         │ preload 暴露的类型化窄接口
                         │ command / result / event
                         ▼
┌──────────────────────────────────────────────────────┐
│ Electron main process / Desktop host                 │
│                                                      │
│ ├── IPC Router                                       │
│ ├── Runtime Controller                               │
│ ├── Pi Adapter                                       │
│ ├── Project Trust Coordinator                        │
│ ├── Credential Coordinator                           │
│ ├── Attachment Service                               │
│ ├── Window / Navigation Policy                       │
│ └── Application lifecycle                            │
└────────────────────────┬─────────────────────────────┘
                         │
                         │ 官方 Node.js SDK
                         ▼
┌──────────────────────────────────────────────────────┐
│ @earendil-works/pi-coding-agent                      │
│                                                      │
│ ├── AgentSessionRuntime                              │
│ ├── AgentSession                                     │
│ ├── ModelRuntime                                     │
│ ├── SessionManager                                   │
│ ├── SettingsManager                                  │
│ ├── ResourceLoader                                   │
│ └── Extensions / tools / skills / prompts            │
└──────────────────────────────────────────────────────┘
```

## 3. 进程和模块边界

### 3.1 Renderer

renderer 只负责：

- React 视图；
- 用户输入；
- 消息、思考内容和工具活动展示；
- 短生命周期 UI 状态；
- 调用 preload 暴露的命令；
- 消费宿主发送的领域事件。

renderer 不得：

- 导入 pi SDK；
- 导入 Electron 的 `ipcRenderer`；
- 使用 Node.js API；
- 执行 shell；
- 任意读取或写入文件；
- 读取 `~/.pi/agent/auth.json`；
- 保存 API key 或 OAuth token；
- 持有 `AgentSession`、`ModelRuntime` 等 SDK 实例；
- 将完整 prompt、文件内容或凭据写入浏览器存储。

默认不使用 `localStorage` 保存应用数据。需要持久化的非敏感 UI 偏好通过宿主 API 写入 Electron `userData`。

### 3.2 Preload

preload 是 renderer 与 main process 之间唯一的桥梁，负责：

- 使用 `contextBridge.exposeInMainWorld()` 暴露窄接口；
- 调用明确命名的 IPC channel；
- 订阅明确命名的领域事件；
- 为 renderer 提供 TypeScript 类型；
- 在取消订阅时移除对应 listener。

preload 不得暴露：

- 原始 `ipcRenderer`；
- 任意 channel 名称；
- `send(channel, payload)` 一类通用接口；
- `invoke(channel, payload)` 一类通用接口；
- Node.js `process`、`fs` 或 `child_process`；
- Electron 的完整 API。

建议按用例组织 renderer API：

```typescript
interface PiDesktopApi {
  workspace: {
    choose(): Promise<CommandResult<WorkspaceSnapshot | null>>;
    open(input: OpenWorkspaceInput): Promise<CommandResult<WorkspaceSnapshot>>;
  };

  session: {
    list(): Promise<CommandResult<SessionSummary[]>>;
    create(): Promise<CommandResult<SessionSnapshot>>;
    switch(input: SwitchSessionInput): Promise<CommandResult<SessionSnapshot>>;
    fork(input: ForkSessionInput): Promise<CommandResult<SessionSnapshot>>;
  };

  agent: {
    prompt(input: PromptInput): Promise<CommandResult<PromptAcceptance>>;
    steer(input: QueueMessageInput): Promise<CommandResult<void>>;
    followUp(input: QueueMessageInput): Promise<CommandResult<void>>;
    abort(): Promise<CommandResult<void>>;
  };

  runtime: {
    getSnapshot(): Promise<CommandResult<RuntimeSnapshot>>;
    subscribe(listener: (event: DesktopEventEnvelope) => void): () => void;
  };
}
```

以上接口仅说明边界，最终名称以实现时确定的领域模型为准。

### 3.3 Electron main process

main process 是唯一的高权限应用层，负责：

- 窗口和应用生命周期；
- pi runtime 生命周期；
- IPC 输入校验；
- 工作目录选择；
- 项目信任；
- 凭据操作；
- 图片附件读取；
- 外部链接和导航策略；
- session replacement；
- 应用退出清理；
- 错误脱敏和诊断。

## 4. Main process 核心模块

### 4.1 `RuntimeController`

`RuntimeController` 是活动 runtime 的唯一 owner，负责：

- 创建 `AgentSessionRuntime`；
- 保存当前 runtime generation；
- 绑定当前 `AgentSession` 的订阅；
- 新建、恢复、切换和 fork session；
- 切换工作目录；
- 串行化会改变 runtime 的操作；
- 中止当前任务；
- 清理旧订阅；
- 应用退出时 dispose。

其他模块不应长期保存 `AgentSession` 引用。`runtime.newSession()`、`runtime.switchSession()` 和 `runtime.fork()` 会替换 `runtime.session`；保留旧引用可能造成：

- 继续接收旧 session 的事件；
- 将 prompt 发送给失效 session；
- 泄漏 extension listener；
- 产生跨 session 的工具事件。

#### Runtime generation

每次创建或替换 runtime 时递增 `runtimeGeneration`。所有发送给 renderer 的事件都携带 generation，renderer 丢弃不匹配当前 generation 的事件。

```text
Session A 正在发送 tool update
    ↓
用户切换到 Session B
    ↓
Session A 的异步事件晚到
    ↓
runtimeGeneration 不匹配
    ↓
Renderer 丢弃旧事件
```

#### Replacement 失败

上游 `AgentSessionRuntime` 在创建新 runtime 前会 teardown 旧 session。如果新 runtime 创建失败，旧 session 不能被当作仍然可用。

UI 应进入明确的 `error` 或 `crashed` 状态，并提供：

- 重试创建；
- 重新选择工作目录；
- 打开其他 session；
- 查看脱敏诊断。

不得静默显示旧对话并暗示旧 session 仍可继续运行。

### 4.2 `PiAdapter`

`PiAdapter` 隔离 pi SDK 与应用领域模型：

```text
AgentSessionEvent
    ↓ PiAdapter
DesktopEvent
```

adapter 不把以下内容直接传入 renderer：

- SDK class 实例；
- `AgentSession` 或 `ModelRuntime`；
- 原始 `Error`；
- 含凭据的对象；
- 函数或自定义 prototype；
- 无法通过 structured clone 的值。

#### 流式消息规则

1. 使用 `contentIndex` 关联 text/thinking 内容块；
2. 使用 tool call ID 关联工具调用；
3. `message_update` 只作为增量；
4. `message_end.message` 是完成消息的权威值；
5. `tool_execution_update.partialResult` 是当前累计结果，可替换工具显示；
6. session replacement 后重新绑定订阅；
7. 旧 generation 事件不再传播。

建议的领域事件包括：

```text
runtime.snapshot
runtime.statusChanged
message.started
message.delta
message.completed
tool.started
tool.updated
tool.completed
queue.changed
compaction.started
compaction.completed
retry.started
retry.completed
extensionUi.requested
diagnostic.reported
```

领域事件不要求与 SDK 事件一一对应，应服务于桌面 UI，同时保留 pi 的关键语义。

### 4.3 `IpcRouter`

`IpcRouter` 负责：

- 注册固定 allowlist channel；
- 将 renderer 输入按 `unknown` 接收并使用 schema 收窄；
- 调用 application service；
- 统一转换错误；
- 在窗口销毁时取消关联请求；
- 防止重复注册 handler。

不得提供以下通用接口：

```typescript
execute(command: string)
readFile(path: string)
invoke(channel: string, data: unknown)
callHost(method: string, args: unknown[])
```

这些接口会把宿主权限重新暴露给 renderer。

### 4.4 `ProjectTrustCoordinator`

桌面应用必须实现 pi 的项目信任流程，但不能将信任描述成沙箱。

```text
用户选择工作目录
    ↓
规范化真实路径
    ↓
检查是否存在需要信任的项目资源
    ↓
检查 pi trust store 中已有决定
    ↓
如需要，向 renderer 发起信任对话框
    ↓
用户选择信任、不信任或仅本次
    ↓
再加载对应项目资源并创建 runtime
```

实施要求：

- 使用 pi 导出的公共 API 和 trust store 语义；
- 不自行解析或改写 `trust.json`；
- 不直接导入 `../pi` 中未公开的内部源文件；
- 不默认将所有项目设为可信；
- 不在用户作出决定前加载项目 extension。

实施前需要验证当前公开 SDK 是否能够完整复现 CLI 的 project trust 行为，特别是 user/global extension 对 `project_trust` 事件的参与方式。如果公共 API 不足，应优先推动受支持的集成方式，而不是依赖上游内部文件路径。

### 4.5 `CredentialCoordinator`

凭据只留在 main process 和 pi 的 credential store 中。

renderer 可以：

- 查询 provider 是否已认证；
- 发起 OAuth 登录；
- 提交新的 API key；
- 请求 logout。

renderer 不可以：

- 获取已保存 API key；
- 获取 OAuth access/refresh token；
- 读取 `auth.json`；
- 在前端持久化 key；
- 在错误或日志中显示完整 key。

API key 提交流程：

```text
用户输入 key
    ↓
一次性 IPC command
    ↓
main process 调用 ModelRuntime
    ↓
返回成功或脱敏错误
    ↓
renderer 立即清空输入状态
```

需要正确处理 `CredentialSynchronizationError`，避免在凭据已经写入、但后续本地同步失败时盲目重复提交。

### 4.6 `AttachmentService`

为了发送图片，renderer 不获得通用文件读取能力。

```text
Renderer 请求选择图片
    ↓
Main 打开系统文件选择器
    ↓
Main 校验类型和大小
    ↓
Main 生成短生命周期 attachment token
    ↓
Renderer 只持有 metadata 和 token
    ↓
发送 prompt 时引用 token
    ↓
Main 读取并转换图片后消费或过期 token
```

实现需要限定：

- 支持的 MIME type；
- 文件大小上限；
- token 生命周期；
- session 或窗口归属；
- 取消、窗口关闭和发送完成后的清理。

### 4.7 `WindowPolicy`

Electron 窗口采用以下安全配置：

- `nodeIntegration: false`；
- `contextIsolation: true`；
- `sandbox: true`；
- `webSecurity: true`；
- 禁止任意窗口创建；
- 禁止页面内跳转到远程地址；
- 外部链接经过协议校验后使用系统浏览器打开；
- 不加载远程应用代码；
- 生产环境设置严格 CSP；
- 开发环境只允许预期的 Vite dev server。

仅允许明确批准的外部协议，例如 `https:`。拒绝 `javascript:`、任意 `file:` 外部导航和模型输出构造的危险 URL。

## 5. IPC 协议

IPC 分为 command、result 和 event 三类，全部使用 `src/shared` 中定义的可序列化领域类型和 runtime schema。

### 5.1 Command

建议的命令集合：

```text
workspace.choose
workspace.open

session.list
session.create
session.switch
session.fork
session.rename

agent.prompt
agent.steer
agent.followUp
agent.abort
agent.clearQueue

model.list
model.select
model.setThinkingLevel

auth.getStatus
auth.submitApiKey
auth.login
auth.logout

runtime.getSnapshot
```

### 5.2 Result

所有 command 返回统一领域结果：

```typescript
type CommandResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: DesktopError;
    };

interface DesktopError {
  code: string;
  message: string;
  recoverable: boolean;
  retryAfterMs?: number;
  diagnosticId?: string;
}
```

IPC 不传递：

- 原始 `Error`；
- stack trace；
- prompt 内容；
- 环境变量；
- API key；
- 用户目录中的敏感完整路径。

底层 cause 只进入 main process 的脱敏诊断，通过 `diagnosticId` 关联。

### 5.3 Event

main 向 renderer 推送事件，每个事件携带：

```typescript
interface DesktopEventEnvelope {
  runtimeGeneration: number;
  sequence: number;
  event: DesktopEvent;
}
```

- `runtimeGeneration` 防止旧 session 事件污染新 session；
- `sequence` 用于检测丢失或乱序；
- `event` 是项目自己的领域可辨识联合。

### 5.4 Snapshot 与事件竞态

renderer 初始化或重新加载时按以下流程同步状态：

```text
1. Renderer 安装事件监听器
2. Preload 暂时缓存事件
3. Renderer 请求 runtime snapshot
4. Snapshot 返回当前 generation 和 sequence
5. Renderer 应用 snapshot
6. 仅重放 sequence 大于 snapshot sequence 的缓存事件
7. 切换到实时消费
```

发现 sequence 缺口时重新请求 snapshot，不猜测缺失状态。

## 6. Prompt 异步处理

`session.prompt()` 会在完整运行结束后才 resolve，不应让 Electron IPC invoke 一直等待模型和工具结束。

建议使用 pi 的 `preflightResult`：

```text
Renderer 调用 agent.prompt
    ↓
Main 校验输入
    ↓
调用 session.prompt(..., { preflightResult })
    ↓
preflight 接受或拒绝后尽快返回 PromptAcceptance
    ↓
完整运行继续在后台进行
    ↓
所有进度通过 DesktopEvent 推送
    ↓
后台 Promise 使用显式 catch 处理后续失败
```

这样可以保证：

- renderer 很快得到“已接受”或“预检失败”；
- 长任务不长期占用一个 IPC 调用；
- 模型调用开始后的失败通过事件报告；
- 不产生 unhandled promise rejection。

## 7. Renderer 状态模型

### 7.1 权威状态

来自 main snapshot 或完成事件：

- 当前工作目录；
- 当前 session；
- 已完成消息；
- 模型；
- thinking level；
- 队列；
- token 和费用；
- runtime 状态；
- diagnostics。

### 7.2 临时流式状态

只在生成期间存在：

- 当前 text block 增量；
- thinking block 增量；
- tool call arguments 增量；
- tool execution partial result；
- aborting 状态；
- retry countdown；
- compaction 状态。

`message_end.message` 到达时，使用完整消息原子替换临时状态。

建议使用小型外部 store 配合 React `useSyncExternalStore`，避免将高频 delta 放入大范围 React Context。首版不预先确定 Redux 或 Zustand，等实际状态复杂度出现后再评估。

## 8. Session replacement 生命周期

```text
用户请求切换 session
    ↓
RuntimeController 锁定 replacement 操作
    ↓
当前 runtime 状态变为 switching
    ↓
SDK 中止当前操作并完成 teardown
    ↓
旧 generation 失效
    ↓
创建并应用新 runtime/session
    ↓
重新 bind extensions
    ↓
重新订阅 session events
    ↓
发布完整 snapshot
    ↓
状态变为 ready
```

切换期间：

- 禁止新的 prompt；
- 可以允许用户取消尚未开始的切换；
- UI 保留旧内容，但显示不可交互状态；
- 旧 runtime 的晚到事件由 generation 过滤。

`newSession()`、`switchSession()`、`fork()` 和 import 使用同一套 replacement 状态机。

## 9. Extension UI

pi extension 可能发起以下交互：

- `select`；
- `confirm`；
- `input`；
- `editor`；
- `notify`。

建议由 main process 中的 `ExtensionUiCoordinator` 转换成领域请求：

```text
pi extension UI request
    ↓
ExtensionUiCoordinator
    ↓
extensionUi.requested event
    ↓
Renderer modal / notification
    ↓
extensionUi.respond command
    ↓
Main resolve 对应 Promise
```

每个交互必须包含：

- request ID；
- 所属 runtime generation；
- 可选 timeout；
- 窗口关闭时的取消；
- session replacement 时的取消；
- 应用退出时的取消。

extension 提供的标题、选项和文本均按不可信内容处理，不允许作为 HTML 执行。

首版是否完整支持这些交互，见“待确认架构决策”中的决策 5。

## 10. 持久化策略

### 10.1 由 pi 管理

以下内容继续由 pi 官方 SDK 管理：

- `~/.pi/agent/auth.json`；
- `~/.pi/agent/settings.json`；
- `~/.pi/agent/models.json`；
- `~/.pi/agent/models-store.json`；
- session JSONL；
- trust store；
- extensions、skills、prompts 和 themes。

桌面应用不直接解析或改写 session JSONL。

### 10.2 由 Electron `userData` 管理

桌面应用只保存自己的非敏感状态：

- 窗口尺寸和位置；
- 面板宽度；
- 工具详情展开状态；
- UI 主题偏好；
- 最近打开的工作目录引用；
- 非敏感应用级设置。

不在 Electron `userData` 中复制：

- API key；
- OAuth token；
- session 消息；
- 完整 prompt；
- 文件内容。

## 11. 推荐目录结构

```text
src/
├── main/
│   ├── bootstrap/
│   │   ├── app-lifecycle.ts
│   │   └── single-instance.ts
│   ├── window/
│   │   ├── create-main-window.ts
│   │   ├── navigation-policy.ts
│   │   └── window-state.ts
│   ├── ipc/
│   │   ├── register-ipc.ts
│   │   ├── ipc-router.ts
│   │   └── error-mapper.ts
│   ├── runtime/
│   │   ├── runtime-controller.ts
│   │   ├── pi-adapter.ts
│   │   ├── event-publisher.ts
│   │   └── runtime-state.ts
│   ├── trust/
│   │   └── project-trust-coordinator.ts
│   ├── credentials/
│   │   └── credential-coordinator.ts
│   ├── attachments/
│   │   └── attachment-service.ts
│   └── main.ts
│
├── preload/
│   ├── preload.ts
│   └── desktop-api.ts
│
├── renderer/
│   ├── app/
│   ├── features/
│   │   ├── conversation/
│   │   ├── composer/
│   │   ├── tools/
│   │   ├── sessions/
│   │   ├── models/
│   │   ├── trust/
│   │   └── settings/
│   ├── store/
│   ├── components/
│   └── main.tsx
│
├── shared/
│   ├── commands.ts
│   ├── events.ts
│   ├── errors.ts
│   ├── schemas.ts
│   └── desktop-api.ts
│
└── tests/
    ├── fixtures/
    ├── fakes/
    └── helpers/
```

`src/shared` 必须保持为纯 TypeScript：

- 不依赖 Electron；
- 不依赖 Node.js；
- 不依赖 pi SDK；
- 只包含可序列化领域类型和 schema。

## 12. 构建方案

建议工具链：

- npm；
- Electron；
- Electron Forge；
- `@electron-forge/plugin-vite`；
- React；
- Vite；
- TypeScript strict mode；
- Vitest；
- Testing Library；
- Playwright。

构建入口分为：

```text
vite.main.config.ts
vite.preload.config.ts
vite.renderer.config.ts
```

### 12.1 依赖规则

- 所有直接依赖固定精确版本；
- 提交 `package-lock.json`；
- 安装时优先使用 `npm install --ignore-scripts`；
- 对确实需要生命周期脚本的依赖单独审查；
- pi SDK 固定明确版本；
- 升级 pi SDK 时检查 changelog 和实际导出类型；
- 正式构建不得引用 `../pi`。

### 12.2 Electron 内置 Node.js 版本

当前参考的 pi SDK `0.85.1` 要求 Node.js `>= 22.19.0`。

选择 Electron 版本时必须确认 Electron 内置 Node.js 满足要求。开发机的 `node --version` 不能代表打包应用中的 Node.js 版本。

CI 应增加打包 smoke test：

```text
启动打包后的 Electron 应用
    ↓
检查 process.versions.node
    ↓
导入 pi SDK
    ↓
创建不调用真实模型的最小 runtime
    ↓
正常 dispose
```

### 12.3 pi SDK 资源打包

脚手架阶段需要验证：

- ESM 加载；
- ASAR 内运行；
- pi SDK 附带 assets；
- WASM 文件；
- native dependency；
- `@silvia-odwyer/photon-node`；
- extension 和动态资源加载；
- production 路径解析。

如果某些资源不能在 ASAR 内运行，只对必要目录配置 unpack，不直接关闭整个 ASAR。

## 13. 测试架构

### 13.1 Adapter 测试

至少覆盖：

- `text_start/delta/end`；
- `thinking_start/delta/end`；
- 多个 `contentIndex`；
- tool call start/delta/end；
- tool execution start/update/end；
- queue update；
- abort；
- retry；
- compaction；
- `message_end` 权威替换；
- session replacement；
- 旧 generation 事件丢弃；
- dispose 后不再发布事件。

### 13.2 IPC 测试

至少覆盖：

- 畸形输入；
- 未知 command；
- 非法路径；
- 非法模型 ID；
- 重复请求；
- 冲突的 session replacement；
- prompt preflight 拒绝；
- 超时；
- renderer/window 被销毁；
- 错误脱敏；
- 凭据不进入响应和日志。

### 13.3 UI 测试

至少覆盖：

- loading；
- empty；
- streaming；
- queued；
- aborting；
- error；
- offline；
- crashed；
- 键盘导航；
- 焦点管理；
- 窄窗口；
- 长命令、长路径和无换行输出；
- extension UI modal。

### 13.4 E2E 和打包测试

测试使用 fake provider 或 mock runtime，不调用真实付费模型。覆盖：

- 启动应用；
- 选择工作目录；
- 项目信任；
- 创建 session；
- 流式回复；
- 工具调用；
- 中止；
- 切换 session；
- 关闭窗口；
- runtime 清理；
- 安装包启动；
- 无 API key 时的错误提示。

## 14. 首版明确不做

- Windows 和 macOS；
- 远程 agent 服务；
- 自定义 session JSONL 格式；
- renderer 直接访问 Node.js；
- 通用 shell IPC；
- 将项目信任描述为沙箱；
- 自行实现 provider 或 agent loop；
- 依赖 experimental `pi-client`、`pi-protocol` 或 `pi-server`；
- 真实付费模型自动化测试。

多窗口、独立 runtime 进程、自动更新和首版发布格式仍受下文待确认决策影响。

## 15. 建议实施阶段

### 阶段 1：脚手架和安全壳

- Electron + React + Vite + TypeScript；
- main/preload/renderer/shared 分层；
- 安全 `BrowserWindow` 配置；
- CSP 和导航限制；
- IPC schema 与错误模型；
- 空状态页面。

### 阶段 2：pi runtime 最小闭环

- 固定 pi SDK 版本；
- 创建 `AgentSessionRuntime`；
- fake provider；
- prompt；
- text streaming；
- abort；
- runtime dispose。

### 阶段 3：工具和会话

- tool lifecycle；
- queue；
- new/switch/fork session；
- runtime generation；
- session replacement 测试。

### 阶段 4：项目和认证

- 目录选择；
- project trust；
- provider/model；
- API key 与 OAuth；
- settings 和 diagnostics。

### 阶段 5：完整 UI 与打包

- Markdown、代码、diff 和命令输出；
- extension UI；
- token 和费用；
- Linux 安装包；
- 打包 smoke test。

## 16. 待确认架构决策

以下五项尚未因 Electron 框架选择而自动确定。每项均记录“接受”和“不接受”的含义、优缺点及当前建议，最终决定应在审查后更新到本节。

### 决策 1：是否接受首版 pi SDK 与 Electron main 同进程

**当前状态：待决定。**

#### 接受的含义

pi SDK、`AgentSessionRuntime`、工具和 pi extensions 直接运行在 Electron main process 中：

```text
Renderer
    ↓ Electron IPC
Electron main
    ├── 窗口和系统能力
    └── pi SDK / tools / extensions
```

#### 接受的优点

- 直接使用 pi SDK，无需额外进程协议；
- SDK 类型可以在 main 和 adapter 内直接使用；
- 流式事件直接订阅和转换；
- 不需要处理 JSONL framing、请求 ID、stdout/stderr 和子进程重启；
- 应用退出时只需 abort、dispose runtime 和关闭 Electron；
- 实现和调试链路较短；
- 能最快验证 prompt、工具、session、信任和 extension 的完整闭环。

#### 接受的缺点

- pi runtime 或 extension 的未捕获异常可能导致 Electron main process 退出；
- extension 的同步死循环可能阻塞 main event loop，使 IPC、菜单和窗口管理失去响应；
- 原生模块崩溃、内存耗尽或 `process.exit()` 可能带走整个应用；
- runtime 进入不可恢复状态时，用户通常需要重启整个桌面应用；
- 无法在 main 已崩溃时由应用自身展示 runtime crash 恢复界面；
- pi runtime 的同步负载可能影响桌面宿主响应时间。

#### 不接受的含义

将 pi runtime 放入 Electron utility process 或 Node.js child process，main process 仅作为 supervisor 和 IPC gateway：

```text
Renderer
    ↓ Electron IPC
Electron main
    ↓ 进程间协议
Runtime process
    └── pi SDK / tools / extensions
```

也可以启动随应用分发的 `pi --mode rpc`，通过严格 JSONL 协议集成。

#### 不接受的优点

- runtime 或 extension 崩溃时，Electron main 和窗口可以继续存在；
- 可以显示 `runtime crashed`，保留输入草稿和最后已知状态；
- 可以单独重启 runtime；
- 同步死循环和 event loop 阻塞被限制在 runtime 进程；
- main process 的窗口、菜单和基础 IPC 不直接受 pi runtime 阻塞影响；
- 更适合大量使用第三方扩展或强调故障恢复的产品。

#### 不接受的缺点

- 必须定义并维护跨进程协议和 runtime schema；
- SDK 对象和类型不能直接跨进程，需要转换为可序列化领域数据；
- 必须处理请求 ID、超时、pending request、乱序、背压和取消；
- 必须处理进程启动、异常退出、优雅关闭、强制终止和孤儿进程；
- 使用 RPC 时必须严格按 `\n` 分帧，不能使用会按 Unicode 行分隔符切分的通用 line reader；
- extension UI 需要额外 request/response 协议；
- 打包时需要随应用分发 runtime，而不能依赖用户全局安装 pi；
- 实现、调试和自动化测试成本显著增加。

#### 安全说明

独立进程主要提供**故障隔离**，不是系统权限沙箱。runtime process 默认仍以当前用户权限运行，仍可读取文件、修改项目、执行 shell 和访问网络。真正的安全隔离需要容器、VM、micro-VM 或操作系统 sandbox。

#### 当前建议

首版建议**接受同进程**，但通过 `RuntimeController` 和 `PiAdapter` 隔离 SDK，使 renderer 和 IPC contract 不依赖 SDK 类型。未来可以将 adapter 后端替换为 utility process 或 RPC 实现，而无需重写 renderer。

不建议首版同时实现 SDK 和 RPC 两套 backend。

### 决策 2：是否接受首版单窗口、单活动工作目录/runtime

**当前状态：待决定。**

#### 接受的含义

首版只维护：

- 一个主窗口；
- 一个活动工作目录；
- 一个活动 `AgentSessionRuntime`；
- 一个 runtime 内可创建、恢复、切换和 fork session。

切换项目或 session 通过受控 replacement 完成，不同时维护多个活动 runtime。

#### 接受的优点

- runtime 所有权和生命周期清晰；
- 不容易出现事件串线或 prompt 发往错误项目；
- 凭据、cwd、session 和 extension 上下文关系简单；
- session replacement、abort 和退出清理容易测试；
- renderer 只维护一个活动 conversation 状态；
- 内存和 provider 并发更容易控制；
- 更快完成首个可用版本。

#### 接受的缺点

- 用户不能并排查看两个项目或 session；
- 切换项目时必须替换 runtime，可能需要等待 abort 和资源重建；
- 长任务运行时无法在另一个窗口继续独立工作；
- 未来加入多窗口时，需要扩展 window、runtime 和 event routing 的所有权模型；
- 用户可能把单窗口体验视为对开发工具效率的限制。

#### 不接受的含义

首版即支持多窗口或多个并行活动 workspace/runtime。每个窗口至少需要明确绑定自己的 runtime ID 和工作目录。

#### 不接受的优点

- 可以同时处理多个项目或 session；
- 长任务运行时可以在其他窗口继续工作；
- 更接近成熟 IDE 和开发工具的多任务体验；
- 从首版开始验证多 runtime 隔离，避免后期调整全局单例设计。

#### 不接受的缺点

- 必须将所有命令和事件关联到 window ID、runtime ID 和 generation；
- 凭据、project trust、session 和 extension UI 需要按窗口或 runtime 路由；
- 应用退出、单窗口关闭和 runtime 清理的组合显著增加；
- 多个 agent 可能并发修改同一项目，需要冲突提示或限制；
- provider 请求、token 成本和系统资源并发更难控制；
- UI 状态、E2E 和崩溃恢复测试矩阵大幅增加；
- 如果 pi SDK 与 main 同进程，多 runtime 仍共享同一个 main 故障域。

#### 当前建议

首版建议**接受单窗口、单活动工作目录/runtime**。代码中避免让 renderer 组件直接引用全局 SDK 对象，但不为首版提前实现多 runtime registry。确认真实用户需求后再设计一窗口一 runtime 或多 workspace 模型。

### 决策 3：是否接受 npm + Electron Forge/Vite 作为脚手架与打包基线

**当前状态：待决定。**

#### 接受的含义

使用：

- npm 和 `package-lock.json` 管理依赖；
- Electron Forge 管理开发启动、打包和 makers；
- `@electron-forge/plugin-vite` 分别构建 main、preload 和 renderer；
- Vite 构建 React renderer；
- TypeScript strict mode 覆盖所有应用代码。

#### 接受的优点

- 当前机器已具备 npm，不需要额外安装包管理器；
- `package-lock.json` 和 `npm ci` 适合可重复 CI 安装；
- Electron Forge 提供官方 Vite + TypeScript 模板；
- main、preload、renderer 可以使用相近的 Vite 配置；
- Forge 提供 Electron 打包、makers 和 fuses 集成；
- React renderer 可以获得成熟的 Vite HMR；
- 项目脚本可以统一放入 `package.json`，本地和 CI 使用同一入口；
- 相比手工拼接 Electron Packager、Vite 和安装包工具，首版配置较集中。

#### 接受的缺点

- Electron Forge 的 Vite 插件当前仍被官方标记为 experimental；
- Forge/Vite 升级可能在 minor release 中包含迁移工作，需要固定版本并阅读 release notes；
- main/preload 的 Node/ESM external 配置可能比 renderer 更复杂；
- pi SDK 的 ESM、assets、WASM、native dependency 和 ASAR 行为需要实际打包验证；
- Forge 的抽象在复杂发布需求下可能需要自定义 hook 或 maker；
- npm workspace 和大型 monorepo 的体验未必是所有包管理器中最快的。

#### 不接受的含义

需要重新选择至少一个基础部分，例如：

- pnpm 或 Yarn 代替 npm；
- electron-vite 代替 Electron Forge Vite plugin；
- Electron Builder 代替 Electron Forge；
- 自定义 Vite/esbuild + Electron Packager + Linux 打包脚本。

“不接受”不是一个单一方案，必须进一步确定替代组合。

#### 不接受的优点

- 可以选择稳定性或特定能力更匹配的工具；
- `electron-vite` 对 main/preload/renderer 的开发体验更专门；
- Electron Builder 在部分安装包、发布和自动更新场景中生态成熟；
- pnpm 可以降低磁盘占用，并提供严格依赖解析；
- 自定义构建可以精确控制 external、ASAR 和资源复制。

#### 不接受的缺点

- 需要再次调研并确定替代组合，延迟脚手架建立；
- 可能引入更多工具之间的配置拼接；
- 自定义程度越高，项目自行维护的构建代码越多；
- 不一定能消除实验性或升级风险，只是把风险转移到其他工具；
- 当前项目规模较小，过早采用复杂 monorepo 工具的收益有限；
- 如果改用 pnpm/Yarn，需要同步环境、CI、README 和贡献说明。

#### 当前建议

首版建议**接受 npm + Electron Forge/Vite**，但必须：

- 固定所有直接依赖的精确版本；
- 提交 lockfile；
- 将 Forge Vite plugin 的 experimental 状态记录为已知风险；
- 在正式编写大量业务代码前完成 pi SDK 打包 spike；
- 验证 ESM、ASAR、WASM、native dependency 和 Linux 安装包启动；
- 如果 spike 暴露不可接受问题，当前开发初期允许破坏性更换构建工具。

### 决策 4：是否接受先交付 RPM/deb，再扩展 AppImage/Flatpak

**当前状态：待决定。**

#### 接受的含义

首阶段以以下产物为发布基线：

- RPM：优先覆盖当前 Fedora 开发和验证环境；
- deb：覆盖常见 Debian/Ubuntu 环境。

AppImage 和 Flatpak 在核心运行闭环、打包 smoke test 和基础安装流程稳定后加入。

#### 接受的优点

- 缩小首版发布矩阵；
- RPM 与当前 Fedora 环境直接匹配，便于本地安装验证；
- deb 和 RPM 都有清晰的系统依赖、桌面文件和卸载语义；
- 可以先解决 pi SDK、Electron sandbox、系统库和应用数据路径问题；
- CI、发布和故障排查复杂度较低；
- 避免首版同时处理 AppImage 运行环境和 Flatpak 权限模型。

#### 接受的缺点

- 首版不能通过一个便携文件覆盖更多 Linux 发行版；
- Arch、openSUSE 等非 deb/RPM 目标用户需要自行处理或等待；
- deb/RPM 需要分别维护打包元数据和验证环境；
- 用户可能更偏好无需安装的 AppImage；
- 后续引入 Flatpak 时，pi 的文件、shell、项目目录和凭据访问会遇到新的权限设计问题。

#### 不接受的含义

首版同时交付 RPM、deb、AppImage，甚至 Flatpak；或者选择 AppImage/Flatpak 作为首发格式，降低 deb/RPM 优先级。

#### 不接受的优点

- AppImage 可以提供无需安装的便携体验；
- 同时提供更多格式可以覆盖更广泛的 Linux 用户；
- Flatpak 提供标准化分发渠道和显式权限体系；
- 早期验证不同分发模型，可以更早发现路径、sandbox 和桌面集成问题；
- 减少后续新增格式时出现重大架构调整的可能。

#### 不接受的缺点

- 发布、CI 和测试矩阵显著扩大；
- AppImage 需要验证 glibc、FUSE、sandbox 和不同发行版兼容性；
- Flatpak 的 sandbox 与 pi 需要访问任意项目目录、shell、工具链和用户配置之间存在结构性冲突；
- Flatpak portal、文件权限、host toolchain 和 `~/.pi/agent` 访问需要专门设计；
- 自动化安装和启动 smoke test 成本增加；
- 容易在核心 agent 功能稳定前把时间投入打包边缘问题。

#### 当前建议

首版建议**接受先交付 RPM/deb，再扩展 AppImage/Flatpak**。

其中 RPM 作为当前 Fedora 环境的第一验证目标，deb 作为第二个安装包目标。AppImage 在核心功能和 CI 构建稳定后加入。Flatpak 应单独进行架构评估，因为它不只是另一种压缩格式，而会改变文件、shell、工具链和凭据访问边界。

### 决策 5：是否需要首版完整支持 pi extension UI 的 `select`、`confirm`、`input`、`editor`

**当前状态：待决定。**

`notify` 是非阻塞展示，复杂度较低；本决策重点针对会阻塞 extension 流程并等待用户答复的 `select`、`confirm`、`input` 和 `editor`。

#### 接受的含义

首版实现完整的 extension UI request/response 桥接：

```text
pi extension 调用 ctx.ui.*
    ↓
Main ExtensionUiCoordinator
    ↓
Renderer modal
    ↓
用户响应或取消
    ↓
Main resolve extension Promise
```

#### 接受的优点

- 更完整兼容现有 pi extensions；
- 需要确认、选择或输入的扩展可以正常完成工作流；
- 不会出现 extension 无限等待、静默降级或功能不可用；
- 权限相关确认和危险操作提示可以在桌面 UI 中明确展示；
- 能在首版验证 request ID、timeout、取消和 session replacement 的完整生命周期；
- 符合项目首个里程碑中“支持基础扩展交互”的目标。

#### 接受的缺点

- 需要实现 modal queue、焦点管理、键盘操作和可访问性；
- 必须处理多个请求、重复响应、timeout 和取消；
- 窗口关闭、session replacement、abort 和 runtime crash 时必须解决所有 pending Promise；
- `editor` 需要多行编辑、预填内容和较复杂的焦点恢复；
- extension 文本是不可信输入，需要安全渲染；
- E2E 和生命周期测试工作明显增加；
- 扩展交互可能与 agent prompt composer、全局快捷键和应用关闭流程冲突。

#### 不接受的含义

首版只支持无响应的 `notify`，或者只支持 `confirm` 等有限子集；其余 extension UI 明确标记为暂不支持，并采用取消、返回默认值或阻止不兼容 extension 的策略。

不能让不支持的请求无限等待。

#### 不接受的优点

- 可以更快完成核心聊天、流式输出、工具和 session 流程；
- 减少 modal、焦点和 pending request 的复杂状态；
- 降低首版 UI 和 E2E 测试范围；
- 可以根据真实 extension 使用情况决定支持顺序；
- 允许先验证 SDK 集成和安全 IPC，再补齐扩展交互。

#### 不接受的缺点

- 部分现有 pi extensions 无法正常使用；
- 扩展行为可能与 pi TUI 不一致；
- 用户可能看到“该扩展交互暂不支持”并被迫回到 TUI；
- 必须定义明确的兼容性检测和失败策略；
- 如果简单返回默认值，可能误确认危险操作，因此不能静默降级；
- 后续补齐时仍要调整 IPC、runtime lifecycle 和 UI 架构；
- 不完全符合当前 README 中首个里程碑的扩展交互目标。

#### 可选的折中方案

如果不接受首版全套支持，可以分两阶段：

1. 首版支持 `notify`、`confirm` 和 `select`；
2. 随后支持 `input` 和 `editor`。

折中方案仍需保证：

- 不支持的方法立即返回明确的取消或错误；
- 不静默确认操作；
- 不让 extension Promise 无限等待；
- UI 明确提示当前兼容性限制。

#### 当前建议

考虑到 README 已将基础扩展交互列为首个里程碑目标，建议首版**接受完整支持** `select`、`confirm`、`input` 和 `editor`，并同时支持 `notify`。

如果交付周期优先级高于扩展兼容性，则采用上述分阶段折中方案，但必须同步修改 README 的首版范围和已知限制。

## 17. 决策摘要

| 决策 | 当前状态 | 本文建议 |
| --- | --- | --- |
| pi SDK 与 Electron main 同进程 | 待决定 | 首版接受，保留 adapter 替换点 |
| 单窗口、单活动工作目录/runtime | 待决定 | 首版接受 |
| npm + Electron Forge/Vite | 待决定 | 接受，但先完成打包 spike |
| 先 RPM/deb，后 AppImage/Flatpak | 待决定 | 接受，Flatpak 单独评估 |
| 首版完整支持 extension UI | 待决定 | 接受；工期受限时可分阶段 |

审查完成后，应将每项“当前状态”更新为“已接受”或“已拒绝”，记录决定日期和简短理由。如果最终决定改变安全边界、首版范围或开发命令，还需要同步更新 `README.md` 和相关项目约束。

## 18. 参考资料

### 项目内资料

- [桌面框架与 TypeScript 构建方案调研](../desktop-framework-options.md)
- [`AGENTS.md`](../../AGENTS.md)
- [`README.md`](../../README.md)
- `../pi/packages/coding-agent/docs/sdk.md`
- `../pi/packages/coding-agent/docs/security.md`
- `../pi/packages/coding-agent/docs/rpc.md`
- `../pi/packages/coding-agent/examples/sdk/13-session-runtime.ts`

### 外部资料

- [Electron 进程模型](https://www.electronjs.org/docs/latest/tutorial/process-model)
- [Electron 安全建议](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Electron Forge Vite + TypeScript](https://www.electronforge.io/templates/vite-+-typescript)
- [pi SDK](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sdk.md)
- [pi RPC](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/rpc.md)
- [pi Security](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/security.md)
