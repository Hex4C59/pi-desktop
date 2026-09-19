# pi Desktop

English | [中文](README.zh.md)

A Linux desktop client for [pi](https://github.com/earendil-works/pi).

The project aims to provide a graphical interface suited to everyday development work while preserving pi's core capabilities and extension system. Planned capabilities include streaming conversations, tool execution visibility, session management, model switching, and working-directory management.

> Current status: initialization phase. A WI-001 Electron Forge + Vite scaffold exists (`npm run dev` / `npm run package`); product features and a release are not shipped yet.

## Goals

- Provide a native Linux desktop experience.
- Reuse pi's agent, model, tool, session, and resource-loading capabilities instead of implementing another agent runtime.
- Preserve pi's streaming output, thinking levels, message queues, context compaction, and tree-structured session semantics.
- Remain compatible with existing `~/.pi/agent` configuration and clearly display the current working directory, model, token usage, cost, and tool activity.
- Isolate the desktop UI from the privileged agent runtime through an auditable process-communication boundary.

## First Usable Release

The first milestone plans to cover these workflows:

- Select and open a local project directory, including pi's project-trust flow.
- Create, resume, rename, and switch sessions.
- Send text and image messages while rendering text, thinking content, and tool calls in real time.
- Send steering or follow-up messages while a run is active, inspect the queue, and abort the current task.
- Select a provider, model, and thinking level.
- Render Markdown, code blocks, diffs, command output, errors, and retry or compaction states.
- Display context utilization, token usage, and cost statistics.
- Support basic interactions initiated by pi extensions, including selection, confirmation, input, editing, and notifications.

The first milestone does not include:

- Windows or macOS support.
- A remote agent service or multi-device synchronization.
- Reimplementing pi's providers, tools, or session file format.
- Describing an ordinary desktop process as a security sandbox.
- Pixel-level or feature-level parity with the pi TUI.

## Architecture Direction

The desktop application should remain a presentation layer for pi, with pi providing the core behavior:

```text
Desktop renderer
      |
      | typed, validated IPC
      v
Desktop host process
      |
      | pi SDK (preferred for a Node.js host)
      | or pi RPC subprocess (when process isolation is required)
      v
pi runtime -> providers / tools / sessions / project resources
```

Core principles:

1. The renderer does not receive direct access to Node.js, the shell, the filesystem, or provider credentials.
2. The host process owns the pi runtime lifecycle, subscription cleanup, process shutdown, and error recovery.
3. A Node.js/TypeScript host should prefer the `@earendil-works/pi-coding-agent` SDK for type safety and direct session APIs.
4. When a separate process boundary is required, use the `pi --mode rpc` JSONL protocol. The client must frame messages on `\n` and must not use a generic line reader that treats Unicode line separators as newlines.
5. Do not parse or rewrite pi session JSONL files directly. Use the session interfaces provided by the SDK or RPC protocol.
6. `@earendil-works/pi-client`, `pi-protocol`, and `pi-server` are currently marked experimental upstream and are not stable foundations for the first release.

Electron + React + Vite + TypeScript is the selected direction for the first release. The application is planned as a single instance with one main window that manages multiple projects and multiple concurrent top-level tasks. The renderer accesses the desktop host through a narrow, typed, and validated preload/IPC interface, and each top-level task owns an independent task/runtime/worktree boundary. Whether the pi runtime should run inside the Electron main process remains gated on a spike and an ADR. The application scaffold does not exist yet. See [`docs/architecture/electron-architecture.md`](docs/architecture/electron-architecture.md) (authoritative English; Chinese: [`docs/architecture/electron-architecture.zh.md`](docs/architecture/electron-architecture.zh.md)).

## Security Boundary

pi runs with the permissions of the user who launched it and can read or write files and execute commands. Project trust controls the loading of project-scoped configuration and extensions; it is not a system sandbox.

The desktop application must keep this boundary visible:

- Always display the working directory in which the agent is operating.
- Saved API keys, OAuth tokens, and authentication-file contents must not be returned to the renderer. Newly entered credentials may cross only a dedicated one-shot IPC boundary, must be cleared from UI state immediately after submission, and must not be written to frontend storage or ordinary logs.
- Treat model output, Markdown, tool output, and file contents as untrusted input and render them safely.
- Expose only explicitly allowlisted IPC operations and validate their parameters again in the host process.
- Use containers, virtual machines, or another operating-system isolation mechanism for untrusted repositories or unattended tasks.

## Upstream Reference

The development workspace is expected to check out the pi source repository beside this repository:

```text
parent/
├── pi/
└── pi-desktop/
```

If the reference source is not available locally, run:

```bash
git clone https://github.com/earendil-works/pi.git ../pi
```

Start with these upstream resources:

- `../pi/packages/coding-agent/docs/sdk.md`
- `../pi/packages/coding-agent/docs/rpc.md`
- `../pi/packages/coding-agent/docs/security.md`
- `../pi/packages/coding-agent/docs/session-format.md`
- `../pi/packages/coding-agent/examples/sdk/`

The sibling `../pi` checkout is for reading, debugging, and compatibility verification only. Production builds must not depend implicitly on that directory. Release dependencies must use package-manager versions recorded in the lockfile or artifacts managed explicitly by this project.

## Development

Prerequisites:

- Linux (target platform for now)
- Node.js `>= 22.19.0` (host tooling; packaged app uses Electron’s built-in Node)
- npm

```bash
npm install
npm run dev          # Electron Forge + Vite dev server, empty shell window
npm run package      # production bundle under out/ (WI-001 spike)
npm run check        # Prettier + ESLint + TypeScript (strict)
npm test             # unit + documentation tests
npm run docs:verify  # documentation structure + bilingual invariants
```

Mechanical style enforcement: **ESLint + Prettier** (`npm run check`). Judgment calls remain in [code-style.md](docs/guides/code-style.md).

Packaged builds log Electron’s `process.versions.node` and run a minimal in-memory pi SDK probe in the main process (no real model calls).

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) before contributing. Tests must not call real paid models; agent behavior should be verified with fake providers, fixtures, or controlled local substitutes.

Pull requests run `npm run docs:verify` in CI (see [`.github/workflows/docs.yml`](.github/workflows/docs.yml)).

## Roadmap

1. Establish the Linux development, testing, and packaging pipeline for the selected desktop stack.
2. Complete the pi runtime adapter and verify streaming events, tool calls, abort behavior, and error recovery.
3. Build the basic conversation UI, composer, and working-directory management.
4. Integrate model authentication, settings, and the session lifecycle.
5. Add tree-structured sessions, compaction, extension interactions, and accessibility support.
6. Produce reproducible Linux packages and establish a compatibility test matrix.

## License

This repository is licensed under the [MIT License](LICENSE).

## Relationship to pi

pi is the upstream agent harness; this project is an independent desktop client. The upstream source is licensed under the MIT License. That license applies to pi only; this repository's [LICENSE](LICENSE) covers pi-desktop code and documentation here.
