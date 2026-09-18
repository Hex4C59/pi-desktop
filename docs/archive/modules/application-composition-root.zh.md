# ApplicationCompositionRoot

[English](application-composition-root.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[application-composition-root.md](application-composition-root.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/bootstrap/application-composition-root.ts`
- 权威范围：历史首版 composition root 的职责、边界和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

创建具体模块实例并连接依赖。

## 边界

这是唯一允许集中了解多数 Main 具体实现的地方；它不执行业务规则，也不充当运行期 service locator。

## 测试重点

装配完整性、初始化顺序和部分初始化失败清理。
