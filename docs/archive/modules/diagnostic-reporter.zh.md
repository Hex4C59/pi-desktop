# DiagnosticReporter

[English](diagnostic-reporter.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[diagnostic-reporter.md](diagnostic-reporter.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/diagnostics/diagnostic-reporter.ts`
- 权威范围：历史首版诊断的职责、脱敏边界、禁止事项和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

记录脱敏诊断并生成可关联的 `diagnosticId`。

## 脱敏范围

敏感路径、prompt、文件内容、环境变量、API key、token、认证文件和完整 IPC payload。

## 不负责

不成为通用 payload 倾倒点，不把原始诊断发给 Renderer，不保存业务权威状态。

## 测试重点

秘密扫描、路径脱敏、ID 关联、保留和清理策略。
