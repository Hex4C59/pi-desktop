# MainWindow

[English](main-window.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[main-window.md](main-window.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/window/main-window.ts`
- 权威范围：历史首版主窗口的职责、安全配置、禁止事项和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

创建并持有主 `BrowserWindow`。

## 安全配置

启用 context isolation、sandbox 和 web security，禁用 node integration，只加载批准入口。

## 不负责

不处理业务 command，不接触 pi SDK，不暴露高权限 API。

## 测试重点

webPreferences、创建销毁、开发/生产入口和窗口通知。
