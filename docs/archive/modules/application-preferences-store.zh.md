# ApplicationPreferencesStore

[English](application-preferences-store.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[application-preferences-store.md](application-preferences-store.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/preferences/application-preferences-store.ts`
- 权威范围：历史首版应用偏好的持久化边界和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

持久化 pi-desktop 自己的非敏感应用偏好。

## 允许内容

主题、面板宽度、工具展开偏好、最近目录引用和明确列入 schema 的应用设置。

## 禁止内容

API key、OAuth token、session 消息、完整 prompt、文件内容和 pi 已管理的数据。

## 测试重点

schema 校验、安全默认值、损坏文件和迁移失败。
