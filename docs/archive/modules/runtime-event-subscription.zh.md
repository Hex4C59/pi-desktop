# RuntimeEventSubscription

[English](runtime-event-subscription.md) | 中文

- 类型：Module Design
- 状态：Archived
- 翻译状态：Machine Draft
- 权威原文：[runtime-event-subscription.md](runtime-event-subscription.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/runtime/runtime-event-subscription.ts`
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

绑定一个特定 runtime generation 的 SDK 事件源，并提供可靠、幂等的取消订阅。

## 所有权

拥有该次订阅的 generation 和 unsubscribe/dispose 句柄。

## 依赖

把 SDK event 交给 `PiEventAdapter`，再把领域事件交给 `EventPublisher`。

## 不负责

不替换 runtime，不分配 sequence，不查询当前 generation 来重写已捕获 generation，不保存 Renderer 状态。

## 测试重点

dispose 后无事件、重复 dispose、旧 generation、listener 泄漏和事件转换失败。
