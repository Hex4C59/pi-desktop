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
| **ID** | WI-003 |
| **标题** | Runtime 进程模型 spike → ADR（Main vs utility/child） |
| **阶段** | 准备（讨论稿待确认） |
| **PRD / 架构** | 架构 runtime 宿主、`gate-runtime-host`、[`architecture-gates`](docs/reference/architecture-gates.md) |
| **Gate ID** | `gate-runtime-host` |
| **Decision** | `none` |
| **决策类（提案用）** | `adr-after-approval` |

**一句目标**：用 spike 验证 pi runtime 应驻留 Electron Main 还是 utility/child，并产出 Accepted ADR `0002-runtime-host`。

---

## 今天 / 当前焦点

- [x] WI-001 维护者验收通过；`gate-build-baseline` → Accepted（[ADR 0001](docs/decisions/0001-build-baseline.md)）
- [x] WI-002 讨论稿；维护者「可以」
- [x] WI-002 维护者验收通过（2026-09-19）
- [ ] WI-003 讨论稿与维护者确认

---

## WI-002（已关闭）

- **契约**：[`ipc-channels`](docs/reference/ipc-channels.md) → **Outline**（壳层 `app:getVersions`、`app:ping`）
- **验收**：维护者 2026-09-19 确认通过（`dev` / 版本 + ping）

---

## WI-002 讨论稿（归档；已确认 2026-09-19）

### 目标

在 WI-001 脚手架之上落地 **Phase 1「Secure shell」** 的 IPC 骨架（见架构 §23 Phase 1）：固定 allowlist、Main 侧运行时校验、Preload 窄 API、可测试的拒绝路径。**不**交付 pi 会话、任务、凭证或文件能力。

满足架构 §18.2：无动态通道、无通用 `invoke(channel, payload)` 透传、错误面向用户可理解且不泄露密钥/栈为主 UI 文案。

### 方案（默认 A）

| | 方案 A（推荐） | 方案 B |
|---|----------------|--------|
| **内容** | **`ipcMain.handle` + `invoke`**；通道名固定字符串常量；payload/result 在 `src/shared/contracts/`；Main 用 **TypeBox**（或同类 JSON schema）校验 `unknown` 入参 | Preload 内封装 `invoke`，但 Renderer 仍拿到字符串通道名自行组合 |
| **优点** | 与架构、[`ipc-registration`](docs/modules/ipc-registration.md) 一致；契约表可逐行对照 | 实现略快 |
| **缺点** | 需同步维护契约表与注册表 | Renderer 易扩散通道字符串，审计差 |
| **建议** | **WI-002 用 A**；Preload 只暴露 `window.piDesktop.*` 方法，内部映射到固定 `invoke` |

**Preload 与同步 API**：WI-001 在 preload 直接读 `process.versions`。WI-002 **改为** 版本信息经 **`app:getVersions` invoke** 由 Main 返回（单一模式）；移除 Renderer 对 Node 能力的任何暴露。Preload 仅 `contextBridge` + 类型声明（`src/preload/` + 可选 `src/shared/contracts/preload-api.ts`）。

**注册与生命周期**：`src/main/ipc/` 提供 `registerIpcHandlers()`（或等价模块），在 `app.whenReady` 窗口创建前调用一次；`window-all-closed` / `before-quit` 时注销 handler（避免重复注册）。未知通道在 Main **不注册**即无法调用。

### 首批通道（仅壳层，WI-002）

| Channel | 方向 | Preload API | 说明 |
|---------|------|-------------|------|
| `app:getVersions` | Renderer → Main | `piDesktop.getVersions()` | 返回 `{ node, electron, chrome }`（来自 Main `process.versions`，非 Renderer 直读） |
| `app:ping` | Renderer → Main | `piDesktop.ping()` | 固定 `{}` 入参；返回 `{ ok: true }`，用于连通性与测试 |

- **错误模型（首版）**：校验失败 / 未知内部错误 → 结构化 reject（如 `{ code: 'INVALID_INPUT' \| 'INTERNAL', message: string }`），无堆栈进 Renderer。
- **事件推送**：WI-002 **不做** `webContents.send` 订阅流；留待 WI-004+，仅在契约页注明「后续 channel 行」。

建造时同步更新 [`ipc-channels.md`](docs/reference/ipc-channels.md)（+ `.zh.md`）：Status **Planned → Outline**，填入上表行；实现完成后若稳定可升为 **Living**（本 WI 至少达到 Outline + 代码一致）。

### 代码布局（建造时）

```text
src/main/ipc/           # 注册、校验、handler 实现
src/preload/            # contextBridge 窄 API（已有目录，扩展）
src/shared/contracts/   # 通道名常量、TypeBox schema、结果/错误类型
```

- Renderer **禁止** `import` electron / Node / pi SDK（靠 ESLint `import/no-restricted-paths` 或等价规则在本 WI 引入）。
- Main **禁止** 未在注册表登记的 `ipcMain.handle`。

### 验收（4 条）

1. **开发**：`npm run dev` 启动；Renderer 调用 `getVersions` / `ping` 成功（可在空壳 UI 显示版本或仅 devtools 验证）。
2. **边界**：单元或集成测试证明：**畸形 payload** 被拒绝；**未注册通道名** 若被强行 `invoke` 则失败（测试可在 Main 侧或 `@electron/remote` 禁止的前提下用 preload 契约测试 / 主进程测试 harness）。
3. **生产**：`npm run package` 后启动，壳层 IPC 仍可用；`npm run check` 与 `npm test` 通过。
4. **文档**：`ipc-channels` 与实现一致；[`ipc-registration`](docs/modules/ipc-registration.md) stub 中「TBD 通道」改为指向契约表（不必写满未来业务通道）。

### 明确不在 WI-002

- pi 会话、prompt、流式事件、abort、模型列表、project open、project trust、worktree
- 凭证一次性 IPC（`credentials:*`）、附件、扩展 UI 请求
- `RequestScopeRegistry` 完整取消语义（可留接口占位，不声称已交付）
- 将 `ipc-channels` 标为 **Living** 并登记业务通道（留给后续 WI）
- 关闭 `gate-runtime-host`（WI-003）

### 建造前检查（Agent）

- 读 [security](docs/guides/agent/security.md)、[boundaries](docs/guides/agent/boundaries.md)、[typescript](docs/guides/agent/typescript.md)
- 维护者确认讨论稿（「可以」）后进入建造；**决策类** `none`（无新 ADR，除非你要求改安全模型并单独批准）

---

## WI-001（已关闭）

- **Gate**：`gate-build-baseline` → **Accepted** — [0001-build-baseline](docs/decisions/0001-build-baseline.md)
- **验收**：维护者 2026-09-19 确认通过（`dev` / `package` / pi SDK spike 日志）

---

## WI-001 讨论稿（归档）

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

1. **WI-003** — Runtime 进程模型 spike → ADR（当前）
2. ~~WI-002~~ — IPC 安全壳（已关闭）
3. ~~WI-001~~ — 工具链与打包 spike（已关闭，ADR 0001）
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
| **做了什么** | WI-002 验收通过；git 提交 IPC 安全壳；ACTIVE 切换至 WI-003。 |
| **如何验收** | `npm run check && npm test`；`ipc-channels` Outline 与代码一致。 |
| **下一会话建议** | 起草 WI-003 讨论稿（runtime 宿主 spike）。 |
