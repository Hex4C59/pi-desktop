# pi-desktop — Active work (跨会话状态)

English operational note: Living session state for humans and coding agents. Not a requirements or architecture authority. Full collaboration process: [Agent collaboration guide](docs/guides/agent-collaboration.md).

**新会话开场**：只 **@ 本文件** 即可（或说「继续 pi-desktop，先复述 ACTIVE 再提案」）。Agent 须遵守下文 **Agent 会话契约**，并阅读 `docs/guides/agent-collaboration.md`（见 [`AGENTS.md` — ACTIVE session pairing](AGENTS.md#active-session-pairing)）。可选：`.agents/skills/pi-desktop-handoff`。

## Agent 会话契约（摘要）

与 [agent-collaboration](docs/guides/agent-collaboration.md) §5–§8 对齐；**完整权威**以该指南为准。实质性修改 §5–§8 时须同步本摘要。

| 步骤 | Agent |
|------|--------|
| **开场** | 复述当前 WI、阶段（准备/建造）、Gate ID、Decision、Last session；今日建议焦点与验收步骤。 |
| **提案** | 简短计划 + **决策类** `none` \| `spike-only` \| `adr-after-approval`（含 gate ID 若适用）。维护者确认（如「可以」「按 A 做」）前不大规模改代码。 |
| **建造** | 读 [code-style](docs/guides/code-style.md) 与 [typescript](docs/guides/agent/typescript.md)；实现并跑 lint/typecheck/测试（适用时）。 |
| **收尾** | 更新下文 **Last session**。若已确认须写 ADR：起草/更新 `docs/decisions/000x-….md` 与 [architecture-gates](docs/reference/architecture-gates.md)，或 ACTIVE 标 `Decision: pending-adr`。应用代码由维护者按 [code-review](docs/guides/code-review.md) 验收。 |

- **WIP=1**：只推进 ACTIVE 中一个 WI；新想法进 **停车场**，不插队。
- **Gate**：未关闭的 gate 不得当作已交付能力；不得在未确认 spike 后写 Accepted ADR（见 [何时写 ADR](docs/decisions/README.md#when-to-write-an-adr)）。
- **文档**：关 WI 或文档重会话前运行 `npm run docs:verify`；完整漂移审计见 [doc-drift-audit](docs/guides/agent/doc-drift-audit.md)。

---

## 正在做（WIP=1）

| 字段 | 内容 |
|------|------|
| **ID** | WI-001 |
| **标题** | 工具链与打包 spike（Electron Forge + Vite + TypeScript） |
| **阶段** | 准备（讨论稿待确认；未开始写脚手架代码） |
| **PRD / 架构** | 架构 §21 打包约束、`docs/README` 架构 gate「npm + Electron Forge/Vite」 |
| **Gate ID** | `gate-build-baseline` |
| **Decision** | `none`（spike 完成且你确认基线后 → `pending-adr` 或 `0001-…`） |
| **决策类（提案用）** | `adr-after-approval` — 见 `docs/decisions/README.md#when-to-write-an-adr` |

**一句目标**：在 Linux 上能 `dev` 起空窗、`build` 产出可启动包，主进程能加载 pinned 的 `@earendil-works/pi-coding-agent` 并做最小 runtime 探测（不调真实模型），且能干净退出。

---

## 今天 / 当前焦点

- [ ] 产品负责人确认 WI-001 讨论稿（回复「可以」后进入「建造」）
- [ ] （建造阶段再填）实现与自动检查
- [ ] （建造阶段再填）手动验收

---

## WI-001 讨论稿（待拍板）

### 目标

验证架构选型的 **Electron + React + Vite + TypeScript strict** 能否在 pi-desktop 仓库内落地，并满足架构文档 §21「scaffold phase packaged spike」的最小路径：打包 → 启动生产 main → 检查 Node 版本 → import pinned pi SDK → 创建最小 runtime（不调用真实模型）→ 验证 ESM/资源/原生依赖/ASAR 等风险点 → 干净释放。

### 方案（二选一，默认 A）

| | 方案 A（推荐） | 方案 B |
|---|----------------|--------|
| **内容** | **npm** + **Electron Forge** + **Vite** 官方/社区模板（与 `electron-architecture` §21 一致） | 自定义 Vite 多入口 + `electron-builder` 等（见 `desktop-framework-options` 调研） |
| **优点** | 与当前 Proposed 架构一致；Forge 与 Electron 版本绑定清晰 | 构建链更灵活 |
| **缺点** | 复杂发布时可能要自定义 hook | 偏离架构默认路径；需额外 ADR 说明为何不选 Forge |
| **建议** | **首版 spike 用 A**；仅当 A 无法加载 pi SDK 时再评估 B |

### 验收（3 条）

1. **开发**：文档化的命令能在本机启动应用并显示空主窗口（无业务 UI 要求）。
2. **生产**：`build`/`package` 产出能在本机启动；启动日志或受控 IPC/关于页可核对 `process.versions.node` 与 Electron 内置 Node 满足 pinned pi 的最低要求。
3. **pi SDK**：生产 main 进程中能 `import` pinned 的 `@earendil-works/pi-coding-agent`，完成 spike 约定的最小 runtime 创建与 dispose/terminate，**不调用付费/真实模型**；若 ASAR/ESM/native 失败， spike 报告必须写明阻塞点与建议（换 unpack、externalize、子进程等），不得静默假装成功。

### 明确不在 WI-001

- IPC 业务、pi 会话 UI、多任务、worktree、认证流程
- 关闭 runtime 进程模型 ADR（WI-003）
- Linux RPM/deb 安装级验收（可放在后续 WI， spike 先保证产物能本地启动）

### ADR 收尾（`gate-build-baseline`）

Gate 状态见 [`docs/reference/architecture-gates.md`](docs/reference/architecture-gates.md)（当前 `In spike`）。**不要**在 spike 未通过或维护者未确认前写 Accepted ADR。

1. Spike 实现完成，维护者验收通过（上节 3 条）。
2. 维护者确认基线（如「按方案 A」）。
3. Agent 起草 `docs/decisions/0001-build-baseline.md`（+ `.zh.md`；见 [`decisions/README.md`](docs/decisions/README.md) Expected queue），Status **Accepted**，Gate `gate-build-baseline`，含 Spike evidence。
4. 更新 `architecture-gates`：`gate-build-baseline` → `Accepted`，ADR 列链接 0001。
5. 更新 [`docs/decisions/README.md`](docs/decisions/README.md) Accepted ADRs 表；本文件 `Decision` → `0001-build-baseline`。

---

## 排队（从上到下）

1. **WI-001** — 工具链与打包 spike（当前）
2. **WI-002** — IPC 安全壳（preload allowlist、host 校验、Renderer 无 Node）；契约：[`ipc-channels`](docs/reference/ipc-channels.md) → `Living`
3. **WI-003** — Runtime 进程模型 spike → ADR（Main vs utility/child）
4. **WI-004** — 单任务假 provider 流式闭环（发消息 → 流式 → abort）
5. **WI-005** — 打开本地项目 + project trust 最小路径

更远：多任务 registry、持久化 schema、worktree、result/apply 等 → 对齐 `product-requirements` §2.2 / §5。

---

## 停车场

- （乱入想法一行一条；实现前不插队 WIP）

---

## Last session

| 字段 | 内容 |
|------|------|
| **日期** | 2026-09-19 |
| **做了什么** | 新会话只 @ ACTIVE；会话配对写入 `AGENTS.md`（无 `.cursor`）；保留顶部 **Agent 会话契约** 摘要。 |
| **如何验收** | 只 @ `ACTIVE.md` +「继续 pi-desktop」；agent 应复述 WI 并读 `agent-collaboration`（`AGENTS.md` 已约束）。 |
| **下一会话建议** | 回复「可以」启动 WI-001 建造。 |
