# 任务与 runtime 状态

[English](task-and-runtime-states.md) | 中文

- 类型：Reference
- 状态：Planned
- Contract ID：`contract-states`
- 权威原文：[task-and-runtime-states.md](task-and-runtime-states.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

> **状态：Planned** — **WI-004** 或多任务 UI 首实现时填入。区分任务记录态、runtime incarnation 健康态、连接/同步态。

## 目的

UI、测试、adapter 共用词汇：合法状态、用户可见文案、哪些状态允许 prompt/abort/apply。

## 架构指针

- Runtime 生命周期 §9.1
- 任务/catalog 投影与后台任务行为（架构）

## 任务级状态

| 状态 | 用户可见 | 允许 prompt | 允许 abort | 备注 |
|------|----------|-------------|------------|------|
| *（TBD）* | — | — | — | |

## Runtime / incarnation 状态

| 状态 | 适用于 | 备注 |
|------|--------|------|
| *（TBD）* | — | |

## 转移

TBD — `Outline` 时补状态图或表。

## 维护

与 [domain-events.zh.md](domain-events.zh.md) 及 PRD 空/加载/流式/错误态对齐。
