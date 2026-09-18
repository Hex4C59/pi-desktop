# WindowStateStore

[English](window-state-store.md) | 中文

- 类型：Module Design
- 状态：Archived
- 翻译状态：Machine Draft
- 权威原文：[window-state-store.md](window-state-store.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/window/window-state-store.ts`
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

持久化主窗口的非敏感几何状态。

## 内容

尺寸、位置和最大化状态；恢复时确保窗口仍位于可用显示区域。

## 不负责

不保存 feature 偏好、session、prompt、文件内容或凭据。

## 测试重点

多显示器变化、无效坐标、损坏状态和安全默认值。
