# Agent 约束 playbook 索引

[English](README.md) | 中文

- 类型：Guide
- 状态：Accepted
- 创建：2026-09-19
- 上次评审：2026-09-19
- 适用：实现 pi-desktop 的 coding agent 与维护者
- 权威范围：根目录 [`AGENTS.md`](../../../AGENTS.md) 加载地图引用的详细 agent 约束；在其主题范围内与内核同等约束
- 相关：[协作指南](../agent-collaboration.zh.md)、[`ACTIVE.md`](../../../ACTIVE.md)
- 权威原文：[Agent constraint playbooks](README.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

内核 [`AGENTS.md`](../../../AGENTS.md) 始终加载。以下 playbook 通过内核加载地图、[路径触发](path-triggers.zh.md) 与会话上下文（`ACTIVE.md`）**按需**加载。

## 仓库 Skill（Cursor）

| Skill | 何时 |
|-------|------|
| [pi-desktop-handoff](../../../.agents/skills/pi-desktop-handoff/SKILL.md) | 新会话开场；WI / 会话收尾（`docs:verify`、漂移审计、gate、Last session） |

权威仍在 playbook 与 `ACTIVE.md`；Skill 仅为薄路由。

## Playbook 列表

| Playbook | 何时阅读 |
|----------|----------|
| [path-triggers.zh.md](path-triggers.zh.md) | 编辑匹配的源码或 `docs/` 路径前（见触发表） |
| [judgment.zh.md](judgment.zh.md) | 做/不做、「还能做什么」「我理解对吗」；如实回答、不凑项 |
| [doc-drift-audit.zh.md](doc-drift-audit.zh.md) | 定期或 WI 收尾后的文档漂移审计（先 `npm run docs:verify`） |
| [change-policy.zh.md](change-policy.zh.md) | 重构、破坏性目录/依赖/IPC 变更 |
| [boundaries.zh.md](boundaries.zh.md) | 跨层实现；流式、adapter、runtime 生命周期 |
| [pi-integration.zh.md](pi-integration.zh.md) | pi SDK、RPC、会话、adapter、包升级 |
| [security.zh.md](security.zh.md) | IPC、preload、凭据、信任、shell、日志、不可信内容 |
| [code-style.zh.md](../code-style.zh.md) | 代码风格宪章（价值观、命名、边界、注释） |
| [code-review.zh.md](../code-review.zh.md) | 维护者验收 agent 交付时的通过/不通过清单 |
| [typescript.zh.md](typescript.zh.md) | Agent 可执行 TypeScript 清单 |
| [ui.zh.md](ui.zh.md) | Renderer、组件、布局、无障碍 |
| [testing.zh.md](testing.zh.md) | 测试、fixture、完成前验证 |
| [commands.zh.md](commands.zh.md) | `package.json` scripts、CI、开发/构建/打包命令 |
| [documentation.zh.md](documentation.zh.md) | 创建或重组仓库文档 |

用户可见行为与系统结构仍以 `product-requirements.md` 与 `architecture/electron-architecture.md` 为准，不在本目录重复定义。
