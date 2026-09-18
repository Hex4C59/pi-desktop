# Model Coordinator 模块

[English](model-coordinator.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[model-coordinator.md](model-coordinator.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 层级：Electron Main / Application
- 建议实现：`src/main/application/model-coordinator.ts`
- 权威范围：历史首版模型编排的能力、禁止事项、依赖和测试
- 上游文档：[模块设计索引](../module-structure.zh.md)

## 职责

编排模型列表、模型选择和 thinking level 变更。

## 公共能力

- 返回可序列化 provider/model 摘要；
- 选择当前模型；
- 设置模型支持的 thinking level；
- 返回不含秘密值的认证需求状态。

## 不负责

- API key 或 OAuth token 的提交和存储；
- 暴露 `ModelRuntime`；
- 自行持久化 pi 模型设置；
- 直接更新 Renderer store。

## 依赖

通过项目 runtime port 使用模型能力；认证写操作委托 `CredentialCoordinator`。

## 测试重点

- 非法模型 ID；
- 不支持的 thinking level；
- 缺少认证；
- runtime switching 时的冲突；
- 返回值不包含凭据。
