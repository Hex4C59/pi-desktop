# DesktopErrorMapper

[English](desktop-error-mapper.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[desktop-error-mapper.md](desktop-error-mapper.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/ipc/desktop-error-mapper.ts`
- 权威范围：历史首版错误映射的职责、输出边界、禁止事项和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

把 Main 内部 `unknown` 失败转换成安全、稳定的 `DesktopError`。

## 输出

错误码、用户可见消息、可恢复性、可选 retry 时间和 `diagnosticId`。

## 不负责

不泄漏原始 Error、stack、prompt、环境变量、凭据或敏感完整路径，也不决定 UI 展示方式。

## 测试重点

已知领域错误、未知错误、cause 链、脱敏和稳定错误码。
