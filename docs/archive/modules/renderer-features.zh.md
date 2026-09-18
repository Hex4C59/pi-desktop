# Renderer Features 模块

[English](renderer-features.md) | 中文

- 类型：Module Design
- 状态：Archived
- 翻译状态：Machine Draft
- 权威原文：[renderer-features.md](renderer-features.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 层级：Electron Renderer / React
- 建议位置：`src/renderer/features/`
- 上游文档：[模块设计索引](../module-structure.zh.md)

## 职责

按用户能力组织 React 界面，只负责呈现、输入和短生命周期交互，不复制 pi runtime 语义。

## Feature 划分

### Conversation

展示完成消息、Markdown、代码、diff、thinking 和流式内容；消息时间线只有一份。

### Tools

按 tool call ID 展示工具开始、参数、partial result、完成和错误；处理长输出和无换行内容。

### Composer

拥有未提交草稿、附件 metadata 和输入焦点；调用 prompt/steer/follow-up/abort API，不把 optimistic queue 当权威状态。

### Sessions

展示列表和 create/switch/fork/rename 操作；不拥有 runtime 状态机。

### Models

展示模型、thinking level 和认证状态；不接触秘密值。

### Trust

显示项目风险并提交一次信任响应；不把信任描述为沙箱。

### Extension UI

展示语义化交互控件；extension 文本按不可信内容处理。

### Settings

只管理 pi-desktop 非敏感偏好。

## 通用约束

- 不导入 Electron、Node.js 或 pi SDK；
- 不直接依赖 Main 实现；
- 图标按钮有 tooltip 和 accessible name；
- loading、empty、streaming、queued、aborting、error、offline、crashed 状态完整；
- 窄窗口和长内容不破坏布局。

## 测试重点

键盘导航、焦点、流式稳定性、危险 Markdown/链接、窄窗口和所有关键状态。
