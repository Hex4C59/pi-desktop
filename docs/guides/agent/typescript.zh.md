# Agent playbook：TypeScript 与代码质量

[English](typescript.md) | 中文

- 类型：Guide
- 状态：Accepted
- 最近评审：2026-09-19
- 权威范围：应用包内 TypeScript 可执行清单
- 适用：应用包内 `.ts` / `.tsx` 实现或评审
- 权威原文：[typescript.md](typescript.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

实现会话前阅读 [代码风格宪章](../code-style.zh.md) 了解原因。本 playbook 为 agent **必须**遵守的执行清单。

## 必须

### 类型与数据

- 启用并保持 **strict**。避免 `any`；在信任边界用 schema 或类型守卫收窄 `unknown`。
- 用**可辨识联合**表达事件与状态；穷尽处理 pi 消息、工具与生命周期（不可能分支用 `never`）。
- IPC 与领域事件判别不用字符串 `enum`；用与契约页一致的字面量联合（`Outline`/`Living` 时）。
- 边界不用 `as`；应用代码不用非空断言 `!`。

### 模块与导入

- 导入在文件顶部。除非打包或明确懒加载需要，避免隐藏动态导入。
- 文件放在正确架构 §20 路径与模块 owner（[modules/README.zh.md](../../modules/README.zh.md)）。
- 未经架构或 ADR 更新不得增加 `core/`、`common/` 或兜底 `utils/`。

### 命名与文件

- 非 UI：`kebab-case.ts`。React 组件：`PascalCase.tsx` 与导出一致。Hook：`use` + `PascalCase`。
- 函数：动词短语。布尔：`is` / `has` / `can`。IPC 名在 Living 时遵循契约。
- 除非架构要求，类型或模块主名不用 `Manager`、`Handler`、`Util`。

### 控制流与异步

- 优先早返回；超过三层嵌套须重构。
- 使用 `async`/`await`。长任务须支持 **AbortSignal** 或显式 dispose（[boundaries.zh.md](boundaries.zh.md)）。
- 不得空 `catch`、吞错误，或无边界理由包裹整函数 `try/catch`。

### 信任边界

- 在 IPC、preload 参数、持久化读回、adapter 侧 SDK 数据边缘校验一次；Living 时规则共享。
- 类型已收窄后不得在同层重复冗余 null 检查。
- 不得为架构排除的状态加防御分支，除非工作项涵盖 abort/crash/会话替换清理。

### 错误与日志

- IPC 失败：结构化、用户安全文案；不以堆栈作 renderer 主 UI 文本。
- 不得记录凭据、token 或认证文件内容（[security.zh.md](security.zh.md)、`AGENTS.md` L0）。

### 抽象与范围

- 仅在**两处**真实重复、或隔离 pi SDK/RPC、或实现契约/§8 owner 时抽取共享代码。
- 不得引入单消费者的工厂、策略或泛型注册表。
- 不得在同一任务做无关重构、批量格式化或依赖升级（[change-policy.zh.md](change-policy.zh.md)）。

### 注释

- 注释 **不变量**、**why**、**beware** — 不做逐行旁白。链 ADR 与模块文档，不粘贴长文。
- 行为变更时同改或删注释。无 `WI-xxx`/gate/issue 的 `TODO` 禁止。

### 验证

- 存在时运行项目 `check`/lint/typecheck/测试；声称完成前报告结果（[testing.zh.md](testing.zh.md)、[commands.zh.md](commands.zh.md)）。

## 应当

- 用 `readonly` 澄清意图；renderer 在可行处不可变更新。
- 在拥有恢复责任的边界记录一次失败。
- 单文件一个主概念；可读性变差时拆分（约 300 行为信号而非硬上限）。
- 优先与 [`ACTIVE.md`](../../../ACTIVE.md) 一致的竖切，而非平台型框架。

## 指针

- 宪章：[code-style.zh.md](../code-style.zh.md)
- 维护者清单：[code-review.zh.md](../code-review.zh.md)
- 分层与流式：[boundaries.zh.md](boundaries.zh.md)
- 契约：[reference/README.zh.md](../../reference/README.zh.md)
- Renderer UX：[ui.zh.md](ui.zh.md)
- 脚手架后机械规则：[code-style §10](../code-style.zh.md#10-机械-enforcementwi-001)、[commands.zh.md](commands.zh.md)
