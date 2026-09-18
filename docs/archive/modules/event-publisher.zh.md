# EventPublisher

[English](event-publisher.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[event-publisher.md](event-publisher.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/runtime/event-publisher.ts`
- 权威范围：历史首版事件发布的所有权、输入输出边界、禁止事项和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

为 `DesktopEvent` 分配顺序并发布给有效 Renderer。

## 所有权

拥有单调递增的 event `sequence`。

## 输入与输出

输入是已转换的 `DesktopEvent` 及所属 generation；输出是 `DesktopEventEnvelope`。

## 不负责

不转换 SDK event，不决定 generation，不修改 Renderer store，不记录完整事件 payload。

## 测试重点

sequence 单调性、失效 generation、窗口销毁竞态、发布顺序和当前 sequence 查询。
