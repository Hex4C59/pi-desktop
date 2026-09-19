# ADR 0001：构建与打包基线

[English](0001-build-baseline.md) | 中文

- 类型：Decision
- 状态：Accepted
- 翻译状态：Machine Draft
- 权威原文：[0001-build-baseline.md](0001-build-baseline.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 创建日期：2026-09-19
- Gate：`gate-build-baseline`
- 取代：无
- 相关：[架构 §21](../architecture/electron-architecture.zh.md)、[WI-001](../../ACTIVE.md)、[desktop-framework-options](../desktop-framework-options.zh.md)

## 背景

首版目标为 Linux 上的 **Electron + React + Vite + TypeScript strict**。架构 §21 要求在将工具链视为已定前完成打包 spike：开发壳、生产包、Electron Node 版本检查、加载 pinned pi SDK、不调用真实模型的最小 runtime、干净退出。

[WI-001](../../ACTIVE.md) 在 **方案 A**（npm + Electron Forge + Vite）与自定义 Vite + electron-builder 之间评估；维护者确认方案 A，并于 2026-09-19 验收通过 spike。

## 决定

1. **包管理与工具链**：**npm** 并提交 lockfile；**Electron Forge 7.11.2** + **Vite** 插件；**React** 渲染层；**TypeScript strict**（`tsc --noEmit`）。
2. **直接依赖固定版本**（代表性条目见 `package.json` / lockfile）：**Electron 44.4.3**、**@earendil-works/pi-coding-agent 0.85.1**，以及仓库中声明的 Forge/Vite/React 等 pin。
3. **机械质量门禁**：**ESLint + Prettier**，经 `npm run check`（format、lint、typecheck）；未来应用 CI 须调用相同脚本。
4. **源码布局**：按架构 §20 使用 `src/main/`、`src/preload/`、`src/renderer/`；Forge 入口为 `src/main/bootstrap/main.ts` 与 `src/preload/preload.ts`。
5. **打包**：`npm run package`（Forge `electron-forge package`）。启用 ASAR，`asar.unpack` 包含 `**/*.{node,wasm}`；启用 **@electron-forge/plugin-auto-unpack-natives**。Maker 含 deb/rpm/zip 供后续 Linux 评估；WI-001 不要求 RPM/deb 安装级验收。
6. **生产 main 中的 pi SDK**：在主进程加载 pinned `@earendil-works/pi-coding-agent`。因 `@electron-forge/plugin-vite` 仅将 **`.vite/`** 产出打入应用，spike 将 pi SDK（及其 JS 依赖图）**打入** main 的 Vite 构建，而非依赖 ASAR 内的 `node_modules`。原生/WASM 资源依赖上述 unpack 规则。
7. **宿主 Node**：`package.json` 的 `engines.node` 为 `>=22.19.0`（开发工具链）；运行时以 **Electron 内置 Node** 为准，启动时对照 pinned pi SDK 最低要求检查。
8. **当前不采用**：以 **electron-builder** 为主的路径（方案 B）；根 `package.json` 的 **`"type": "module"`**（与 Forge 默认 CJS main 产物冲突；渲染层 Vite 配置使用 `vite.renderer.config.mts`）。

## 后果

- 新增应用依赖与脚本须兼容 Forge Vite「仅打包 `.vite/`」模型，除非后续 ADR 明确变更。
- 升级 pi SDK 须重跑打包 spike（`npm run package` 并启动），关注体积、ESM、WASM 与原生模块。
- Runtime 进程模型（main vs 子进程）仍 **未决**（`gate-runtime-host`）；本 ADR 除 WI-001 探测代码外，不将长期 pi 会话视为已交付能力。
- 文档化命令见 [README.zh.md](../../README.zh.md)；须与 `package.json` 同步。

## Spike 证据

- **命令（维护者 2026-09-19 验收）**：`npm run check`、`npm test`、`npm run dev`（空壳窗口）、`npm run package`，运行 `out/pi Desktop-linux-x64/pi Desktop`。
- **Node 检查**：日志 `Electron Node 24.21.0 (pi SDK requires >= 22.19.0): ok`（随 Electron pin 变化）。
- **pi SDK**：在 `createAgentSession` + `SessionManager.inMemory()` 且未调用 `prompt()` 后 `session.dispose()`，日志 `pi SDK spike probe ok`。
- **实现**：`src/main/pi/spike-probe.ts`、`src/main/platform/node-version.ts`；`forge.config.ts`、`vite.main.config.ts`（默认打包）、`vite.renderer.config.mts`。
