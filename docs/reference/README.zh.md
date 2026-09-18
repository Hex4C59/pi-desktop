# Reference 索引（查询与契约）

[English](README.md) | 中文

- 类型：Reference
- 状态：Accepted
- 创建：2026-09-19
- 上次评审：2026-09-19
- 适用：`docs/reference/` 下稳定查询资料
- 权威范围：导航与契约文档状态；状态为 `Outline` 或 `Living` 时契约**事实**以此为准
- 相关：[文档索引](../README.zh.md)、[`architecture/electron-architecture.zh.md`](../architecture/electron-architecture.zh.md)、[`modules/README.zh.md`](../modules/README.zh.md)
- 权威原文：[Reference index](README.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 其他 reference 文档

| 文档 | 用途 |
|------|------|
| [glossary.zh.md](glossary.zh.md) | 配对文档术语 |
| [architecture-gates.zh.md](architecture-gates.zh.md) | Gate ID 与状态（gate 唯一权威） |

关闭 gate 须 Accepted ADR——见 [decisions/README.zh.md](../decisions/README.zh.md)。契约页**不**关闭 gate。

## 实现契约（目录）

记录**代码必须对齐的内容**（IPC allowlist、DTO、状态、磁盘布局）。源于架构与 ADR，不替代它们。

| Contract ID | 文件 | 状态 | 何时填入 | Gate / WI | 模块 owner |
|-------------|------|------|----------|-----------|------------|
| `contract-ipc` | [ipc-channels.zh.md](ipc-channels.zh.md) | `Planned` | 首个 allowlist channel 落地 | WI-002 | [ipc-registration](../modules/ipc-registration.zh.md) |
| `contract-events` | [domain-events.zh.md](domain-events.zh.md) | `Planned` | 单任务流式切片 | WI-004（排队） | Adapter / `TaskEventStream`（见 [modules](../modules/README.zh.md)） |
| `contract-states` | [task-and-runtime-states.zh.md](task-and-runtime-states.zh.md) | `Planned` | 与 domain events 同期或略早 | WI-004（排队） | `TaskRuntimeController`、Renderer |
| `contract-persistence` | [persistence-layout.zh.md](persistence-layout.zh.md) | `Planned` | 持久化 ADR 之后 | `gate-task-persistence`、apply journal gate | `TaskRegistry`、持久化适配器 |

### 契约文档状态

| 状态 | 含义 |
|------|------|
| `Planned` | 仅外壳——**不是**实现依据 |
| `Outline` | 结构与架构链接；表格部分填写 |
| `Living` | 与 `src/shared/contracts` 及测试在同一变更集内同步 |
| `Superseded` | 已替代；保留历史 |

## 权威链

```text
electron-architecture + Accepted ADR
        ↓（摘要 + 链接，不复制大段）
docs/modules/*（所有权、排除项、测试）
        ↓
docs/reference/* 契约（形状、枚举、channel、路径）
        ↓（Living 时同 PR）
src/shared/contracts + schema/契约测试
```

## 维护规则

1. 增改 IPC、领域事件、任务/runtime 状态或持久化产物时，一旦契约页为 `Outline`/`Living`，须在**同一变更**中更新对应 reference。
2. 链接架构章节而非复制；架构或 ADR 变更时改契约页。
3. `Planned` 页不得编造 channel 名、路径或 schema 版本。
4. `persistence-layout` 单文件两节（task store；apply journal）；apply 节在 `gate-apply-journal` 定案前保持空白。

## Agent 与维护者

- 实现 IPC：WI-002 推进时读 [ipc-channels.zh.md](ipc-channels.zh.md)（及 [security playbook](../guides/agent/security.zh.md)）。
- Adapter/Renderer DTO：WI-004 推进时读 [domain-events](domain-events.zh.md)、[task-and-runtime-states](task-and-runtime-states.zh.md)。
- 内核加载地图：[AGENTS.zh.md](../../AGENTS.zh.md)。
- 自动检查：`npm run docs:verify`；语义审计：[doc-drift-audit playbook](../guides/agent/doc-drift-audit.zh.md)。
