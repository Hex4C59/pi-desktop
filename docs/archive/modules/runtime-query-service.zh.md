# RuntimeQueryService

[English](runtime-query-service.md) | 中文

- 类型：Module Design
- 状态：Archived
- 翻译状态：Machine Draft
- 权威原文：[runtime-query-service.md](runtime-query-service.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/application/runtime-query-service.ts`
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

取得当前 runtime 的一致性只读视图，并协调生成 Renderer 所需的 `RuntimeSnapshot`。

## 输入与输出

无业务 payload 输入；输出包含 generation、sequence 的可序列化 snapshot。

## 依赖

依赖 `RuntimeController`、`RuntimeSnapshotBuilder` 和 `EventPublisher` 的 sequence 查询能力。

## 不负责

不修改 runtime，不订阅 SDK event，不长期缓存 snapshot，不直接处理 IPC。

## 测试重点

并发 replacement 时的一致性、空 runtime、crashed 状态及 snapshot/event 边界。
