# PiEventAdapter

[English](pi-event-adapter.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[pi-event-adapter.md](pi-event-adapter.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/pi/pi-event-adapter.ts`
- 权威范围：历史首版 pi 事件转换的规则、禁止事项和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

把 pi SDK event 转换成项目自己的可序列化 `DesktopEvent`。

## 转换规则

使用 `contentIndex` 关联 text/thinking，使用 tool call ID 关联工具生命周期；`message_update` 仅作增量，`message_end.message` 为权威完成消息，`partialResult` 为累计工具结果。

## 不负责

不拥有 generation，不分配 sequence，不发送 IPC，不替换 runtime。

## 测试重点

文本、thinking、工具、队列、abort、retry、compaction、完成消息权威替换和穷尽处理。
