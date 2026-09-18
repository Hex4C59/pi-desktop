# Agent playbook：文档

[English](documentation.md) | 中文

- 类型：Guide
- 状态：Accepted
- 权威范围：何时及如何更新仓库文档
- 适用：创建、移动、拆分或实质性修改文档
- 权威原文：[documentation.md](documentation.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 必须

- 创建、移动、拆分、归档或实质性修改项目文档前，阅读 [`docs/document-conventions.zh.md`](../../document-conventions.zh.md)，并维护 [`docs/README.zh.md`](../../README.zh.md) 的索引、权威来源与已知冲突。简单拼写与不改变结构的小修可不读全文。
- 实质性讨论创建或显著修改需求、架构、模块设计、安全、持久化、协议或重要决策时，须创建或更新 `docs/discussions/` 中按时间组织的讨论日志；不逐字复制聊天；区分用户思考、代理建议、选项、已确认决定、被取代假设与未决问题。
- 普通代码修改与无设计决策的任务不需要讨论日志。当前行为以需求、Accepted ADR、架构与模块文档为准——不以 discussion 或 archive 为实现依据。

## README 与架构同步

以下变化须更新 `README.md` 与相关架构文档：

- 桌面/UI 框架或包管理器；
- pi SDK 与 RPC 策略；
- Node.js、系统库或 Linux 要求；
- 配置、凭据、session 或应用数据存储位置；
- 开发、测试、打包与发布命令；
- 已实现功能、限制与平台支持。

引用 pi 行为时链接具体上游文档；不复制易过时的大段内容。

## 双语

遵循 [`docs/bilingual-documentation.zh.md`](../../bilingual-documentation.zh.md) 的英文原文与中文译文配对规则。

## 漂移与一致性

- 实质性文档变更或关闭文档相关工作项前，在仓库根目录运行 `npm run docs:verify`。
- 脚本之外的语义漂移按 [doc-drift-audit.zh.md](doc-drift-audit.zh.md) 产出 dated 审计报告；审计期间未经维护者批准不得重写 PRD/架构正文。
