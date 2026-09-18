# TrustPromptCoordinator

[English](trust-prompt-coordinator.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[trust-prompt-coordinator.md](trust-prompt-coordinator.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/trust/trust-prompt-coordinator.ts`
- 权威范围：历史首版项目信任提示的所有权、清理契约、禁止事项和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

管理 Main 与 Renderer 之间待响应的项目信任请求。

## 所有权

拥有 trust request ID 到 pending Promise 的映射。

## 不负责

不决定项目是否可信，不读写 trust store，不加载资源。

## 清理契约

取消、超时、窗口关闭和应用退出必须结束 pending Promise，且每个请求只 resolve 一次。

## 测试重点

错误 request ID、重复响应、超时、窗口归属和退出清理。
