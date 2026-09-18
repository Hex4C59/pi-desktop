# Git 提交规范

[English](git-commit-convention.md) | 中文

- 类型：Guide
- 状态：Accepted
- 翻译状态：Machine Draft
- 权威范围：本仓库中由人工贡献者或编码代理创建、修订、变基、压缩或以其他方式改写的所有 commit message
- 权威原文：[Git Commit Convention](git-commit-convention.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-19

## 适用范围

本规范适用于本仓库中由人工贡献者或编码代理创建的所有 commit message。它也适用于修订（amend）、改写（reword）、压缩（squash）或以其他方式改写提交历史的情形。

请使用完整的 Conventional Commits 格式，subject、body 以及适用的 footer 均使用英文撰写。

## 格式

```text
<type>(<scope>): <summary>

<body>

<footer>
```

要求：

- 对于人工或代理创建的提交，subject 和 body 为必填项。
- 仅当 footer 承载破坏性变更说明、议题引用、作者署名 trailer 或其他相关元数据时，footer 为必填项。
- subject、body 与 footer 之间各留一行空行。
- 每个提交应聚焦于一项逻辑变更。
- 不得在 commit message 中包含凭证、密钥、完整 prompt、敏感路径或其他私密数据。

Git 产生的标准合并 message 以及机械生成的 revert message 可保留其标准格式。若手动编辑 revert message，应添加 body 说明为何需要 revert。

## 语言

- 整份 commit message 必须使用英文撰写。
- 这包括 summary、body 以及自定义 footer 文本。
- 不得在 commit message 中混用英文与中文。
- 标准 trailer（如 `BREAKING CHANGE:`、`Refs:`、`Closes:`、`Co-authored-by:`）保持其标准形式。
- 在需要时，代码标识符、API 名称、文件路径、命令以及引用的面向用户文本应原样保留。

## 类型（type）

使用以下类型之一：

- `feat`：新增或变更用户可见功能。
- `fix`：修正错误行为。
- `docs`：仅变更文档。
- `refactor`：在不改变预期行为的前提下重构代码。
- `test`：新增或变更测试，且不改变生产行为。
- `build`：变更依赖、打包、捆绑或构建系统。
- `ci`：变更持续集成或发布自动化。
- `perf`：在不改变预期行为的前提下提升性能。
- `style`：变更格式化或其他非功能性的源码呈现。
- `chore`：执行不适合归入其他类型的仓库维护工作。
- `revert`：在未使用 Git 生成格式时 revert 较早的提交。

选择最具体的类型。不要用 `chore` 替代含义不清的变更。

## 范围（scope）

使用小写 scope，命名本次提交主要影响的稳定领域或模块。优先使用领域名称，而非文件名。

推荐的 scope 包括：

- `app`
- `window`
- `ipc`
- `runtime`
- `task`
- `scheduler`
- `worktree`
- `session`
- `agent`
- `model`
- `auth`
- `trust`
- `attachment`
- `extension`
- `renderer`
- `contracts`
- `build`
- `docs`

该列表并非封闭。当新的稳定领域出现时，可添加新 scope。当变更确实横跨多个领域且没有准确的主 scope 时，可省略 scope。不要为了填满字段而编造不准确的 scope。

## 摘要（summary）

- 使用英文撰写 summary。
- 使用祈使语气。
- 以小写字母开头，除非首个词是大小写敏感的标识符。
- 末尾不要加句号。
- 完整 subject 行保持在 72 个字符以内。
- 描述该提交的单一逻辑结果。
- 避免含糊的摘要，例如 `update files`、`misc changes` 或 `fix stuff`。

## 正文（body）

- 使用英文撰写 body。
- 在可行时将正文换行控制在 72 个字符；若换行会降低代码标识符、URL 或其他 token 的可读性，则不要强行换行。
- 说明为何需要该变更，并描述其重要行为或影响。
- 记录相关约束、权衡、失败行为或迁移影响。
- 不要仅仅重复 diff 或复述 summary。
- 段落之间留一行空行。
- 除非确实已运行，不要声称检查已通过。

对于所有人工或代理创建的提交，body 为必填项。较小的变更可以使用简短的 body，但仍须说明其目的。

当提交变更以下任一项时，应提供更详细的说明：

- 架构或模块归属；
- 安全或信任边界；
- 持久化格式或恢复行为；
- IPC 或其他序列化契约；
- pi SDK 或 RPC 集成；
- 依赖、构建命令、打包或 CI；
- 用户可见行为；
- 兼容性或迁移要求。

## 页脚（footer）

在适用时使用标准 Git trailer：

```text
Refs: #42
Closes: #57
Co-authored-by: Name <email@example.com>
```

除非工作流明确要求，议题引用为可选项。将议题引用放在 footer，而非 summary。

## 破坏性变更

在以下两处同时标记破坏性变更：

1. 在 subject 中的 type 或 scope 之后添加 `!`。
2. 添加说明不兼容行为的 `BREAKING CHANGE:` footer。

body 应描述先前行为、新行为、受影响表面以及任何必需的迁移步骤。

```text
feat(ipc)!: route runtime commands by task ID

Replace the single-runtime command contract with task-scoped
commands required by concurrent project and session execution.

BREAKING CHANGE: All runtime commands and events now require a
task ID and runtime incarnation ID.
```

即使项目尚未发布，当提交以不兼容方式变更重要契约、持久化表示或文档化的集成边界时，仍应使用破坏性变更形式。

## 提交准备流程

在创建或改写提交之前：

1. 检查 `git status` 以及将要提交的完整 diff。
2. 保留用户无关的变更，并将其排除在本次提交之外。
3. 确认本次提交只包含一项逻辑变更。
4. 建议拆分无关变更，而不是用一条 message 掩盖它们。
5. 根据实际暂存内容选择 type 和 scope。
6. 撰写英文 summary、必填 body 以及适用的 footer。
7. 检查 subject 的 72 字符限制以及 body 换行。
8. 确认 message 未泄露密钥或敏感数据。
9. 仅报告确实已运行的检查。
10. 除非用户明确要求，不要 amend、rebase、squash、force-push 或以其他方式改写历史。

## 有效示例

### 功能（feat）

```text
feat(runtime): support concurrent task scheduling

Add separate limits for top-level tasks, per-task subagents,
and the global number of running agents.

Release execution slots while parent agents wait for subagents
to prevent scheduler deadlocks.
```

### 修复（fix）

```text
fix(worktree): preserve changes after apply failure

Stop the apply operation before writing to the target workspace
when the preflight check detects a conflict.

Keep the task worktree available so the user can resolve the
target state and retry.
```

### 文档（docs）

```text
docs(requirements): define multi-agent desktop behavior

Document the confirmed concurrency, worktree isolation, task
recovery, and change application requirements for the first
usable release.
```

### 小变更

```text
docs(readme): correct the supported platform description

Clarify that the first release supports Linux only.
```

## 无效示例

```text
update docs
```

问题：

- 没有 type。
- 未标识受影响区域。
- 未描述具体结果。
- 没有 body。

```text
feat: Added New Runtime Feature.
```

问题：

- 未使用祈使语气。
- 使用了不必要的大写开头。
- 末尾带有句号。
- 没有 body。

```text
feat(runtime): support concurrent task scheduling

[Body written in a language other than English.]
```

问题：

- body 未使用英文撰写。
- summary、body 以及自定义 footer 文本必须全部使用英文。
