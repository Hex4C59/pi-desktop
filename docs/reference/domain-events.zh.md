# 领域事件（面向 Renderer 的 DTO）

[English](domain-events.md) | 中文

- 类型：Reference
- 状态：Planned
- Contract ID：`contract-events`
- 权威原文：[domain-events.md](domain-events.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

> **状态：Planned** — **WI-004**（单任务流式）填入。Renderer 不得 import pi SDK 类型。

## 目的

Main → Renderer（或订阅流）的可序列化事件可辨识联合，对齐 pi 流式语义（`contentIndex`、tool call ID、`message_end.message`）。

## 架构指针

- [核心领域与身份 §7](../architecture/electron-architecture.zh.md)
- 事件同步与 catalog/任务快照（架构多任务相关节）

## 事件变体

| Variant | 关键字段 | 关联 ID | 顺序 | 备注 |
|---------|----------|---------|------|------|
| *（尚无）* | — | — | — | 与 adapter 映射测试一并添加 |

## 维护

`Living` 时 adapter 测试与 Renderer 投影须穷尽处理；变体变更时更新本表。
