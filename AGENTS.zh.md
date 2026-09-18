# AGENTS.md

[English](AGENTS.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[AGENTS.md](AGENTS.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

本内核适用于整个 `pi-desktop` 仓库。详细约束在 [`docs/guides/agent/`](docs/guides/agent/README.zh.md)，按 **加载地图** 渐进加载；playbook 在其主题范围内与内核同等约束。

## 权威顺序

冲突时：(1) 本内核与 agent playbook 管工程约束；(2) `product-requirements.md` 管用户可见行为；(3) `architecture/electron-architecture.md` 管结构与所有权；(4) `ACTIVE.md` 管当前工作项；(5) `docs/discussions/` 与 `docs/archive/` 仅作背景，不作实现依据。

对事实、阶段或仓库状态的问题：**仓库中的证据优先于迎合维护者的问法**。产品权衡与是否开工仍由维护者决定。

## 项目事实

- 仅 Linux 桌面 pi 客户端（当前不支持 Windows/macOS）。
- 初始化阶段：不得将规划功能写成已交付。
- 同级 `../pi` 除非用户明确要求，否则只读。
- 正式构建不得依赖 `../pi`、指向它的绝对路径或未声明的 workspace link。
- pi 行为与公共 API 以上游代码、类型与文档为准，不得臆测。

## 不可妥协（L0）

- pi 以启动用户权限运行；项目信任不是沙箱——UI 与文案不得暗示相反结论。
- 已保存的 API key、OAuth token 与认证文件内容不得进入 renderer、前端持久化、遥测、普通日志或通知；新凭据仅经专用一次性 IPC，提交后立即从 UI 状态清除。
- 仅暴露命名明确的 allowlist IPC；在宿主校验输入；禁止通用「执行任意宿主代码」接口。
- 不得为会话功能读写 session JSONL；使用 SDK 或 RPC 会话 API。
- 不得在桌面端重新实现 pi 的 agent loop、provider、工具、compaction 或 session 管理。
- 未经用户明确要求，不得创建、修改、合并或重写 Git commit。

## 判断与诚实（L0）

- 在仓库允许时给出**明确结论**（是 / 否 / 部分 / 尚未 / 未知）。勿因问题听起来像在求肯定或求更多工作就默认同意。
- 论断须基于**本仓库**（`ACTIVE.md`、阶段、gate、文件、已跑命令）。勿为显得有帮助而编造缺口。
- 被问「还能优化什么 / 下一步做什么」时，**可以**回答**当前没有必须项**、**`ACTIVE.md` 排队已够**或**本阶段为时过早**。仅当维护者**明确**要头脑风暴、方案列表或 backlog 倾泻时才列可选想法。
- 若维护者前提与文档或事实冲突，**指出**并说明已核对内容。具体、专业，不居高临下。
- 证据不足时说明缺什么；勿假肯定或假否定。
- 本节不凌驾上文安全 L0、维护者对**限定任务**的明确指令，或「未经要求不 commit」。

**短例**

- 问：「加了 `docs:verify`，还要优化什么？」  
  **宜：**「WI-001 前无必须项；可选：日后 CI 跑 `docs:verify`。」  
  **忌：** 无依据地堆新 WI、skill 或重写。

- 问：「现在写 Accepted 构建基线 ADR？」  
  **宜：**「否——spike 未确认；按 `ACTIVE.md` gate 保持 `In spike`。」  
  **忌：** 为讨好问题而提前写 Accepted ADR。

更多模式：[judgment.zh.md](docs/guides/agent/judgment.zh.md)。

## 分层模型（L1 摘要）

- **Renderer**：视图、输入、短生命周期 UI 状态——无 Node、shell、任意 FS、凭据或 pi SDK 类型。
- **Host**：类型化 IPC、pi runtime 生命周期、持久化协调、窗口外系统能力。
- **Adapter**：SDK/RPC → 内部领域事件；隔离上游版本变化。
- **pi runtime**：模型、agent、工具、资源、会话（上游）。

流式：用 `contentIndex` 与 tool call ID 关联；以 `message_end.message` 为完成权威；会话替换后重新绑定订阅；中止、切换、关闭或崩溃时清理监听器、子进程与 pending request。详见 [boundaries.zh.md](docs/guides/agent/boundaries.zh.md)。

## ACTIVE 会话配对

维护者新开实现会话可 **只 @ [`ACTIVE.md`](ACTIVE.md)**（或说「继续 pi-desktop」）。对 agent 义务而言，等价于同时附上 `ACTIVE.md` 与协作指南：

1. 阅读 `ACTIVE.md`（含顶部 **Agent 会话契约** 摘要与当前 WI）。
2. 在提案或改应用代码之前，全文阅读 [`docs/guides/agent-collaboration.zh.md`](docs/guides/agent-collaboration.zh.md)。

仅作只读答复、不涉及 WI 或代码时可跳过步骤 2，除非涉及 gate、ADR 或会话收尾规则。可选路由：会话/WI 收尾见 [pi-desktop-handoff](.agents/skills/pi-desktop-handoff/SKILL.md)。

## 开始工作前

1. 阅读本内核、[`ACTIVE.md`](ACTIVE.md)、[`README.md`](README.md)、当前目录树、已有的 `package.json` 与相关测试。
2. 实现会话须遵守上文 **ACTIVE 会话配对**（维护者未 @ 协作指南时，agent 仍必须读）。
3. 保留用户无关的 Git 修改；使用仓库包管理器与脚本——不因偏好替换技术栈。
4. 若改变安全、持久化或 pi 集成策略，先澄清影响并记录决策，再做大改动。

## 加载地图（进入该区域前必读）

| 若你将… | 先读 |
|---------|------|
| 开始任意实现会话 | 维护者只 @ [`ACTIVE.md`](ACTIVE.md)；agent：[ACTIVE 会话配对](#active-会话配对) + [协作指南](docs/guides/agent-collaboration.zh.md) |
| 判断类问题（对不对、还能做什么、优化、做不做） | [judgment.zh.md](docs/guides/agent/judgment.zh.md) |
| 定用户可见行为 | `docs/product-requirements.md`、`docs/architecture/electron-architecture.md` |
| 模块所有权与单模块设计 | [`docs/modules/README.zh.md`](docs/modules/README.zh.md) |
| 公共契约形状（IPC、事件、状态、持久化） | [`docs/reference/README.zh.md`](docs/reference/README.zh.md)（`Outline`/`Living` 时） |
| 跨层、流式、adapter、生命周期 | [boundaries](docs/guides/agent/boundaries.zh.md) |
| pi SDK、RPC、会话、升级 | [pi-integration](docs/guides/agent/pi-integration.zh.md) |
| IPC、preload、凭据、信任、shell | [security](docs/guides/agent/security.zh.md) |
| 应用内 TypeScript | [code-style](docs/guides/code-style.zh.md)、[typescript](docs/guides/agent/typescript.zh.md) |
| 维护者验收代码改动 | [code-review](docs/guides/code-review.zh.md) |
| Renderer / UI | [ui](docs/guides/agent/ui.zh.md) |
| 测试或声称已验证 | [testing](docs/guides/agent/testing.zh.md) |
| 脚本、CI、开发/构建/打包 | [commands](docs/guides/agent/commands.zh.md) |
| 破坏性重构或目录调整 | [change-policy](docs/guides/agent/change-policy.zh.md) |
| 文档结构、索引、讨论 | [documentation](docs/guides/agent/documentation.zh.md) |
| 创建 commit 或 commit message | [`docs/git-commit-convention.zh.md`](docs/git-commit-convention.zh.md)（规范与 message 仅英文） |
| 按文件路径选择 playbook | [path-triggers](docs/guides/agent/path-triggers.zh.md) |

索引：[docs/guides/agent/README.zh.md](docs/guides/agent/README.zh.md)。

## 任务完成（内核）

1. 端到端可用，而非仅静态 UI。
2. 类型、错误、取消、清理与空状态已处理。
3. 相关测试已增改并实际运行；lint/typecheck 通过。
4. 安全边界未扩大，或已明确说明并验证。
5. 用户可见行为与命令变化已按需更新文档。

详见 [testing.zh.md](docs/guides/agent/testing.zh.md)、[documentation.zh.md](docs/guides/agent/documentation.zh.md)。

## 上游指针

- `../pi/packages/coding-agent/docs/` 下 sdk、rpc、security、session-format、extensions
- `../pi/packages/coding-agent/examples/sdk/`
- pi 集成任务须阅读并核对导出类型；使用本地 `../pi` 时记录 commit——不得成为发布隐式依赖。
