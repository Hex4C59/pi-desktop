# Credentials 模块

[English](credentials.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[credentials.md](credentials.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 层级：Electron Main / Credentials
- 建议实现：`credential-coordinator.ts`
- 权威范围：历史首版认证的职责、所有权、安全约束、错误和测试
- 上游文档：[模块设计索引](../module-structure.zh.md)

## 职责

协调 provider 认证用例，保证秘密只存在于 Main 和 pi credential store。

## 公共能力

- 查询不含秘密值的认证状态；
- 一次性提交新 API key；
- 发起 OAuth 登录；
- logout。

## 所有权

持久化凭据由 pi 管理。该模块只协调操作，不在 Electron `userData` 建立凭据副本。

## 安全约束

- 不返回已保存 API key；
- 不返回 OAuth access/refresh token；
- 不把 `auth.json` 内容发给 Renderer；
- 不把凭据写入日志、错误或遥测；
- Renderer 提交成功或失败后都应清空输入状态。

## 错误语义

必须识别 `CredentialSynchronizationError`，避免凭据已写入但后续同步失败时盲目重复提交。

## 测试重点

状态查询、提交成功、同步部分失败、OAuth 取消、logout 和所有输出的秘密扫描。
