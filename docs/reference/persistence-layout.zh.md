# 持久化布局

[English](persistence-layout.md) | 中文

- 类型：Reference
- 状态：Planned
- Contract ID：`contract-persistence`
- Gate：`gate-task-persistence`、`gate-apply-journal`（下节）
- 权威原文：[persistence-layout.md](persistence-layout.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

> **状态：Planned** — 对应 gate 以 Accepted ADR 关闭**之前**不得写入真实路径或 schema 版本。

## 目的

应用数据位置、文件名、schema 版本与迁移说明的唯一位置——分任务持久化与 apply journal 两节。

## 第 1 节 — Task store

| 产物 | 路径模式 | Schema 版本 | Owner 模块 | Gate | 备注 |
|------|----------|-------------|------------|------|------|
| *（TBD）* | — | — | `TaskRegistry` | `gate-task-persistence` | ADR 后 |

## 第 2 节 — Apply / 恢复 journal

| 产物 | 路径模式 | Schema 版本 | Owner 模块 | Gate | 备注 |
|------|----------|-------------|------------|------|------|
| *（TBD）* | — | — | `ResultApplicationService` | `gate-apply-journal` | ADR 后 |

## 维护

`Living` 时恢复与损坏测试须引用本表行；示例不得含凭据路径。
