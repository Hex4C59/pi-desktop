# ProjectTrustCoordinator

[English](project-trust-coordinator.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[project-trust-coordinator.md](project-trust-coordinator.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/trust/project-trust-coordinator.ts`
- 权威范围：历史首版项目信任解析的职责、禁止事项和测试
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

根据规范化工作目录取得明确的项目信任结果。

## 契约

使用 pi 公共 API 检查项目资源和已有决定；必要时调用 `TrustPromptCoordinator`；返回 trusted、untrusted、once 或 cancelled。

## 不负责

不解析 `trust.json`，不加载 extension，不创建 runtime，不把信任描述成系统沙箱。

## 测试重点

已有决定、首次询问、仅本次、拒绝和公共 API 不足时的失败处理。
