# 软件架构评审指南

[English](architecture-review-guide.md) | 中文

- 类型：Guide
- 状态：Accepted
- 翻译状态：Machine Draft
- 记录日期：2026-09-18
- 最近同步：2026-09-19
- 权威原文：[architecture-review-guide.md](architecture-review-guide.md)
- 原文版本：Uncommitted baseline
- 适用范围：pi-desktop 及类似的桌面应用、长任务应用和高权限本地工具
- 权威范围：模块划分、公共接口、依赖关系、契约、所有权及完整架构评审方法
- 相关文档：[pi-desktop 首版 Electron 系统架构](architecture/electron-architecture.md)

## 1. 为什么需要这份指南

软件架构评审不能只停留在“结构清晰”“耦合较低”“具有扩展性”等抽象结论。这些说法如果没有证据、风险和下一步行动，很难指导实现，也无法转化为自动化约束或测试。

本指南用于回答四类问题：

1. 模块划分、公共接口、依赖关系、契约和所有权分别解决什么问题；
2. 应该使用什么话术评价这些方面做得好不好；
3. 不同规模的软件是否都需要考虑这些方面；
4. 除此之外，完整的软件架构还需要考虑哪些内容。

可以用建筑作类比：

- **模块划分**：房间怎么划分；
- **公共接口**：房间之间开哪些门；
- **依赖关系**：人和物资沿什么方向流动；
- **契约**：通过门时必须遵守什么规则；
- **所有权**：谁持有钥匙，谁负责维护和关门。

这五项相互关联，但解决的是不同问题。

## 2. 模块划分

### 2.1 定义

模块划分回答：

> 系统由哪些部分组成，每个部分负责什么，又明确不负责什么？

模块可以是：

- 一个进程；
- 一个 package；
- 一个目录；
- 一个 service；
- 一个 class；
- 一组相关函数；
- 一个前端 feature。

以 pi-desktop 为例，进程级模块包括：

```text
Renderer
Preload
Electron Main
Pi Runtime
```

Electron Main 内部又可以划分为：

```text
RuntimeController
PiAdapter
IpcRouter
ProjectTrustCoordinator
CredentialCoordinator
AttachmentService
ExtensionUiCoordinator
```

### 2.2 作用

#### 控制复杂度

开发 `AttachmentService` 时，不应同时理解模型选择、session replacement 和窗口恢复。

#### 隔离变化

pi SDK 升级时，变化应尽量限制在 `PiAdapter` 附近，而不是扩散到 renderer 中的所有组件。

#### 建立安全边界

renderer 不直接访问 Node.js，凭据只由 main process 管理。

#### 方便测试

可以单独验证：

- `PiAdapter` 如何转换事件；
- `IpcRouter` 如何拒绝畸形输入；
- `AttachmentService` 如何清理过期 token。

### 2.3 判断标准

良好的模块划分通常具备：

- **职责单一**：模块有清楚的主要职责；
- **高内聚**：相关逻辑集中在一起；
- **低耦合**：模块不需要知道其他模块的大量内部细节；
- **变化原因明确**：不同原因引起的变化尽量落在不同模块；
- **边界可测试**：可以不启动整个系统就验证模块；
- **权限匹配职责**：模块只获得完成职责所需的能力。

常见问题包括：

- 一个模块同时管理窗口、pi 事件和凭据；
- 多个模块都能直接修改 runtime；
- 修改一个事件字段需要改动大量无关模块；
- `Manager` 或 `Utils` 模块职责不断扩张；
- 模块相互调用并形成依赖环。

### 2.4 推荐评价话术

不要只说：

> 模块划分合理。

更好的表达是：

> 模块已经按进程权限和主要职责划分，renderer、preload、main 与 pi runtime 的边界明确。Main process 内部也已经识别出 runtime、IPC、信任、凭据和附件等独立变化原因。

随后指出具体缺口：

> 但 `RuntimeController` 与 `PiAdapter` 的调用边界尚未固定，prompt、abort 和 session replacement 的直接执行者仍有歧义。

评价时应说明：

- 按什么原则划分；
- 哪些边界已经清楚；
- 哪些职责发生重叠；
- 是否遗漏必要模块；
- 是否可以独立测试；
- 模块是否匹配权限边界。

## 3. 公共接口

### 3.1 定义

公共接口回答：

> 其他模块可以通过哪些操作使用这个模块？

这里的“公共”不一定表示公开给第三方。它也可以是：

- renderer 可以使用的 preload API；
- `IpcRouter` 可以调用的 runtime API；
- application service 可以调用的 credential API；
- 测试替身需要实现的 port。

例如：

```typescript
interface AttachmentService {
  chooseImage(): Promise<AttachmentMetadata | null>;
  consume(token: AttachmentToken): Promise<ImageContent>;
  revoke(token: AttachmentToken): void;
  dispose(): void;
}
```

调用者只知道这些能力，不应依赖：

- token 存储在 `Map` 还是数据库；
- 文件选择器如何调用；
- 图片如何读取；
- 过期 timer 如何实现。

### 3.2 作用

#### 隐藏实现细节

调用者依赖模块提供的能力，而不是内部数据结构。

#### 限制权限

renderer 可以请求“选择图片”，但不能请求“读取任意绝对路径”。

#### 支持替换实现

未来可以把 `SdkPiRuntimeAdapter` 替换成 `RpcPiRuntimeAdapter`，只要二者满足同一个项目领域接口。

#### 提高可测试性

测试可以提供 fake implementation，而不需要启动真实 pi runtime。

### 3.3 判断标准

良好的公共接口通常是：

- **窄的**：只暴露调用方真正需要的能力；
- **明确的**：方法名、输入和输出表达业务语义；
- **领域化的**：使用项目自己的类型，不泄漏底层框架类型；
- **可验证的**：跨进程或外部输入具有 runtime schema；
- **可恢复的**：错误、取消和超时行为明确；
- **完整的**：调用者不需要绕过接口访问内部对象；
- **相对稳定的**：内部实现变化不要求所有调用者随之变化。

过宽的接口：

```typescript
interface HostApi {
  invoke(method: string, args: unknown[]): Promise<unknown>;
}
```

更合适的接口：

```typescript
interface AgentApi {
  prompt(input: PromptInput): Promise<CommandResult<PromptAcceptance>>;
  abort(): Promise<CommandResult<void>>;
}
```

### 3.4 接口不等于契约

接口可能只说明：

```typescript
abort(): Promise<void>
```

但没有说明：

- 没有运行中任务时会怎样；
- 是否清理消息队列；
- resolve 时是否已经 idle；
- 超时后会怎样；
- 与 session replacement 同时发生时如何处理。

这些属于契约，而不仅是接口类型。

### 3.5 推荐评价话术

不要只说：

> 接口清晰。

更好的表达是：

> preload 对 renderer 的接口已经形成用例级轮廓，没有暴露通用 IPC 或 Node 能力，方向正确。

随后指出具体缺口：

> 但接口仍是示意，`RuntimeSnapshot`、command 输入输出、领域事件 payload 和错误码尚未正式定义，因此还不能作为可执行 contract。

评价时应说明：

- 接口是否足够窄；
- 是否泄漏底层实现类型；
- 输入输出是否明确；
- 是否可以进行 runtime 校验；
- 是否足以支持调用者完成工作；
- 是否支持替换实现和测试替身。

## 4. 依赖关系

### 4.1 定义

依赖关系回答：

> 谁可以知道谁、调用谁、导入谁？依赖方向是什么？

例如，pi-desktop 的合理方向可以表示为：

```text
Renderer
    ↓
Shared contracts
    ↑
Preload
    ↓
Electron IPC
    ↓
Main application services
    ↓
Runtime port
    ↓
Pi SDK adapter
    ↓
pi SDK
```

### 4.2 作用

#### 防止边界被绕过

如果 renderer 可以直接导入 pi SDK，preload 和 IPC 的安全边界就失效了。

#### 控制修改传播

renderer 依赖项目领域类型，而不是 pi SDK 类型。pi SDK 升级时，修改可以限制在 adapter 附近。

#### 防止循环依赖

例如：

```text
RuntimeController → PiAdapter
PiAdapter → RuntimeController
```

双向依赖会让初始化、测试和生命周期变得复杂。

#### 明确架构层次

高层业务规则不应依赖 Electron 的具体 IPC handler；应由 Electron adapter 调用业务层。

### 4.3 判断标准

良好的依赖关系通常具备：

- **单向**：大部分调用沿固定方向流动；
- **无环**：模块依赖图没有循环；
- **依赖稳定边界**：业务逻辑依赖领域接口，不依赖易变框架细节；
- **框架位于边缘**：Electron、pi SDK、文件系统位于 adapter 或 infrastructure 层；
- **可以自动检查**：使用 lint、TypeScript project references 或目录规则阻止非法 import；
- **权限不逆流**：renderer 不能通过共享模块间接获得 Node 能力。

例如，仅规定“renderer 不依赖 main”还不够，还应规定：

```text
shared 不依赖 renderer、preload、main、Electron、Node.js 或 pi SDK
```

否则可能出现：

```text
Renderer → Shared → Main
```

从而间接破坏边界。

### 4.4 推荐评价话术

不要只说：

> 依赖关系合理，耦合较低。

更好的表达是：

> 文档已经确定 renderer 不依赖 Electron、Node.js 和 pi SDK，`src/shared` 也计划保持纯 TypeScript，基本依赖方向正确。

随后指出具体缺口：

> 但尚未形成完整依赖图，也没有规定 main 内部 `IpcRouter`、application service、runtime port 和 SDK adapter 的调用顺序；非法 import 目前也没有自动化约束。

评价时应说明：

- 依赖方向；
- 是否存在依赖环；
- 框架是否位于边缘；
- 高层逻辑是否依赖抽象；
- 哪些依赖明确禁止；
- 依赖规则是否能自动执行。

## 5. 契约

### 5.1 定义

契约回答：

> 调用接口或接收事件时，双方具体承诺什么行为？

契约比 TypeScript 类型更广，包括：

- 输入；
- 输出；
- 前置条件；
- 后置条件；
- 错误；
- 状态限制；
- 顺序；
- 并发；
- 取消；
- 超时；
- 幂等性；
- 资源释放；
- 安全和隐私规则。

例如，接口可能是：

```typescript
abort(): Promise<CommandResult<void>>
```

完整契约可能是：

- 只作用于当前 `runtimeGeneration`；
- 没有活动操作时返回成功；
- 开始 abort 后 runtime 进入 `aborting`；
- resolve 时 session 已经 idle；
- 默认不清除 steering/follow-up queue；
- 30 秒未完成时返回 `OPERATION_TIMED_OUT`；
- session replacement 开始后返回 `SESSION_REPLACED`；
- 多次调用不会创建多个并行 abort 流程。

这些信息不能仅从函数签名得知。

### 5.2 作用

#### 消除歧义

让实现者、调用者和测试对行为有相同理解。

#### 处理失败路径

复杂问题通常来自：

- 同时调用；
- 中途取消；
- 窗口关闭；
- runtime 被替换；
- 请求超时；
- 事件晚到。

#### 直接生成测试

契约中的前置条件、结果、错误、并发和清理要求可以直接转化为测试用例。

#### 支持跨进程通信

IPC 两侧不能共享对象和内存，只能依赖明确的数据与行为约定。

### 5.3 判断标准

良好的契约需要：

- 输入输出明确；
- 合法状态明确；
- 失败方式明确；
- 取消和超时明确；
- 事件顺序明确；
- 最终权威数据明确；
- 并发行为明确；
- 幂等性明确；
- 生命周期边界明确；
- 可以写成自动化测试。

例如：

> `message_end.message` 是完成消息的权威值。

这是一条明确且可测试的契约。即使之前的 delta 丢失或组装错误，收到 `message_end` 后也应使用完整消息纠正状态。

### 5.4 推荐评价话术

不要只说：

> IPC 契约比较完整。

更好的表达是：

> IPC 已区分 command、result 和 event，并考虑 generation、sequence、snapshot 同步以及 `message_end` 权威值，跨进程契约基础较好。

随后指出具体缺口：

> 但模块内部行为契约尚未完整定义，尤其缺少 runtime 状态机、command 可执行状态、并发线性化、取消、超时和幂等规则。

评价时应说明：

- 数据结构是否明确；
- 行为语义是否明确；
- 状态和顺序是否明确；
- 错误、取消和超时是否明确；
- 并发行为是否明确；
- 契约是否可由测试验证。

## 6. 所有权

### 6.1 定义

所有权回答：

> 谁负责创建、修改、替换和释放某个状态或资源？

这里不是只指语言级所有权，而是架构上的责任归属。

例如：

```text
Resource: AgentSessionRuntime
Owner: RuntimeController
```

意味着只有 `RuntimeController` 可以：

- 创建；
- 替换；
- abort；
- dispose；
- 决定当前哪个 runtime 有效。

其他模块可以通过受控接口使用 runtime 的能力，但不能自行控制其生命周期。

### 6.2 所有权适用对象

所有权不仅适用于对象，也适用于：

- runtime；
- session subscription；
- pending Promise；
- timer；
- child process；
- event sequence；
- attachment token；
- extension UI 请求；
- 窗口；
- IPC handler；
- 日志或诊断记录；
- 缓存；
- 数据库连接；
- renderer store。

### 6.3 作用

#### 防止重复释放

两个模块都认为自己应该 `dispose()`，可能导致重复清理和异常。

#### 防止无人清理

多个模块使用同一个 timer，但没有模块负责停止它，会产生资源泄漏。

#### 防止并发修改

两个模块都可以替换当前 session，会产生竞态和状态不一致。

#### 明确生命周期

知道资源何时创建、何时失效、何时必须清理。

### 6.4 判断标准

良好的所有权设计通常满足：

- 每个长生命周期资源有唯一 owner；
- 只有 owner 能替换或销毁资源；
- 借用者不能把引用保存得比 owner 更久；
- 创建和释放职责成对；
- session replacement、窗口关闭、应用退出时的行为明确；
- owner 可以取消它创建的 pending operation；
- 状态修改入口数量有限。

完整的所有权描述示例：

```text
Resource: Extension UI pending request
Owner: ExtensionUiCoordinator
创建：extension 发起 UI 请求
正常完成：用户响应
其他完成方式：取消或 timeout
Session replacement：全部取消
窗口关闭：全部取消
应用退出：全部取消
重复响应：拒绝
```

### 6.5 推荐评价话术

不要只说：

> 所有权比较清晰。

更好的表达是：

> `RuntimeController` 被定义为 `AgentSessionRuntime` 的唯一 owner，并明确禁止其他模块长期保存旧 `AgentSession`，这一核心所有权设计是清楚的。

随后指出具体缺口：

> 但 `ModelRuntime`、SDK subscription、event sequence、attachment token、extension UI pending request 和 diagnostic cause 的 owner 尚未逐项指定。

评价时应说明：

- 谁创建资源；
- 谁可以修改资源；
- 谁负责释放资源；
- 谁可以持有引用；
- 资源何时失效；
- session replacement 时如何处理；
- 窗口关闭和应用退出时如何处理；
- 异常路径如何清理。

## 7. 推荐的架构评价结构

架构评价不应只给出“好”或“不好”。推荐使用以下四段式。

### 7.1 当前结论

例如：

> 模块划分基本清晰，但还未达到无歧义实施程度。

### 7.2 已完成部分及证据

例如：

> 已经按照 renderer、preload、main 和 pi runtime 划分权限边界，并将凭据、信任和附件能力保留在 main process。

### 7.3 具体缺口及风险

例如：

> `RuntimeController` 与 `PiAdapter` 都可能被理解为 SDK 调用入口。如果不固定直接执行者，未来可能出现多个模块保存 `AgentSession` 并并发修改 runtime。

### 7.4 可执行改进动作

例如：

> 增加 `PiRuntimePort`，规定只有 `SdkPiRuntimeAdapter` 可以导入 pi SDK，`RuntimeController` 负责 adapter 生命周期和操作串行化。

这套话术要求每个评价都包含：

```text
结论
    ↓
证据
    ↓
风险
    ↓
行动
```

相比“架构合理，后续完善”，它更容易指导开发和验收。

## 8. 软件开发是否都需要考虑这五项

### 8.1 简短结论

都需要考虑，但不一定都要写成正式文档，也不一定都需要复杂抽象。

这些问题客观上始终存在：

- 代码会形成某种结构；
- 一部分代码会调用另一部分；
- 调用会有输入和输出；
- 状态会由某个地方修改；
- 资源会在某个时间创建和销毁。

区别在于：

> 是主动设计这些关系，还是让它们在代码增长过程中随机形成。

### 8.2 不同规模的设计深度

#### 一次性小脚本

通常只需考虑：

- 函数输入输出；
- 文件和进程正确关闭；
- 错误能够报告；
- 不破坏用户数据。

不需要建立大量 interface 或正式架构文档。

#### 普通前端页面

通常需要考虑：

- feature 和 component 划分；
- API client 边界；
- 服务端响应类型；
- 状态所有权；
- 副作用清理；
- error、loading 和 empty 状态。

#### 桌面应用

还需要额外考虑：

- 进程边界；
- 系统权限；
- IPC；
- 窗口生命周期；
- 本地持久化；
- 安装和升级；
- 操作系统差异。

#### Coding agent 桌面客户端

需要更严格，因为它同时具有：

- 高权限文件访问；
- shell 执行；
- 流式异步事件；
- 长时间运行；
- 用户扩展；
- provider 凭据；
- session 持久化；
- 项目切换；
- Electron 多进程。

接口、契约和所有权不明确可能直接导致：

- 命令在错误目录执行；
- 旧 session 事件进入新 session；
- 凭据泄漏到 renderer；
- 窗口关闭后任务仍运行；
- extension UI Promise 永远不结束；
- runtime replacement 后 listener 泄漏。

因此，pi-desktop 值得在编码前明确这些内容。

### 8.3 避免过度设计

“需要考虑”不等于“每个函数都需要 interface”。

只有一个调用者、一个实现，而且不跨安全或进程边界的简单函数，通常不需要专门抽象成 port。

应在以下位置优先建立正式接口和契约：

- 跨进程；
- 跨权限边界；
- 外部依赖；
- 长生命周期资源；
- 存在多个实现；
- 需要 fake 测试；
- 已经明确存在替换需求。

## 9. 除这五项外，还需要考虑什么

这五项主要描述系统的静态结构和交互责任。完整的软件架构还需要考虑以下内容。

### 9.1 需求和范围

需要回答：

- 首版解决哪些用户问题；
- 哪些功能明确不做；
- 成功标准是什么；
- 哪些场景是核心路径；
- 哪些内容以后再做。

范围不清晰时，架构容易不断为假设功能扩张。

### 9.2 领域模型

需要回答：

- 什么是 workspace；
- 什么是 runtime；
- 什么是 session；
- 什么是 message；
- 什么是 tool execution；
- 什么是 attachment；
- 它们之间是什么关系。

例如应明确：

```text
Workspace ≠ Runtime ≠ Session ≠ Conversation View
```

否则 UI、持久化和 runtime 生命周期容易混在一起。

### 9.3 状态机

需要回答：

- 系统有哪些状态；
- 哪些状态转换合法；
- 非法操作如何处理。

例如：

```text
uninitialized
opening
ready
running
aborting
switching
error
crashed
disposing
disposed
```

还应定义转换，例如：

```text
ready → running
running → aborting
aborting → ready
ready → switching
switching → ready
switching → error
任意活动状态 → disposing → disposed
```

状态机属于契约的一部分，但对长任务应用足够重要，通常应独立设计。

### 9.4 并发模型

需要回答：

- 哪些操作可以同时发生；
- 哪些操作必须串行；
- abort 能否插队；
- session switch 与 prompt 同时发生时谁优先；
- 应用关闭时如何中止所有工作；
- 如何处理晚到事件。

pi-desktop 应特别定义：

- runtime mutation queue；
- prompt 与 replacement 的互斥；
- credential refresh 与 model selection；
- extension UI pending response；
- renderer reload 的事件同步。

### 9.5 错误和恢复策略

需要回答：

- 哪些错误可以重试；
- 哪些错误需要重建 runtime；
- 哪些错误需要重启应用；
- 用户看到什么；
- 底层 cause 如何保留；
- 如何避免泄漏敏感信息。

错误处理不仅是 `try/catch`，还包括明确的恢复路径。

### 9.6 安全和信任模型

需要回答：

- 信任边界在哪里；
- 攻击者可能控制哪些输入；
- 哪些组件拥有系统权限；
- 凭据存放在哪里；
- 哪些数据不能记录；
- 外部链接如何处理；
- extension 具有什么权限。

对 pi-desktop 必须明确：

```text
Renderer sandbox
≠ Project trust
≠ Operating-system sandbox
```

三者解决的问题不同，不能相互替代。

### 9.7 数据和持久化

需要回答：

- 哪些数据由谁保存；
- 保存在哪里；
- 格式是什么；
- 是否加密；
- 如何迁移；
- 损坏时如何恢复；
- 并发写入如何处理；
- 退出前是否需要 flush。

即使 session 由 pi 管理，Electron 自己的 UI 设置仍需要格式、版本和迁移策略。

### 9.8 生命周期和清理

需要回答：

- 启动顺序；
- 窗口创建顺序；
- runtime 何时创建；
- renderer reload 会发生什么；
- session replacement 会发生什么；
- 窗口关闭会发生什么；
- 应用退出会发生什么；
- 超时后是否强制退出。

生命周期与所有权密切相关，但更关注系统级时间顺序。

### 9.9 性能和背压

需要回答：

- 流式 delta 频率多高；
- 是否每个字符都跨 IPC；
- renderer 是否会频繁重渲染；
- 长工具输出如何截断或虚拟化；
- 事件缓冲上限是多少；
- renderer 消费不过来时怎么办。

pi-desktop 特别需要考虑：

- 文本增量合并；
- 工具输出累计更新；
- 长 session 虚拟列表；
- preload 缓冲区上限；
- snapshot 重同步。

### 9.10 可观测性和隐私

需要回答：

- 记录哪些日志；
- 日志级别如何定义；
- diagnostic ID 如何生成和查询；
- 是否收集崩溃信息；
- 是否记录性能指标；
- 哪些内容必须脱敏；
- 日志保留多久。

coding agent 默认不应记录：

- 完整 prompt；
- 文件内容；
- API key；
- 完整环境变量；
- 用户目录中的敏感完整路径。

### 9.11 测试策略

需要回答：

- 单元测试验证什么；
- contract 测试验证什么；
- 组件测试验证什么；
- E2E 验证什么；
- 打包后如何做 smoke test；
- 如何避免真实付费模型；
- 如何模拟失败、超时和竞态。

测试应从契约推导，而不是实现结束后再选择几个正常路径示例。

### 9.12 构建、发布和升级

需要回答：

- 依赖如何固定；
- 如何构建；
- 如何制作 RPM/deb 等安装包；
- 安装后的程序和数据路径；
- 如何升级；
- 旧版本数据如何迁移；
- 出现问题如何回滚。

Electron 应额外验证：

- 内置 Node.js 版本；
- ASAR；
- native module；
- WASM；
- Chromium sandbox；
- 不同 Linux 发行版。

### 9.13 兼容性和版本策略

需要回答：

- 支持哪些 pi SDK 版本；
- 升级上游时验证什么；
- IPC 是否有 schema version；
- 持久化格式是否有 version；
- 开发初期允许哪些破坏性变更；
- 发布后如何迁移。

项目当前允许破坏性变更，但仍应让版本不匹配显式失败，不能静默忽略。

### 9.14 用户体验和可访问性

需要回答：

- loading、empty、error、offline 和 crashed 如何呈现；
- 键盘操作和焦点如何管理；
- 屏幕阅读器如何使用；
- 长命令和无换行输出如何展示；
- 流式内容是否造成布局跳动；
- 危险操作如何确认。

架构会直接影响用户体验。例如，`ExtensionUiCoordinator` 的生命周期决定 modal 能否正确取消并恢复焦点。

## 10. 通用架构评审框架

以后评审一个软件架构，可以依次询问以下问题。

### 10.1 结构

- 系统有哪些模块？
- 每个模块负责什么？
- 每个模块明确不负责什么？

### 10.2 边界

- 模块对外暴露什么接口？
- 哪些能力不能暴露？
- 边界是否对应权限和变化原因？

### 10.3 方向

- 谁依赖谁？
- 是否存在循环依赖？
- 是否存在越层调用？
- 依赖规则能否自动检查？

### 10.4 行为

- 调用和事件遵守什么契约？
- 失败、并发、取消和超时如何处理？
- 哪个数据是最终权威值？

### 10.5 责任

- 谁拥有状态和资源？
- 谁创建、修改、替换和释放？
- 异常路径由谁清理？

### 10.6 时间

- 启动、运行、切换和关闭时发生什么？
- 系统状态机是什么？
- 晚到事件如何处理？

### 10.7 数据

- 数据在哪里、由谁保存？
- 如何迁移、恢复和清理？
- 哪些数据属于敏感信息？

### 10.8 风险

- 安全、崩溃、性能和隐私风险是什么？
- 风险如何检测、限制和恢复？

### 10.9 验证

- 如何通过类型、schema、lint 和测试证明设计成立？
- 哪些约束目前只存在于文档中？
- 哪些约束需要自动化执行？

## 11. 架构成熟度描述

可以使用以下分级描述架构完成程度。

### 11.1 方向级

已经确定技术方向和主要进程边界，但模块、接口和行为仍大量依赖实现者自行决定。

### 11.2 结构级

已经定义主要模块、职责和依赖方向，但公共接口、状态机和资源所有权仍不完整。

### 11.3 可实施级

已经定义：

- 模块职责；
- 允许和禁止的依赖；
- 关键公共接口；
- command/event/snapshot 契约；
- 状态机和并发规则；
- 长生命周期资源所有权；
- 错误、取消和清理策略。

开发者无需自行发明关键架构规则即可开始实现。

### 11.4 可验证级

除可实施级内容外，关键规则已经通过以下方式自动化：

- TypeScript 类型；
- runtime schema；
- lint/import boundary；
- contract test；
- 状态机测试；
- 生命周期和清理测试；
- 打包 smoke test。

### 11.5 可演进级

已经具备：

- 兼容性和版本策略；
- 持久化迁移；
- 上游升级流程；
- 可观测性；
- 性能基线；
- 故障恢复；
- 发布和回滚策略。

项目不必在开始编码前达到最高等级，但关键安全和生命周期边界应尽早达到可实施级，并尽快进入可验证级。

## 12. pi-desktop 当前评审示例

按照本指南，可以对当前 Electron 架构作如下描述。

### 12.1 当前结论

当前架构已完成宏观分层和主要安全边界，处于“结构级”，但尚未完全达到无歧义的“可实施级”。

### 12.2 模块划分

**结论：基本清晰。**

证据：

- 已划分 renderer、preload、Electron main 和 pi runtime；
- main 内识别了 runtime、IPC、信任、凭据和附件等职责；
- 高权限能力集中在 main process。

缺口：

- `RuntimeController` 和 `PiAdapter` 的 SDK 调用边界尚未固定；
- `ExtensionUiCoordinator` 和 diagnostics 模块尚未完全进入正式目录结构。

### 12.3 公共接口

**结论：已有轮廓，尚未正式完成。**

证据：

- 已有 `PiDesktopApi`、`CommandResult<T>`、`DesktopError` 和 `DesktopEventEnvelope` 的形态；
- preload 没有暴露通用 IPC 或 Node 能力。

缺口：

- `PiRuntimePort` 尚未定义；
- `RuntimeSnapshot` 尚未正式定义；
- command 输入输出和 event payload 尚未逐项确定；
- `DesktopError.code` 仍是过宽的 `string`。

### 12.4 依赖关系

**结论：方向正确，但缺少明确规则和依赖图。**

证据：

- renderer 不依赖 Electron、Node.js 和 pi SDK；
- `src/shared` 计划保持为纯 TypeScript。

缺口：

- main 内部缺少 `IpcRouter → application service → runtime port → SDK adapter` 的正式依赖图；
- 尚未列出完整禁止依赖；
- 尚未通过 lint 或 TypeScript 配置自动约束非法 import。

### 12.5 契约

**结论：IPC 外层契约已有基础，模块内部契约和状态机还不完整。**

证据：

- 已区分 command、result 和 event；
- 已设计 `runtimeGeneration`、`sequence` 和 snapshot 同步；
- 已明确 `message_end.message` 是完成消息的权威值。

缺口：

- runtime 状态机尚未正式定义；
- command 的允许状态尚未逐项定义；
- 并发、线性化、幂等、取消和超时规则尚未完整说明。

### 12.6 所有权

**结论：runtime 核心所有权明确，其他长生命周期资源仍需补充。**

证据：

- `RuntimeController` 是 `AgentSessionRuntime` 的唯一 owner；
- 明确禁止其他模块长期保存旧 `AgentSession`。

缺口：

- `ModelRuntime` 的 owner；
- SDK subscription 的 owner；
- event sequence 的 owner；
- preload event buffer 的 owner；
- attachment token 的 owner；
- extension UI pending request 的 owner；
- diagnostic cause 的 owner。

### 12.7 下一步

在大规模实现 UI 和 pi adapter 之前，优先补充：

1. 模块依赖规则和禁止依赖；
2. `PiRuntimePort` 等内部公共接口；
3. command/event/snapshot 正式领域契约；
4. runtime 状态机和并发规则；
5. 长生命周期资源所有权与清理矩阵。

性能与背压、日志与隐私、Electron 本地配置格式和迁移策略，可以在脚手架与最小 runtime spike 前后继续细化，但不应在发布前遗漏。

## 13. 架构评审模板

后续评审可以复制以下模板：

```markdown
## 评审对象

- 名称：
- 范围：
- 当前阶段：

## 1. 当前结论

一句话描述当前成熟度和最重要的缺口。

## 2. 模块划分

- 结论：
- 已完成及证据：
- 缺口：
- 风险：
- 改进动作：

## 3. 公共接口

- 结论：
- 已完成及证据：
- 缺口：
- 风险：
- 改进动作：

## 4. 依赖关系

- 结论：
- 已完成及证据：
- 缺口：
- 风险：
- 改进动作：

## 5. 契约

- 结论：
- 已完成及证据：
- 缺口：
- 风险：
- 改进动作：

## 6. 所有权

- 结论：
- 已完成及证据：
- 缺口：
- 风险：
- 改进动作：

## 7. 其他维度

- 需求和范围：
- 领域模型：
- 状态机和并发：
- 错误与恢复：
- 安全与信任：
- 数据与持久化：
- 生命周期与清理：
- 性能与背压：
- 可观测性与隐私：
- 测试策略：
- 构建、发布与升级：
- 兼容性与版本：
- 用户体验与可访问性：

## 8. 后续行动

1. 
2. 
3. 
```

## 14. 总结

模块划分、公共接口、依赖关系、契约和所有权共同回答了五个基础问题：

```text
系统由什么组成？
模块如何被使用？
调用方向是什么？
交互必须遵守什么规则？
谁负责状态和资源的完整生命周期？
```

这五项不是大型项目才需要考虑的形式要求，而是任何软件都会自然形成的结构。项目越复杂、权限越高、生命周期越长、并发越多，就越应该主动设计并记录。

高质量架构评审应始终包含：

```text
结论 + 证据 + 风险 + 行动
```

文档只能表达约束。关键约束最终还应落地为类型、schema、lint、状态机和自动化测试，才能从“设计意图”变成“可验证的架构”。
