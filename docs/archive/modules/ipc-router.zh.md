# IpcRouter

[English](ipc-router.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[ipc-router.md](ipc-router.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/ipc/ipc-router.ts`
- 权威范围：历史首版 IPC 校验和分派的职责、契约、禁止事项和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

在 IPC transport 与 application service 之间校验并分派 command。

## 契约

把输入视为 `unknown`，使用 command 对应 schema 收窄，调用固定 application handler，并返回统一 `CommandResult`。

## 不负责

不直接调用 pi SDK，不持有 runtime，不实现业务规则，不接受动态 channel 或 method 名。

## 测试重点

畸形输入、未知命令、分派准确性和错误转换。
