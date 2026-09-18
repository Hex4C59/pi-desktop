# pi-desktop 代码风格宪章

[English](code-style.md) | 中文

- 类型：Guide
- 状态：Accepted
- 创建：2026-09-19
- 最近评审：2026-09-19
- 适用范围：`src/` 下全部应用源码（存在后）及随应用发布的共享工具
- 权威范围：工程价值观、结构、命名、错误、信任边界、抽象与注释哲学（人与 agent 作者）
- 权威原文：[Code Style Charter](code-style.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 相关：[typescript playbook](agent/typescript.zh.md)、[代码评审清单](code-review.zh.md)、[boundaries](agent/boundaries.zh.md)、[security](agent/security.zh.md)、[change-policy](agent/change-policy.zh.md)

本宪章使用 [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) 用语：**必须**、**不得**、**应当**、**不应**、**可以**。**优先**与**避免**分别对应**应当**与**不应**。

Agent 实现以 [typescript playbook](agent/typescript.zh.md) 清单为准；本文说明**原因**并补充 playbook 未重复的内容。

## 1. 目标

1. **人类可读** — 线性流程、领域命名与类型承载含义；agent 不得为抽象「优雅」牺牲可读性。
2. **边界安全** — 在 IPC、preload、持久化、SDK 边缘校验并明确失败；层内信任类型。
3. **与架构一致** — 模块 owner 见 [`modules/README.zh.md`](../modules/README.zh.md) 与 [`electron-architecture.zh.md`](../architecture/electron-architecture.zh.md) §20。
4. **可评审** — 范围对齐 [`ACTIVE.md`](../../ACTIVE.md)；机械规则在 WI-001 脚手架后交给 lint/format。

## 2. 分层与文件

### 必须

- 遵守 Renderer → Host → Adapter → pi runtime 依赖（[boundaries](agent/boundaries.zh.md)）。Renderer 不得导入 Node、pi SDK 或 host 内部实现。
- 代码放在 [`modules/README.zh.md`](../modules/README.md) 中对应 **owner** 的 §20 路径下。跨 owner 调用经命名协调器或公开入口，不得深导入他模块内部。
- `src/shared/contracts`（存在时）仅放可序列化形状，并与 [`reference/`](../reference/README.zh.md) 契约页在 `Outline`/`Living` 时一致。

### 不得

- 未经架构或 Accepted ADR 更新即增加 `core/`、`common/` 或兜底 `utils/`。
- 为「将来可能」仅有一个消费者的第二层抽象。

### 应当

- 单文件一个主概念。超过约 300 行时按语义块或 owner 拆分，而非机械按行数切。

## 3. 命名

| 类别 | 约定 | 示例 |
|------|------|------|
| 非 UI 模块 | `kebab-case.ts` | `task-runtime-controller.ts` |
| React 组件 | `PascalCase.tsx` 与导出一致 | `TaskComposer.tsx` |
| Hook | `use` + `PascalCase` | `useTaskStream.ts` |
| 类型/接口 | 名词短语，无 `I` 前缀 | `TaskRuntimeState` |
| 函数 | 动词短语 | `registerIpcHandlers` |
| 布尔 | `is` / `has` / `can` | `isAborting` |
| IPC channel | 动词+资源，Living 时与契约一致 | `task:send-message` |
| 测试 | 邻接 `*.test.ts` / `*.test.tsx` | `task-registry.test.ts` |

**不得**以 `Manager`、`Handler`、`Util` 作主名词，除非架构 owner 名称要求。

## 4. 类型与控制流

### 必须

- 保持 `strict`。避免 `any`；在信任边界用 schema 或类型守卫收窄 `unknown`。
- 状态与事件用可辨识联合；穷尽处理（`switch` + `never` 收底）。
- 长任务支持取消或显式 dispose（[boundaries](agent/boundaries.zh.md) 流式与 §17 清理）。
- 使用 `async`/`await`；传播错误，不得吞掉。

### 不得

- 在边界用 `as` 绕过校验，或在应用代码使用非空断言 `!`（测试可少量使用）。
- 用字符串 `enum` 作 IPC/事件判别；用与契约一致的字面量联合。
- 空 `catch`、仅 log 后继续、或无边界理由包裹整函数 `try/catch`。
- 超过三层嵌套不重构且无工作项 documented 例外。

### 应当

- 在 renderer 状态处优先 `readonly` 与不可变更新。
- 优先早返回。
- WI-001 创建 `tsconfig` 时决定 `exactOptionalPropertyTypes` 与 `noUncheckedIndexedAccess`，并在 `README.md` 记录。

## 5. 信任边界与「防御性」代码

在数据**不可信**或**跨进程/跨层**处校验：

| 位置 | 信任度 | 做法 |
|------|--------|------|
| IPC、preload 参数 | 低 | 与 host 同一规则；Living 时共享 schema |
| 持久化读回、用户路径 | 低 | Schema + 安全错误 |
| Adapter 侧 SDK/RPC 事件 | 中 | 映射已知 variant；未知 → 按 [boundaries](agent/boundaries.zh.md) 记录并丢弃或 domain error |
| 同模块已收窄的 private 调用 | 高 | **不得**重复冗余 null 检查 |

**不得**对同一字段在 preload 与 host 各写一套校验逻辑。**不得**为架构排除的状态加完整分支，除非工作项涵盖 abort/crash/会话替换清理。

## 6. 错误与日志

### 必须

- IPC 返回结构化失败（`code`、用户可读 `message`、可选 `recoverable`）；不以堆栈作 renderer 主 UI 文案。
- Adapter 失败映射为 domain 错误；`cause` 仅保留在 host 诊断侧。
- 遵守 [`AGENTS.zh.md`](../../AGENTS.zh.md) L0：密钥、token、认证文件内容不得进入 renderer、普通日志、遥测或通知。

### 应当

- 在拥有恢复责任的边界记录一次失败，而非每个 helper 都打 log。
- 用户可见文案便于日后 i18n（v1 仅英文亦可；避免散落魔法句）。

## 7. 抽象与复用

### 可以抽象当

- **两处及以上**真实调用重复（非假想未来）。
- 隔离 **pi SDK/RPC** 形状变化（adapter）。
- 实现架构 §8 **owner** 或 **Living** 的 `src/shared/contracts`。

### 不得

- 单实现的策略/工厂/注册表模式。
- 抽取不改善调用点可读的一行/五行 helper。
- 与功能同一任务做全库重构或依赖升级（[change-policy](agent/change-policy.zh.md)、[typescript](agent/typescript.zh.md)）。

### 应当

- 初始化阶段优先与 `ACTIVE.md` 工作项一致的竖切，而非「平台型」框架代码。

## 8. 注释（哲学）

注释是与类型、测试、契约文档并列的**第四类信息**。

| 类 | 目的 | 位置 |
|----|------|------|
| **Contract** | 前置/后置、不变量、契约 ID | 导出 API 与 `shared/contracts` 的 JSDoc |
| **Invariant** | 代码未结构enforce 的规则 | 依赖该规则的分支或函数旁 |
| **Rationale（why）** | 被拒方案、非显而易见权衡 | 短注 + ADR/模块文档链接 |
| **Beware** | 「勿简化」警告 | dispose 顺序、订阅生命周期、generation/incarnation 旁 |

### 必须

- 注释 **why**、不变量、**beware** — 不复述下一行做什么。
- 行为变更时**同一 PR** 更新或删除注释；陈旧注释视为 bug。

### 不得

- 文件头粘贴架构长文；链 [`modules/`](../modules/README.zh.md)。
- 无 `WI-xxx`/gate/issue 的 `TODO`/`FIXME`。
- 保留 agent 生成的逐步旁白。

系统级决策进 **ADR**；channel 与 schema 表在 Living 时进 **`docs/reference/`** — 不用长注释替代。

## 9. Renderer 专项

产品 UX 见 [ui](agent/ui.zh.md)。**不得**把业务规则塞进大块 `useEffect`；effect 仅同步外部系统（IPC 订阅、布局观察）。优先命名 hook 与小组件，而非配置驱动渲染树。

## 10. 机械 enforcement（WI-001）

脚手架存在前仅文档与人工评审。

WI-001 之后：

- 提供 `npm run check`（或等价）合并 **format**、**lint**、**typecheck**；CI 只调相同 scripts（[commands](agent/commands.zh.md)）。
- 在 Forge/Vite 模板间选 **Biome** 或 **ESLint + Prettier**；在 WI-001 spike / build-baseline ADR 中记录。
- 初始 lint 目标（可扩展）：禁止 `any`、应用代码禁止 `!`、禁止无说明的 disable、可选 `no-unnecessary-condition` 以减少假防御分支。

仅由工具 enforce 的规则在脚手架后列于 `README.md`；本宪章仍是工具无法覆盖的判断依据。

## 11. 权威顺序

冲突时：[`AGENTS.zh.md`](../../AGENTS.zh.md) L0 → 本宪章 → [typescript playbook](agent/typescript.zh.md) → 专题 playbook（boundaries、security、ui、testing）→ 架构与 Living 契约。
