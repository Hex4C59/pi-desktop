# Agent playbook：命令与 CI

[English](commands.md) | 中文

- 类型：Guide
- 状态：Accepted
- 权威范围：开发/测试/构建命令的唯一来源
- 适用：添加 scripts、CI、打包或文档化运行方式
- 权威原文：[commands.md](commands.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 必须

- 尚无 `package.json` 时无标准应用命令——不得发明隐藏的临时流程。
- 脚手架建立后：
  - 命令仅定义在 `package.json` scripts；
  - 在 `README.md` 记录安装、开发、检查、测试与 Linux 打包；
  - CI 调用相同 scripts——无仅 CI 存在的隐藏流程；
  - 不绕过失败的 lint、typecheck 或测试完成任务。
- WI-001 须增加与 [code-style §10](../code-style.zh.md#10-机械-enforcementwi-001) 一致的机械检查：经 `npm run check`（名称可与模板一致）做 format + lint + typecheck。与 Forge/Vite 脚手架一并选择 Biome 或 ESLint + Prettier；在 build-baseline ADR 中记录选择。

## 指针

- 构建 gate：`docs/architecture/electron-architecture.md` §21
- 当前工作项：[ACTIVE.md](../../../ACTIVE.md)
