# NavigationPolicy

[English](navigation-policy.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[navigation-policy.md](navigation-policy.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/window/navigation-policy.ts`
- 权威范围：历史首版导航策略的职责、契约和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

校验页面导航、新窗口和外部链接行为。

## 契约

禁止任意窗口与远程应用代码；只允许批准协议交给系统浏览器；拒绝 `javascript:` 和任意 `file:` URL。

## 测试重点

协议混淆、编码 URL、页面跳转、新窗口和模型输出构造的链接。
