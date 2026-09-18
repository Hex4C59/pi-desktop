# IpcRegistration

[English](ipc-registration.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[ipc-registration.md](ipc-registration.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/ipc/ipc-registration.ts`
- 权威范围：历史首版 IPC 注册的职责、禁止事项和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

注册和撤销固定 allowlist IPC handler。

## 不负责

不校验业务 payload，不实现 command 分支，不提供动态 channel 注册。

## 测试重点

固定 channel、重复注册、撤销和退出清理。
