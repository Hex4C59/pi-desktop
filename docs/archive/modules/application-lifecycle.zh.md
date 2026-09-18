# ApplicationLifecycle

[English](application-lifecycle.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[application-lifecycle.md](application-lifecycle.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/bootstrap/application-lifecycle.ts`
- 权威范围：历史首版应用生命周期的所有权、禁止事项和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

协调应用启动、窗口生命周期和全局退出清理。

## 所有权

拥有退出时的清理顺序与幂等状态。

## 不负责

不实现各资源的清理细节，不保存 session、附件或凭据。

## 测试重点

重复退出、窗口关闭、清理顺序和局部清理失败。
