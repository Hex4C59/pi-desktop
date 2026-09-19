# pi Desktop

[English](README.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[README.md](README.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-19

面向 [pi](https://github.com/earendil-works/pi) 的 Linux 桌面客户端。

本项目希望在保留 pi 核心能力和扩展机制的前提下，提供适合日常开发工作的图形界面，包括流式对话、工具执行过程、会话管理、模型切换以及工作目录管理。

> 当前状态：初始化阶段。已有 WI-001 的 Electron Forge + Vite 脚手架（`npm run dev` / `npm run package`）；产品功能与正式发布尚未交付。

## 项目目标

- 提供 Linux 原生桌面使用体验。
- 复用 pi 的 agent、模型、工具、会话和资源加载能力，不重新实现一套 agent runtime。
- 保持 pi 的流式输出、思考级别、消息队列、上下文压缩和树状会话语义。
- 兼容用户已有的 `~/.pi/agent` 配置，并清楚展示当前工作目录、模型、token、费用和工具活动。
- 将桌面 UI 与高权限的 agent runtime 隔离，建立可审计的进程通信边界。

## 首个可用版本

首个里程碑计划覆盖以下工作流：

- 选择并打开本地项目目录，处理 pi 的项目信任流程。
- 创建、恢复、重命名和切换会话。
- 发送文本与图片消息，实时显示文本、思考内容和工具调用。
- 在运行期间发送 steering/follow-up 消息，查看队列并中止当前任务。
- 选择 provider、模型和 thinking level。
- 展示 Markdown、代码块、diff、命令输出、错误以及重试/压缩状态。
- 显示上下文占用、token 用量和费用统计。
- 支持 pi 扩展发起的基础交互，如选择、确认、输入、编辑和通知。

首个里程碑暂不包含：

- Windows 和 macOS 支持。
- 远程 agent 服务或多设备同步。
- 重写 pi 的 provider、工具或 session 文件格式。
- 将普通桌面进程描述成安全沙箱。
- 与 pi TUI 的像素级或功能级完全一致。

## 架构方向

桌面端应保持为 pi 的 presentation layer（呈现层），核心行为由 pi 提供：

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

基本原则：

1. 渲染层不直接访问 Node.js、shell、文件系统或 provider 凭据。
2. 宿主进程负责 pi runtime 的生命周期、订阅清理、进程退出和错误恢复。
3. Node.js/TypeScript 宿主优先使用 `@earendil-works/pi-coding-agent` SDK，以获得类型安全和直接的 session API。
4. 需要独立进程边界时，使用 `pi --mode rpc` 的 JSONL 协议；客户端必须按 `\n` 分帧，不能使用会把 Unicode 行分隔符当换行的通用 line reader。
5. 不直接解析或改写 pi 的 session JSONL 文件，使用 SDK/RPC 提供的会话接口。
6. `@earendil-works/pi-client`、`pi-protocol` 和 `pi-server` 当前在上游仍标记为 experimental，不作为首个版本的稳定基础。

首版已选择 Electron + React + Vite + TypeScript 作为技术方向。计划使用单实例、单主窗口管理多个项目和多个并行顶层任务；renderer 通过类型化、校验后的 preload/IPC 窄接口访问桌面宿主，每个顶层任务拥有独立 task/runtime/worktree 边界。pi runtime 是否与 Electron main 同进程仍需通过 spike 和 ADR 决定。项目尚未建立应用脚手架，详见 [`docs/architecture/electron-architecture.zh.md`](docs/architecture/electron-architecture.zh.md)（权威英文原文：[`docs/architecture/electron-architecture.md`](docs/architecture/electron-architecture.md)）。

## 安全边界

pi 默认以启动它的用户权限运行，可以读写文件并执行命令。项目信任只控制项目级配置与扩展的加载，不是系统沙箱。

桌面端必须让这个边界保持可见：

- 始终显示 agent 当前操作的工作目录。
- 已保存的 API key、OAuth token 和认证文件内容不回传渲染层；用户新输入的凭据只通过专用的一次性 IPC 提交，提交后立即从界面状态清除，且不写入前端存储或日志。
- 将模型输出、Markdown、工具输出和文件内容视为不可信输入并安全渲染。
- IPC 只暴露明确允许的命令，并在宿主进程再次校验参数。
- 对不可信仓库或无人值守任务，使用容器、虚拟机或其他操作系统级隔离。

## 上游参考

开发工作区预期将 pi 源码作为同级目录检出：

```text
parent/
├── pi/
└── pi-desktop/
```

如果本地没有参考源码，可以执行：

```bash
git clone https://github.com/earendil-works/pi.git ../pi
```

优先阅读以下上游资料：

- `../pi/packages/coding-agent/docs/sdk.md`
- `../pi/packages/coding-agent/docs/rpc.md`
- `../pi/packages/coding-agent/docs/security.md`
- `../pi/packages/coding-agent/docs/session-format.md`
- `../pi/packages/coding-agent/examples/sdk/`

同级的 `../pi` 只用于阅读、调试和兼容性验证。正式构建不能隐式依赖该目录存在；发布依赖必须通过包管理器锁定版本，或通过项目明确管理的构建产物提供。

## 开发

前提：

- Linux（当前目标平台）
- Node.js `>= 22.19.0`（本机工具链；打包后应用使用 Electron 内置 Node）
- npm

```bash
npm install
npm run dev          # Electron Forge + Vite dev server, empty shell window
npm run package      # production bundle under out/ (WI-001 spike)
npm run check        # Prettier + ESLint + TypeScript (strict)
npm test             # unit + documentation tests
npm run docs:verify  # documentation structure + bilingual invariants
```

机械风格检查：**ESLint + Prettier**（`npm run check`）。需人工判断的约定见 [code-style.zh.md](docs/guides/code-style.zh.md)。

打包启动时，主进程日志会输出 Electron 的 `process.versions.node`，并执行最小 pi SDK 内存会话探测（不调用真实模型）。

开始贡献前请阅读 [CONTRIBUTING.zh.md](CONTRIBUTING.zh.md)（[English](CONTRIBUTING.md)）与 [AGENTS.zh.md](AGENTS.zh.md)（[English](AGENTS.md)）。不要在测试中调用真实付费模型；agent 流程应使用 fake provider、fixture 或受控的本地替身验证。

Pull Request 会在 CI 中运行 `npm run docs:verify`（见 [`.github/workflows/docs.yml`](.github/workflows/docs.yml)）。

## 路线图

1. 选择桌面技术栈，建立 Linux 开发、测试和打包流水线。
2. 完成 pi runtime adapter，并验证流式事件、工具调用、中止和错误恢复。
3. 完成基础对话界面、输入区和工作目录管理。
4. 接入模型认证、设置和会话生命周期。
5. 补齐树状会话、压缩、扩展交互和可访问性支持。
6. 产出可重复构建的 Linux 安装包并建立兼容性测试矩阵。

## 许可证

本仓库采用 [MIT License](LICENSE)。

## 与 pi 的关系

pi 是上游 agent harness，本项目是独立的桌面客户端。上游源码采用 MIT License，仅适用于 pi 本身；本仓库的 [LICENSE](LICENSE) 适用于此处的 pi-desktop 代码与文档。
