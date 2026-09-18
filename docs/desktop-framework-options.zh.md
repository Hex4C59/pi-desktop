# pi-desktop 桌面框架与 TypeScript 构建方案调研

[English](desktop-framework-options.md) | 中文

- 类型：Reference
- 状态：Accepted
- 翻译状态：Machine Draft
- 调研日期：2026-09-17
- 最近同步：2026-09-19
- 权威原文：[desktop-framework-options.md](desktop-framework-options.md)
- 原文版本：Uncommitted baseline
- 项目：pi-desktop
- 项目定位：面向 Linux 的 pi 桌面客户端
- 权威范围：桌面框架与 TypeScript 构建方案调研结论及横向比较
- 当前状态：已选择 Electron + React + Vite + TypeScript 作为首版技术方向，尚未建立应用脚手架
- 架构提案：[`architecture/electron-architecture.md`](architecture/electron-architecture.md)

## 1. 调研目标

本次调研比较三种桌面应用方案，为 pi-desktop 选择桌面框架和 TypeScript 构建方案提供依据。重点关注以下因素：

- pi SDK 的集成方式
- renderer/UI 与高权限宿主之间的边界
- 流式消息、工具调用、会话管理和中止操作
- Linux 开发与发布体验
- TypeScript 的覆盖范围和开发效率
- 安装包体积、内存占用和长期维护成本

## 2. 项目约束与已知事实

### 2.1 pi 集成约束

pi 官方 SDK 包为 `@earendil-works/pi-coding-agent`，SDK 内含在该包中，不需要单独安装 SDK 包。SDK 面向 Node.js 宿主，主要能力包括：

- `createAgentSession`
- `createAgentSessionRuntime`
- `AgentSessionRuntime`
- `ModelRuntime`
- `SessionManager`
- `SettingsManager`
- 流式事件订阅
- 工具、扩展、skills 和 prompt 模板加载

pi SDK 文档明确建议：

- 同一 Node.js 进程内、需要类型安全和直接访问 agent 状态时，优先使用 SDK；
- 需要进程隔离或语言无关集成时，使用 `pi --mode rpc`。

因此，能否在 Node.js 宿主中直接运行 pi SDK，是本项目选择框架时的重要因素。

### 2.2 进程边界

无论最终选择哪种桌面框架，都应保持以下分层：

```text
Renderer/UI
    ↓ 类型化、校验后的 IPC
Desktop host
    ↓ Pi adapter
Pi runtime
```

renderer 不得直接获得以下能力：

- Node.js API
- shell 或任意命令执行
- 任意文件读写
- provider 凭据
- pi SDK 类型和内部对象

桌面宿主负责：

- pi runtime 生命周期
- IPC 输入校验
- session 和 cwd 协调
- 凭据操作
- 子进程管理
- 订阅清理和错误恢复

### 2.3 当前机器环境

当前开发机器已经具备：

- Fedora Linux 44 KDE
- Node.js `22.23.1`
- npm `10.9.8`
- Git
- pi CLI `0.85.1`
- 同级目录 `../pi` 上游源码

当前项目本身尚未配置 `package.json`、依赖、构建脚本或应用脚手架。正式构建不能依赖本地 `../pi` 目录，应通过 npm 依赖和锁文件固定 pi 版本。

## 3. 方案一：Electron + React + Vite + TypeScript

### 3.1 建议架构

```text
Electron main process
  ├── pi SDK
  ├── AgentSessionRuntime
  ├── ModelRuntime
  ├── 文件、进程、凭据和持久化协调
  └── 类型化 IPC
        ↓
preload
        ↓
React renderer + Vite + TypeScript
```

Electron 的 main process 运行在 Node.js 环境中，因此可以直接导入并运行 pi SDK。preload 负责通过 `contextBridge` 暴露经过筛选的 API，renderer 只使用项目自定义的窄接口。

### 3.2 优点

1. **最适合直接集成 pi SDK**

   pi SDK 可以直接运行在 Electron main process 中，不需要额外的 Node.js sidecar，也不需要先转换为 RPC。这样最容易访问 `AgentSessionRuntime`、`ModelRuntime`、`SessionManager` 和 pi 的流式事件。

2. **桌面能力成熟**

   Electron 对以下能力支持成熟：

   - 多窗口
   - 文件选择器
   - 剪贴板
   - 系统托盘
   - 菜单
   - 通知
   - 子进程
   - 应用生命周期
   - 开发者工具
   - 自动更新生态

3. **可以全栈使用 TypeScript**

   main process、preload、renderer、pi adapter、IPC contract 和测试均可使用 TypeScript，不需要维护 Rust 或 C++ 宿主代码。

4. **开发和测试生态最成熟**

   React、Vite、Vitest、Playwright、Electron Forge 等工具组合较成熟，资料和社区支持充足。

5. **适合优先验证核心 adapter**

   本项目最复杂的部分是 pi 事件和生命周期语义，而不是窗口创建。Electron 可以减少基础设施变量，让项目优先验证：

   - 流式文本和 thinking 增量
   - tool call 生命周期
   - message end 权威值
   - steering/follow-up 队列
   - abort 和清理
   - session replacement
   - 项目信任流程

### 3.3 缺点

1. **安装包和内存占用较大**

   Chromium 和 Node.js runtime 会随应用分发，通常比使用系统 WebView 的方案占用更多磁盘和内存。

2. **宿主权限很高**

   Electron main process 可以访问 Node.js 和系统能力。renderer 一旦获得过多权限，安全风险会显著增加，因此必须严格设计 preload 和 IPC。

3. **Linux 发布需要额外规划**

   需要决定并维护 AppImage、deb、rpm 或 Flatpak 等发布格式，还要考虑自动更新、签名和不同发行版兼容性。

### 3.4 必须遵守的安全配置

Electron 官方安全建议要求：

- `nodeIntegration: false`
- `contextIsolation: true`
- 开启 renderer sandbox
- 只加载随应用打包的本地代码
- 不直接向 renderer 暴露完整的 `ipcRenderer`
- 通过 preload 暴露按操作划分的 API
- 在 main process 对 IPC 输入进行 schema 校验
- 限制外部导航和不可信内容加载

pi 的模型输出、Markdown、命令输出、diff、文件路径和扩展 UI 均应视为不可信数据处理。

### 3.5 TypeScript 构建方案

建议采用：

- React
- Vite
- Electron Forge
- `@electron-forge/plugin-vite`
- TypeScript strict mode
- Vitest
- Playwright 或 Electron 端到端测试

Electron Forge 提供 Vite + TypeScript 模板，可以分别构建：

- main process
- preload script
- renderer

需要注意：Electron Forge 的 Vite 插件当前被官方标记为 experimental，升级时应检查 release notes 和配置兼容性。

推荐目录结构：

```text
src/
├── main/
│   ├── main.ts
│   ├── ipc/
│   └── pi-runtime/
├── preload/
│   ├── preload.ts
│   └── api.ts
├── renderer/
│   ├── App.tsx
│   ├── components/
│   └── state/
├── shared/
│   └── ipc-contract.ts
└── tests/
```

### 3.6 适用性判断

**对当前项目最适合。**

如果目标是尽快实现第一个可用版本，Electron 是风险最低、pi 集成成本最低的方案。

## 4. 方案二：Tauri 2 + React + Vite + TypeScript

### 4.1 建议架构

```text
Tauri Rust core
  ├── 窗口、权限和系统 API
  ├── 类型化 IPC
  └── Node.js sidecar 或 pi RPC 子进程
        ↓
系统 WebView/WebKitGTK
        ↓
React renderer + Vite + TypeScript
```

Tauri 使用 Rust core 管理窗口和系统能力，前端通过系统 WebView 渲染。Linux 使用 WebKitGTK，最终应用不包含完整 Chromium。

### 4.2 优点

1. **安装包和内存占用通常更小**

   Tauri 使用系统 WebView，而不是把完整 Chromium 随应用分发。

2. **宿主和 renderer 的边界更明确**

   Tauri 的 core process 是拥有完整系统权限的部分，WebView 只能通过显式 IPC 调用允许的能力。

3. **适合长期做成轻量 Linux 客户端**

   如果应用需要长期驻留，较小的运行时开销具有实际价值。

4. **Linux 发布格式支持较好**

   Tauri CLI 支持生成：

   - AppImage
   - deb
   - rpm

   生态和发布文档还覆盖 Flatpak、Snap 和 AUR 等 Linux 分发方式。

### 4.3 缺点

1. **pi SDK 集成复杂**

   pi SDK 是 Node.js SDK，不能直接运行在 Rust core 中。常见做法是：

   - 将 Node.js runtime 和 pi adapter 打包为 sidecar；或
   - 启动 `pi --mode rpc` 子进程，通过 JSONL 协议通信。

   这会引入额外工作：

   - sidecar 二进制打包
   - 目标平台和 CPU 架构处理
   - 进程启动和退出
   - stdout/stderr 分离
   - 请求超时
   - 子进程提前退出
   - RPC 消息乱序和关联
   - 版本升级

2. **需要引入 Rust/Cargo**

   团队需要维护 Rust toolchain、Cargo 依赖、Tauri 配置、Rust command 和 TypeScript IPC 类型。

3. **依赖系统 WebView**

   Linux 下需要关注 WebKitGTK 版本、GTK 环境、Wayland/X11、字体、输入法和系统 Web API 差异。

4. **构建环境更加复杂**

   Tauri 官方建议使用较旧的兼容基线构建 Linux 安装包，例如 Ubuntu 22.04 或 Debian 12，以避免最终程序依赖过新的 glibc。正式构建最好放到容器或 CI 中，而不是直接依赖开发机环境。

### 4.4 TypeScript 构建方案

前端建议采用：

- React
- Vite
- TypeScript strict mode
- Vitest
- Playwright

典型脚本形态：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  }
}
```

Tauri 配置前端开发和生产构建：

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  }
}
```

pi 集成可以设计为：

```text
Tauri Rust core
  ↓
Node.js pi adapter sidecar
  ↓
@earendil-works/pi-coding-agent
```

或者：

```text
Tauri Rust core
  ↓
pi --mode rpc
  ↓
JSONL RPC adapter
```

### 4.5 适用性判断

**适合长期产品化，但初期成本高于 Electron。**

如果优先级是安装包大小、内存占用和更强的宿主边界，并且团队愿意维护 Rust 与 sidecar/RPC，Tauri 2 是有吸引力的选择。

## 5. 方案三：Neutralinojs + React + Vite + TypeScript

### 5.1 建议架构

```text
Neutralinojs C++ backend
  ├── 系统 WebView
  ├── Native API
  └── WebSocket IPC
        ↓
React renderer + Vite + TypeScript
        ↓
Node.js sidecar 或 pi RPC 子进程
```

Neutralinojs 使用 C++ backend、系统 WebView、内置静态服务器和 WebSocket 通信。前端可以通过 `@neutralinojs/lib` 调用受限的原生 API。

### 5.2 优点

1. **运行时和应用包很轻**

   Neutralinojs 不随应用分发完整 Chromium 和 Node.js，而是使用操作系统已有的 WebView。

2. **TypeScript 前端开发简单**

   可以使用 React、Vite、TypeScript 和 HMR，前端开发方式接近普通 Web 应用。

3. **基础 Native API 直接**

   可通过 API 使用文件系统、窗口、剪贴板、环境变量、系统命令、通知和存储等能力。

4. **适合轻量工具和原型**

   对功能简单、对包体敏感的桌面应用，Neutralinojs 的使用成本较低。

### 5.3 缺点

1. **生态规模较小**

   相比 Electron 和 Tauri，Neutralinojs 的插件、调试工具、资料和长期维护经验较少。

2. **仍然不能直接运行 pi SDK**

   与 Tauri 类似，pi SDK 仍需通过 Node.js sidecar 或 RPC 子进程接入，因此无法获得 Electron 的同进程优势。

3. **复杂 IPC 需要自行设计**

   本项目需要传输并关联大量结构化事件：

   - 流式文本和 thinking 增量
   - tool execution start/update/end
   - message start/end
   - queue update
   - compaction
   - retry
   - session replacement
   - abort
   - runtime crash

   Neutralinojs 的基础 WebSocket API 不会替项目解决领域事件建模、请求关联、超时、重试和取消。

4. **系统 WebView 兼容性仍然存在**

   它仍依赖 Linux 系统 WebView，不能完全消除发行版之间的渲染差异。

5. **复杂桌面产品需要补齐较多基础设施**

   本项目不是简单 CRUD 应用，而是带有高权限 agent runtime、流式协议、会话树和扩展机制的开发工具。Neutralinojs 需要自行补齐的部分较多。

### 5.4 TypeScript 构建方案

建议采用：

- React
- Vite
- TypeScript strict mode
- `@neutralinojs/lib`
- `neu` CLI
- Neutralinojs 的 Vite 集成或兼容插件

原生 API 应通过 allowlist 明确控制，例如：

```json
{
  "nativeAllowList": [
    "app.*",
    "window.*",
    "filesystem.*",
    "clipboard.*"
  ]
}
```

### 5.5 适用性判断

**适合轻量原型，不建议作为本项目的首选生产基础。**

它既不能直接运行 pi SDK，又比 Electron 和 Tauri 缺少更多成熟的桌面生态。除非包体和资源占用是压倒性优先级，否则不建议优先选择。

## 6. 方案横向比较

| 维度 | Electron | Tauri 2 | Neutralinojs |
| --- | --- | --- | --- |
| pi SDK 直接集成 | 最好，同一 Node.js 宿主 | 需要 Node sidecar 或 RPC | 需要 Node sidecar 或 RPC |
| TypeScript 覆盖范围 | 前后端都可使用 TypeScript | 前端 TypeScript，宿主 Rust | 前端 TypeScript，宿主 C++ |
| 开发启动成本 | 最低 | 中等 | 较低 |
| 桌面生态 | 最成熟 | 成熟 | 较小 |
| 安装包体积 | 较大 | 较小 | 很小 |
| 内存占用 | 较高 | 较低 | 较低 |
| IPC 实现复杂度 | 中等 | 高 | 高 |
| Linux 发布 | 成熟 | 成熟 | 可用但工具较少 |
| renderer 安全边界 | 需要严格配置 | 默认边界更明确 | 需要自行设计和审计 |
| 当前项目适合度 | 最高 | 较高 | 中等偏低 |

## 7. TypeScript 工具链建议

无论采用哪种桌面框架，TypeScript 部分都建议统一以下原则：

- 启用 `strict` 类型检查
- 使用 Vite 处理 renderer 构建
- 使用 React 构建桌面 UI
- 使用 Vitest 进行单元测试和 adapter 测试
- 使用 Playwright 或同类工具覆盖关键 UI 流程
- 使用 npm 和 `package-lock.json`，除非项目之后明确选择其他包管理器
- 将 pi SDK 作为正式 npm 依赖固定明确版本
- 不让正式构建隐式依赖本地 `../pi`
- 为 main/host、preload、renderer 和 shared contract 分离 TypeScript 配置或入口
- 对跨 IPC 的数据使用可辨识联合和 schema 校验
- 不在 renderer 中引入 pi SDK 类型，使用项目内部可序列化领域类型

## 8. 推荐结论

### 首选：Electron + React + Vite + TypeScript

推荐理由：

1. 与 pi SDK 的 Node.js 运行模型完全匹配；
2. 不需要先解决 sidecar 或 RPC 的工程问题；
3. 可以优先验证 pi adapter 的事件、工具、会话和取消语义；
4. 全栈 TypeScript，学习和维护成本最低；
5. Electron 的桌面能力、测试生态和资料最成熟；
6. 通过严格的 preload、sandbox 和 allowlist IPC 可以满足项目安全边界。

### 次选：Tauri 2 + React + Vite + TypeScript

适合以下前提：

- 你非常重视包体积和内存占用；
- 接受 Rust/Cargo 作为长期技术栈；
- 接受 Node.js sidecar 或 RPC 的额外复杂度；
- 愿意投入更多时间建设进程管理、构建和发布链路。

### 不建议首选：Neutralinojs

Neutralinojs 适合轻量原型，但不太适合当前这种具有以下特征的应用：

- 高权限 agent runtime
- 复杂流式事件
- 工具调用生命周期
- 会话树和 session replacement
- pi 扩展机制
- 多种 Linux 发布形态

## 9. 建议的决策顺序

在最终确定框架前，可以按以下顺序进行验证：

1. 先确定 pi SDK 版本并建立最小 Node.js adapter；
2. 使用 fake provider 或受控替身验证流式文本、thinking、工具生命周期和 abort；
3. 验证 session replacement、队列、重试、压缩和 runtime 崩溃清理；
4. 在 Electron 中实现最小的 preload + IPC 边界；
5. 根据实际包体和内存数据，评估是否值得迁移到 Tauri；
6. 如果选择 Tauri，再确定 sidecar 还是 `pi --mode rpc`；
7. 最后确定 Linux 发布格式和 CI 构建基线。

在没有完成上述验证前，不应把某一种框架写成已经确定的项目技术栈。

## 10. 参考资料

### pi

- [pi SDK 文档](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sdk.md)
- [pi RPC 文档](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/rpc.md)
- [pi 安全文档](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/security.md)
- [@earendil-works/pi-coding-agent npm 包](https://www.npmjs.com/package/@earendil-works/pi-coding-agent)

### Electron

- [Electron 进程模型](https://www.electronjs.org/docs/latest/tutorial/process-model)
- [Electron 安全建议](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron context isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Electron Forge Vite + TypeScript 模板](https://www.electronforge.io/templates/vite-+-typescript)
- [Electron Forge Vite 插件](https://www.electronforge.io/config/plugins/vite)

### Tauri

- [Tauri 2 架构](https://v2.tauri.app/concept/architecture/)
- [Tauri 2 进程模型](https://v2.tauri.app/concept/process-model/)
- [Tauri Vite 前端配置](https://v2.tauri.app/start/frontend/)
- [Node.js sidecar](https://v2.tauri.app/learn/sidecar-nodejs/)
- [Tauri Linux 发布](https://v2.tauri.app/distribute/)
- [Tauri AppImage 与 Linux 构建基线](https://v2.tauri.app/distribute/appimage/)

### Neutralinojs

- [Neutralinojs 官方文档](https://neutralino.js.org/docs/)
- [Neutralinojs API 概览](https://neutralino.js.org/docs/api/overview/)
- [Neutralinojs CLI](https://neutralino.js.org/docs/cli/neu-cli/)
