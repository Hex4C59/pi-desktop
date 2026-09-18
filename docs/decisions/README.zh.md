# 架构决策记录索引

[English](README.md) | 中文

- 类型：Reference
- 状态：Accepted
- 翻译状态：Machine Draft
- 权威原文：[README.md](README.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 创建日期：2026-09-18
- 最近评审：2026-09-19
- 权威范围：ADR 导航和编号规则
- 维护规范：[文档组织与维护规范](../document-conventions.md)

本目录保存影响系统边界、安全和信任模型、持久化、公共 contract，或难以逆转的重要决定。

## 编号和命名

ADR 使用四位连续编号和小写 kebab-case：

```text
0001-build-baseline.md
0002-runtime-host.md
```

Gate 状态（Open / In spike / Accepted）以 [architecture-gates.zh.md](../reference/architecture-gates.zh.md) 为唯一权威。本索引只登记 **ADR 文件**。

## Accepted ADRs

| 编号 | 标题 | 关闭的 gate | 文件 |
|------|------|-------------|------|
| — | *（尚无）* | — | — |

## Pending ADR

维护者已确认决定但 ADR 尚未写入仓库。与 [`ACTIVE.md`](../../ACTIVE.md) 的 `Decision: pending-adr` 对应。

| 编号 | Gate | ACTIVE WI | 备注 |
|------|------|-----------|------|
| — | — | — | *（空）* |

## Expected queue（非 ADR）

仅为计划编号提示——**维护者在 spike/讨论确认之后才创建 Accepted ADR 文件**。

| 计划编号 | Gate | ACTIVE | 何时创建文件 |
|----------|------|--------|----------------|
| `0001-build-baseline` | `gate-build-baseline` | WI-001 | WI-001 spike 验收通过且维护者确认基线（如 Forge + Vite 方案 A）后 |
| `0002-runtime-host` | `gate-runtime-host` | WI-003（排队） | runtime-host spike 与维护者确认后 |
| *（待定）* | 其余 5 个 gate | — | 各 gate 须各自 Accepted ADR 关闭 |

## 创建条件

只有决定符合以下至少一项时才创建 ADR：

- 改变系统、进程或模块边界；
- 改变安全、信任或权限模型；
- 改变持久化格式或公共 contract；
- 很难或代价很高地逆转；
- 拒绝了多个有竞争力的方案；
- 新成员以后很可能询问“为什么这样做”。

普通 UI 文案、组件命名和局部实现细节不创建 ADR。

## 何时写 ADR

在维护者**确认决定之后**写 ADR——不是在 agent 首次提出方案时。

| 触发条件 | 是否需要 ADR |
|----------|----------------|
| 关闭 [架构 gate](../reference/architecture-gates.zh.md)（`Open` → `Accepted`） | **是** — Accepted ADR，正文或元数据含 gate ID |
| 维护者在难以反悔的多个方案中作出选择 | **是** |
| 锁定公共 contract（IPC 面、持久化格式、任务 ID、事件 envelope） | **是** |
| 改变安全或项目 trust 模型 | **是** |
| PRD 或架构写明「须 spike/ADR 后才能实现」 | **是**，且在声称已实现之前 |
| 仍在头脑风暴、spike 未完成、gate 仍为 `In spike` | **否** — 用 `docs/discussions/`、spike 记录或 `ACTIVE.md` |
| 局部实现细节、易于修改 | **否** |

### 讨论、spike 与 ADR

| 产物 | 用途 | 时机 |
|------|------|------|
| `docs/discussions/` | 过程、选项、理由 | 实质性争论；不作实现依据 |
| Spike 证据 | 命令、成败、阻塞 | spike 工作项期间或之后；ADR 中链接 |
| ADR `docs/decisions/000x-….md` | **已确认**的决定与后果 | 维护者批准（如「可以」「按 A 做」）且满足上表触发条件时 |

带 gate 的主题常见顺序：讨论或 WI 讨论稿 → 维护者批准做法 → spike（若需要）→ 维护者确认结果 → **写 Accepted ADR** → 更新 [架构 gate 表](../reference/architecture-gates.zh.md) → 继续建造。

spike 失败或未决时不得写 Accepted ADR。gate 保持 `Open` 或 `In spike`，证据写在工作项或讨论中。

### ADR 文档模板

创建 `000n-short-title.md`（英文权威；配对时增加 `000n-short-title.zh.md`）。建议章节：

```markdown
# ADR 000n: Title

- Type: Decision
- Status: Accepted
- Created: YYYY-MM-DD
- Gate: gate-id（若适用）
- Supersedes: none | ADR 000x
- Related: 架构章节、ACTIVE WI-xxx、讨论链接

## Context
## Decision
## Consequences
## Spike evidence（链接或摘要）
```

ADR 保持简短（约一屏）。细节放在架构、`docs/modules/` 或 `docs/reference/`。

### 速查

```
要关闭架构 gate？ ──是──→ 必须 Accepted ADR
        │否
已在难反悔方案中选定？ ──是──→ 需要 ADR
        │否
锁定 IPC / 持久化 / 安全模型？ ──是──→ 需要 ADR
        │否
        └──→ 不写 ADR（讨论 / spike / 代码即可）
```

在 [architecture-gates.zh.md](../reference/architecture-gates.zh.md) 维护 gate 状态；Accepted ADR 须在表中链接。
