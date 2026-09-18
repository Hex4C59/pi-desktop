# RuntimeStateMachine

[English](runtime-state-machine.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[runtime-state-machine.md](runtime-state-machine.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/runtime/runtime-state-machine.ts`
- 权威范围：历史首版 runtime 生命周期状态、转换验证、禁止事项和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

定义并验证 runtime 生命周期状态转换。

## 状态

`idle`、`starting`、`ready`、`running`、`switching`、`aborting`、`error`、`crashed`、`disposed`。

## 不负责

不持有 runtime，不执行异步副作用，不发布事件。

## 测试重点

所有合法转换、非法转换、终态和错误恢复入口。
