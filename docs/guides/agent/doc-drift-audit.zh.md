# Agent playbook：文档漂移审计

[English](doc-drift-audit.md) | 中文

- 类型：Guide
- 状态：Accepted
- 创建：2026-09-19
- 上次评审：2026-09-19
- 适用：定期或里程碑文档一致性审查
- 权威范围：审计流程与报告格式；未经维护者批准不得改变产品或架构结论
- 相关：[documentation playbook](documentation.zh.md)、[reference 索引](../../reference/README.zh.md)
- 权威原文：[doc-drift-audit.md](doc-drift-audit.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 目的

维护者无法手动重读全部文档。先跑 **自动化检查**，再由 **Agent 审计**脚本看不到语义漂移。

## 步骤 1 — 自动验证（必做）

仓库根目录：

```bash
npm run docs:verify
```

包含：

- **结构 verify** — 断链、gate 与 ADR、契约目录与文件 `Status`、ADR 索引与磁盘、archive 模块链接警告
- **docs:i18n:check** — 双语对与翻译元数据

报告完成前须修复全部 **error**。**warning** 写入审计报告并建议处理。

## 步骤 2 — 范围（不要审计全部）

| 优先级 | 文档 | Agent 检查 |
|--------|------|------------|
| P0 | [architecture-gates](../../reference/architecture-gates.zh.md)、[decisions/README](../../decisions/README.zh.md)、[ACTIVE](../../../ACTIVE.md) | 状态、WI、Decision、ADR 链接互一致 |
| P1 | [reference/README](../../reference/README.zh.md) + `Outline`/`Living` 契约 | 目录状态、表与架构 §8 / modules 索引 |
| P2 | [modules/README](../../modules/README.zh.md) | owner 与架构 §8.1 抽样对照 |
| P3 | PRD、架构 | 仅当 WI 声称对齐时；抽 WI 相关章节 |
| 跳过 | `Planned` 契约外壳、`archive/*`、`discussions/*` | 除非被当作当前权威（脚本会对 archive 模块链报警） |

审计期间 **不要**重写 PRD/架构正文；只记录发现，另开变更。

## 步骤 3 — 与代码对齐（存在 `src/` 时）

- `Status: Living` 的契约页对照 `src/shared/contracts` 与相关测试。
- 代码已有而契约仍为 `Planned`：建议单独 WI 升级目录与契约页，勿擅自标 Living。

## 步骤 4 — 审计报告

新建或追加 dated 报告（维护者定位置）：

- **推荐**：`docs/reference/doc-audit-YYYY-MM-DD.md`
- **或**：相关 `docs/discussions/*.md` 短节

```markdown
# Documentation drift audit — YYYY-MM-DD

- WI / trigger: …
- docs:verify: pass | fail（粘贴 error 摘要）
- Agent: …

## Blockers
- …

## Should fix
- …

## Info / deferred
- …

## Confirmed aligned (sample)
- …
```

未通过 `npm run docs:verify` 且未经维护者同意，不得声称 blocker 已修复。

## 步骤 5 — 交给维护者

1. `docs:verify` 退出码与摘要  
2. 报告路径  
3. should-fix 项建议写入 ACTIVE/停车场（仅标题）

修改权威文档或代码前须维护者确认。

## 何时跑

- 关闭涉及文档/IPC/模块/gate/ADR 的 WI 后  
- 将契约标为 `Living` 前  
- 维护者要求「文档漂移审计」时  

## 维护者提示词

```text
运行 pi-desktop 文档漂移审计：先执行 npm run docs:verify 并修复所有 error，再按 docs/guides/agent/doc-drift-audit.zh.md 的 P0–P2 范围检查，输出分级报告（不要未经确认修改 PRD/架构正文）。
```
