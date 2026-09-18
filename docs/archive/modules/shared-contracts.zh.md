# Shared Contracts 模块

[English](shared-contracts.md) | 中文

- 类型：Module Design
- 状态：Archived
- 翻译状态：Machine Draft
- 权威原文：[shared-contracts.md](shared-contracts.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 层级：跨进程纯 TypeScript
- 建议位置：`src/shared/`
- 上游文档：[模块设计索引](../module-structure.zh.md)

## 职责

定义 Main、Preload 和 Renderer 共同使用的可序列化领域类型、command/result/event contract 与 runtime schema。

## 文件划分

按用例域拆分：

- `workspace-contract.ts`；
- `session-contract.ts`；
- `agent-contract.ts`；
- `model-contract.ts`；
- `auth-contract.ts`；
- `attachment-contract.ts`；
- `extension-ui-contract.ts`；
- `runtime-contract.ts`；
- `desktop-api-contract.ts`。

通用领域文件：

- `command-result.ts`；
- `desktop-error.ts`；
- `desktop-event.ts`；
- `runtime-snapshot.ts`；
- `identifiers.ts`。

## 依赖约束

Shared 不依赖：

- Electron；
- Node.js；
- pi SDK；
- Main、Preload 或 Renderer 实现。

## Contract 要求

- 跨进程输入同时有 TypeScript 类型和 runtime schema；
- 使用可辨识联合表达 event 和 result；
- 使用带品牌的可序列化 ID 防止 session/tool/request ID 混用；
- 不包含 class、函数、自定义 prototype 或秘密；
- 不建立巨型 `types.ts`、`commands.ts` 或模糊 barrel。

## 测试重点

schema/type 一致性、structured clone、错误码稳定性和事件穷尽检查。
