# ADR 0001: Build and packaging baseline

English | [中文](0001-build-baseline.zh.md)

- Type: Decision
- Status: Accepted
- Created: 2026-09-19
- Gate: `gate-build-baseline`
- Supersedes: none
- Related: [architecture §21](../architecture/electron-architecture.md), [WI-001](../../ACTIVE.md), [desktop-framework-options](../desktop-framework-options.md)

## Context

The first usable release targets **Electron + React + Vite + TypeScript strict** on Linux. Architecture §21 requires a packaged spike before treating the toolchain as decided: dev shell, production package, Electron Node version check, pinned pi SDK load, minimal runtime without real models, and clean exit.

[WI-001](../../ACTIVE.md) evaluated **option A** (npm + Electron Forge + Vite) versus a custom Vite + electron-builder path. The maintainer confirmed option A and accepted the spike on 2026-09-19.

## Decision

1. **Package manager and toolchain**: **npm** with a committed lockfile; **Electron Forge 7.11.2** with the **Vite** plugin; **React** renderer; **TypeScript strict** (`tsc --noEmit`).
2. **Pinned direct versions** (representative; see `package.json` / lockfile): **Electron 44.4.3**, **@earendil-works/pi-coding-agent 0.85.1**, Forge/Vite/React pins as declared in the repo.
3. **Mechanical quality**: **ESLint + Prettier** via `npm run check` (format, lint, typecheck). CI must call the same scripts when app CI is added.
4. **Source layout**: `src/main/`, `src/preload/`, `src/renderer/` per architecture §20; Forge entries at `src/main/bootstrap/main.ts` and `src/preload/preload.ts`.
5. **Packaging**: `npm run package` (Forge `electron-forge package`). ASAR enabled with `asar.unpack` for `**/*.{node,wasm}`; **@electron-forge/plugin-auto-unpack-natives** enabled. Makers include deb/rpm/zip for later Linux evaluation; WI-001 did not require install-level RPM/deb acceptance.
6. **pi SDK in production main**: Load pinned `@earendil-works/pi-coding-agent` in the main process. Because `@electron-forge/plugin-vite` packages **only** the `.vite/` output into the app, the spike **bundles** pi SDK (and its JS graph) into the main Vite build rather than relying on `node_modules` inside the ASAR. Native/WASM assets use unpack rules above.
7. **Host Node**: `package.json` `engines.node` is `>=22.19.0` for developer tooling; runtime authority is **Electron’s built-in Node**, checked at startup against the pinned pi SDK minimum.
8. **Rejected for now**: **electron-builder**-first custom pipeline (option B) and **`"type": "module"`** in root `package.json` (conflicts with Forge’s CJS main bundle unless renamed; renderer Vite config uses `vite.renderer.config.mts` instead).

## Consequences

- New app dependencies and scripts must stay compatible with Forge Vite’s “bundle into `.vite/`” packaging model until an explicit follow-up ADR changes it.
- pi SDK upgrades require re-running the packaged spike (`npm run package` + launch) and watching bundle size, ESM, WASM, and native modules.
- Runtime process model (main vs child) remains **undecided** (`gate-runtime-host`); this ADR does not place long-lived pi sessions in product features yet beyond WI-001 probe code.
- Documented commands live in [README.md](../../README.md); keep them aligned with `package.json`.

## Spike evidence

- **Commands (maintainer accepted 2026-09-19)**: `npm run check`, `npm test`, `npm run dev` (empty shell window), `npm run package`, run `out/pi Desktop-linux-x64/pi Desktop`.
- **Node check**: log line `Electron Node 24.21.0 (pi SDK requires >= 22.19.0): ok` (exact Electron Node may vary with Electron pin).
- **pi SDK**: log line `pi SDK spike probe ok` after `createAgentSession` with `SessionManager.inMemory()` and `session.dispose()` without `prompt()`.
- **Implementation**: `src/main/pi/spike-probe.ts`, `src/main/platform/node-version.ts`; Forge config `forge.config.ts`, `vite.main.config.ts` (default bundle), `vite.renderer.config.mts`.
