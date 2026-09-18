# Agent 与维护者协作指南

[English](agent-collaboration.md) | 中文

- 类型：Guide
- 状态：Accepted
- 创建：2026-09-19
- 上次评审：2026-09-19（ADR 触发规则）
- 适用：日常与 coding agent 协作及产品侧拍板
- 权威范围：协作流程、会话交接、工作项跟踪约定
- 相关：[文档索引](../README.zh.md)、仓库根目录 [`ACTIVE.md`](../../ACTIVE.md)、[`AGENTS.md`](../../AGENTS.md)
- 权威原文：[agent-collaboration.md](agent-collaboration.md)
- 翻译状态：Human Reviewed
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-19

## 1. 目的

pi-desktop 由维护者（产品判断与验收）与 coding agent（技术顺序与实现）讨论推进。新窗口或上下文压缩后，聊天内容会丢失；**仓库里的文件**保存当前工作项与交接信息。

本指南不定义产品行为或系统架构；那些以 `product-requirements.md` 与 `architecture/electron-architecture.md` 为准。

## 2. 分工

| 维护者 | Coding agent |
|--------|----------------|
| 说明目标、偏好、哪里不对 | 阅读 PRD、架构、`AGENTS.md`、`ACTIVE.md` |
| 在方案中选「可以 / 不要 / B 方案」 | 提议下一工作项、做法、风险、验收步骤 |
| 像用户一样验收 | 实现、跑检查、说明如何验证 |
| 把新想法放进停车场 | 同时只推进一个工作项（WIP=1） |

维护者不必具备 Electron、pi SDK 或 agent 内部知识。由 agent **提议下一步**；大范围或难逆转的代码变更前须维护者确认。

Agent 提案可以是**「暂不做了」**、**「本阶段现状足够」**或**「你的前提与仓库不符」**——这仍是有效帮助，不是失职。勿仅因维护者问了开放性问题就堆砌额外工作项；不清楚时问对方要 **做/不做判断** 还是 **头脑风暴**。见 [judgment.zh.md](agent/judgment.zh.md)。

## 3. 权威来源

| 问题 | 权威 |
|------|------|
| 安全与仓库规则 | `AGENTS.md` 内核与 `docs/guides/agent/` playbook（见内核加载地图） |
| 用户可见范围与验收 | `product-requirements.md`（`Accepted` 前视为 Draft 输入） |
| 结构、边界、所有权 | `architecture/electron-architecture.md` |
| **当前在做什么** | 仓库根目录 [`ACTIVE.md`](../../ACTIVE.md) |
| 历史决策原因 | `docs/decisions/` 中 Accepted ADR；discussion 仅作背景 |
| 架构 gate 状态 | [`docs/reference/architecture-gates.zh.md`](../reference/architecture-gates.zh.md) |

聊天与 `ACTIVE.md` 不一致时，对齐后应更新 `ACTIVE.md`。

## 4. 单一进行中项（WIP=1）

- `ACTIVE.md` 中同时只有 **一个** 活动工作项（`WI-xxx`）。
- 新想法写入 `ACTIVE.md` **停车场**，维护者规划时再排序，不直接插队实现。
- `docs/README.md` 所列架构 **gate**（spike、ADR）未关闭前，不得当作已交付的产品能力实现。

## 5. 会话节奏

1. **开场** — 维护者 **只 @ `ACTIVE.md`**（或说「继续 pi-desktop」）。Agent 阅读 `ACTIVE.md` 与**本指南**（见 [`AGENTS.md` — ACTIVE 会话配对](../../AGENTS.zh.md#active-会话配对) 与 `ACTIVE.md` 顶部会话契约摘要），然后复述：当前 WI、上次 Last session、今日建议焦点、验收方式。可选：PRD/架构。
2. **提案** — Agent 简短说明计划（必要时给选项），并标注 **决策类**：`none` | `spike-only` | `adr-after-approval`（若适用则含 gate ID）。维护者确认（如「可以」「按 A 做」）前不大规模改代码。
3. **建造** — Agent 阅读 [code-style](code-style.zh.md) 与 [typescript](agent/typescript.zh.md)，实现并运行 lint/typecheck/测试（适用时），汇报结果。
4. **收尾** — Agent 更新 `ACTIVE.md` 的 **Last session**（日期、改动、如何验收、下一步建议）。若维护者已确认须写 ADR 的决定，在同一会话起草或更新 `docs/decisions/000x-….md` 与 [architecture-gates.zh.md](../reference/architecture-gates.zh.md)，或在工作项标 `Decision: pending-adr`。维护者评审应用代码时使用 [code-review](code-review.zh.md) 并回复通过/不通过。

## 6. 维护者提示词（可复制）

**新对话（常规）：**

```text
继续 pi-desktop。只 @ ACTIVE.md。
先复述当前 WI、Last session、建议今天完成什么（含验收）；我确认后再改代码。
```

**验收不通过：**

```text
验收不通过：期望 … / 实际 …。请只修此问题，再给验收步骤，并更新 ACTIVE。
```

**仅记录想法：**

```text
停车场：……。不要实现，只写入 ACTIVE，继续当前 WI。
```

## 7. Agent 义务

- 根据 PRD、架构与 `ACTIVE.md` 排队提议下一步；不要求维护者背诵多步 workflow。
- 脚手架、ADR、安全边界或破坏性结构调整前须确认。
- 会话结束须更新 `ACTIVE.md` Last session（未完成也要写）。
- 汇报：改了什么、如何运行、测了什么、已知限制。
- 在 spike、ADR 与验收未满足前，不得声称首个可用版本的相关能力已交付。
- 遵守 [何时写 ADR](../decisions/README.zh.md#何时写-adr)；维护者无需背诵触发条件——由 agent 在提案中标注。

## 8. ADR 与 gate（维护者友好）

- **你拍板**；满足触发条件时由 agent 在批准后撰写 ADR。
- **ADR 时机**：spike/讨论结束且你确认之后（不是首次提案时）。
- **关闭 gate** 须在 [architecture-gates.zh.md](../reference/architecture-gates.zh.md) 链接 Accepted ADR。
- `ACTIVE.md` 使用 **Gate ID**（如 `gate-build-baseline`）与 **Decision**（`none` | `pending-adr` | `0001-slug`）。

### 会话收尾：gate 与 ADR

收尾时：

1. 若维护者**已确认**可关闭 gate 的决定：起草或更新 Accepted ADR，更新 [architecture-gates.zh.md](../reference/architecture-gates.zh.md) 与 [decisions/README.zh.md](../decisions/README.zh.md) Accepted 表；若 ADR 未完成则 ACTIVE 标 `Decision: pending-adr`。
2. 若仅推进 spike：更新 gate 为 `In spike` 与 ACTIVE Last session；**不要**写 Accepted ADR。
3. 提案须标明 **gate ID** 与 **决策类**，维护者无需背诵 ADR 触发条件。

### 文档漂移

涉及 gate、ADR、模块或 reference 契约的文档会话结束或 WI 关单前，运行 `npm run docs:verify`。完整审计见 [doc-drift-audit.zh.md](agent/doc-drift-audit.zh.md)。

## 9. 阶段（简化为两档）

`ACTIVE.md` 中每项工作处于：

- **准备** — 范围、gate、契约或讨论；尚未做功能实现。
- **建造** — 写代码与验证。

更细的顺序（先契约后 UI 等）由 agent 按工作项决定，必要时写入 `ACTIVE.md`。

## 维护（会话契约摘要）

实质性修改 §5–§8 时，须在同一变更集更新 [`ACTIVE.md`](../../ACTIVE.md) 顶部的 **Agent 会话契约** 表，以便维护者只 @ `ACTIVE.md` 时摘要仍准确。
