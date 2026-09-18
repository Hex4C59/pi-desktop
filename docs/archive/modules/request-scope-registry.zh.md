# RequestScopeRegistry

[English](request-scope-registry.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[request-scope-registry.md](request-scope-registry.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/ipc/request-scope-registry.ts`
- 权威范围：历史首版 IPC 请求取消的所有权、禁止事项和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

管理 IPC 请求与发起窗口之间的取消关系。

## 所有权

拥有 window/request 到 `AbortController` 的映射。

## 不负责

不决定取消是否等同于 agent abort，不清理 runtime，不保存 command payload。

## 测试重点

请求完成释放、窗口销毁、超时、应用退出和重复取消。
