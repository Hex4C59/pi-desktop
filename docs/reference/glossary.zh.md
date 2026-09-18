# pi-desktop 文档术语表

[English](glossary.md) | 中文

- 类型：Reference
- 状态：Accepted
- 翻译状态：Human Reviewed
- 创建日期：2026-09-19
- 最近评审：2026-09-19
- 权威范围：配对文档中重复出现的 pi-desktop 与 pi 集成术语的推荐英中译法
- 权威原文：[glossary.md](glossary.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-19
- 相关规范：[双语文档维护指南](../bilingual-documentation.md)

本术语表供人工评审和 `docs:i18n:check` 使用，不取代英文原文。若某对文档已稳定使用表中译法，应保持一致，除非英文原文发生变化。

代码标识符、CLI 命令、文件路径、事件名和上游 API 符号在两种语言中均保持英文，除非正文明确给出中文释义。

## 架构与进程边界

| English | 中文 | 说明 |
| --- | --- | --- |
| desktop host | 桌面宿主 | Electron Main 与高权限协调层；不得描述为沙箱。 |
| renderer | Renderer | 技术叙述中保留英文角色名；说明职责时可写呈现层。 |
| runtime | runtime | pi agent runtime；与任务记录区分时可写 pi runtime。 |
| session | session | pi session 绑定；除非 UI 文案刻意使用「会话」，否则不用会话指代标识符。 |
| task | 任务 | pi-desktop 中面向用户的顶层工作单元。 |
| agent | Agent | 主 pi Agent；指角色时保留大写 A。 |
| sub-agent | 子 Agent | 绑定父任务范围的子 Agent 运行。 |
| adapter | 适配器 | 宿主服务与 SDK 或 RPC 传输之间的 pi 适配层。 |
| lifecycle | 生命周期 | 启动、稳态、关闭与替换语义。 |
| worktree | worktree | Git worktree 隔离；不翻译。 |

## 消息、队列与模型行为

| English | 中文 | 说明 |
| --- | --- | --- |
| steering message | steering 消息 | 对当前运行中的转向输入。 |
| follow-up message | follow-up 消息 | 运行进行中排队的后续消息。 |
| compaction | 压缩 | 上下文压缩；不用紧凑化。 |
| thinking level | 思考级别 | pi 思考级别设置。 |
| tool call | 工具调用 | 事件文本中与 tool call ID 关联。 |
| abort | 中止 | 用户发起的当前运行停止。 |
| cancellation | 取消 | 协作式或系统驱动的取消语义。 |
| retry | 重试 | 失败步骤的自动或可见重试。 |

## 信任、凭据与数据

| English | 中文 | 说明 |
| --- | --- | --- |
| project trust | 项目信任 | pi 项目信任流程；不是权限沙箱。 |
| credential | 凭据 | API 密钥、OAuth 令牌与认证文件内容。 |
| persistence | 持久化 | 应用或任务状态持久化；与 pi session 文件区分。 |
| recovery | 恢复 | 故障后的重启或 journal 驱动恢复。 |
| authoritative source | 权威原文 | 已完成迁移文档对的英文 `<name>.md`。 |

## 规范性用语（RFC 2119 风格）

翻译英文规范性关键词时采用下表中文表述。代码或引用中的 inline `must`、`should`、`may` 保持英文。

| English | 中文 |
| --- | --- |
| must | 必须 |
| must not | 不得 |
| should | 应 |
| should not | 不应 |
| may | 可以 |

## 有争议或依赖上下文的术语

在评审中标注备选译法，不要在同一文档内静默混用：

| English | 推荐 | 避免或限制 |
| --- | --- | --- |
| desktop host | 桌面宿主 | 桌面主机（仅当整篇遗留页面统一修订时可保留） |
| session（UI） | 会话 | 不用于 pi session 标识符。 |
| contract | contract | IPC 与模块边界优先保留英文；plain-language 摘要可用约定。 |

新增高频术语时，应在修改英文原文的同一变更中更新本表，并在配对页面元数据中单独维护翻译状态。
