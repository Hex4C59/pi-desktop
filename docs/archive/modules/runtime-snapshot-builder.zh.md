# RuntimeSnapshotBuilder

[English](runtime-snapshot-builder.md) | 中文

- 类型：Module Design
- 状态：Archived
- 翻译状态：Machine Draft
- 权威原文：[runtime-snapshot-builder.md](runtime-snapshot-builder.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/runtime/runtime-snapshot-builder.ts`
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

把一致性 runtime view 转换为可 structured-clone 的 `RuntimeSnapshot`。

## 输出内容

工作目录、session、完成消息、模型、thinking level、队列、token、费用、runtime 状态、脱敏诊断摘要、generation 和 sequence。

## 不负责

不读取活动 runtime，不修改状态，不分配 sequence，不返回 SDK class、凭据或原始错误。

## 测试重点

字段完整性、敏感字段排除、structured clone 兼容性和各种 runtime 状态。
