# Agent 路径触发（playbook 加载）

[English](path-triggers.md) | 中文

- 类型：Guide
- 状态：Accepted
- 创建：2026-09-19
- 上次评审：2026-09-19
- 适用：编辑本仓库文件的 coding agent（任意编辑器或宿主）
- 权威范围：按路径模式何时加载 agent playbook；不超出所链 playbook 与 [`AGENTS.md`](../../../AGENTS.md) 的约束
- 相关：[Playbook 索引](README.zh.md)、[加载地图](../../../AGENTS.zh.md#加载地图进入该区域前必读)
- 权威原文：[path-triggers.md](path-triggers.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

编辑匹配下表路径的文件前，须完整阅读对应 playbook。模式遵循 [`architecture/electron-architecture.zh.md`](../../architecture/electron-architecture.zh.md) §20 计划布局；仅当该布局或 Accepted ADR 变更时调整模式。

## 触发表

| 路径模式（示例） | 先读 | 提醒 |
|------------------|------|------|
| `src/**/adapter/**`、`src/**/main/**`、`src/**/preload/**`、`**/adapter/**`、`**/ipc/**` | [boundaries.zh.md](boundaries.zh.md) | Renderer 无 Node/shell/凭据；adapter → 可序列化事件；流式不变量 |
| `src/**/preload/**`、`src/**/main/**`、`**/*preload*`、`**/*ipc*` | [security.zh.md](security.zh.md) | Allowlist IPC；宿主校验；禁止通用宿主执行；trust 流程 |
| `src/**/adapter/**`、`**/*adapter*`、`**/*pi-*` | [pi-integration.zh.md](pi-integration.zh.md) | 默认 SDK；不读写 session JSONL；固定版本 |
| `src/**/renderer/**`、`**/*.tsx` | [ui.zh.md](ui.zh.md)、[boundaries.zh.md](boundaries.zh.md) | 开发工具 UX；流式布局稳定；renderer 不 import host/pi |
| `src/shared/**`、`**/contracts/**` | [reference/README.zh.md](../../reference/README.zh.md) | 契约页为 `Outline`/`Living` 时必读；勿依 `Planned` 外壳臆造 DTO |
| `**/*.{ts,tsx}`（应用源码，非仅文档） | [code-style.zh.md](../code-style.zh.md)、[typescript.zh.md](typescript.zh.md) | 信任边界；无单消费者抽象；注释写 why/不变量 |
| `**/*.test.*`、`**/*.spec.*`、`**/tests/**`、`**/__tests__/**` | [testing.zh.md](testing.zh.md) | fake/fixture；声称完成前跑检查 |
| `docs/**` | [documentation.zh.md](documentation.zh.md)、[document-conventions.zh.md](../../document-conventions.zh.md) | 更新索引；配对页英文权威 |

## 按任务触发（无路径）

工作项类型比路径更清楚时（gate、ADR、`ACTIVE.md` 的 WI 范围），用 [AGENTS.zh.md 加载地图](../../../AGENTS.zh.md#加载地图进入该区域前必读)。

## 维护

`src/` 布局重大变化时，应与架构 §20 或模块索引更新在同一变更集内修订本表。
