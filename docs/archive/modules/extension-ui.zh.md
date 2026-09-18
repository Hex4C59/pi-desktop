# Extension UI 模块

[English](extension-ui.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[extension-ui.md](extension-ui.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 层级：Electron Main + Renderer Feature
- 建议实现：`extension-ui-coordinator.ts`、`extension-request-dialog.tsx`
- 权威范围：历史首版扩展交互的职责、所有权、清理、约束和测试
- 上游文档：[模块设计索引](../module-structure.zh.md)

## 职责

把 pi extension 的 `select`、`confirm`、`input`、`editor` 和 `notify` 请求桥接成可取消的桌面领域交互。

## Main 所有权

`ExtensionUiCoordinator` 拥有 request ID 到 pending Promise 的映射。请求绑定 runtime generation、窗口和可选 timeout。

## Renderer 职责

使用语义化控件展示请求并回传结构化响应；所有 extension 文本按不可信纯文本处理。

## 清理契约

以下情况必须取消 pending 请求：

- session replacement；
- runtime crash；
- 窗口关闭；
- 应用退出；
- 请求超时。

## 不负责

- 执行 extension 提供的 HTML 或脚本；
- 打开任意远程 UI；
- 将旧 generation 响应交给新 runtime；
- 持久化用户输入。

## 测试重点

所有请求类型、重复响应、旧 generation、超时和各类清理路径。
