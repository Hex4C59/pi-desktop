# Agent playbook：变更策略

[English](change-policy.md) | 中文

- 类型：Guide
- 状态：Accepted
- 权威范围：agent 破坏性变更与范围规则（见 [AGENTS.md](../../../AGENTS.md) 加载地图）
- 适用：重构、目录、IPC 契约、依赖、内部模型
- 权威原文：[change-policy.md](change-policy.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 必须

- 初始化早期：尚无稳定公开 API、持久化、IPC 与迁移承诺；必要破坏性变更可接受，但须限定在当前任务。
- 不得以破坏性变更为无计划重构掩护；删除不再需要兼容的废弃实现。
- 破坏性变更不得违反 [security.zh.md](security.zh.md)，不得将 `../pi`、机器路径或未声明依赖引入正式构建。
- 影响用户可见行为、开发/测试/构建命令、pi SDK/RPC 策略、安全边界、凭据/session 存储或未来迁移面时——在 commit message、架构文档或 `README.md` 记录。
- 不为假设的向后兼容保留复杂内部/实验/未发布功能的适配层。
- 多方案可行时，优先降低验证成本、边界清晰、可替换，而非过早承诺长期兼容。
- 对外发布、已有用户数据或稳定协议后，应重估策略并补充迁移方案（发生时写入文档）。

## 建议

- 优先与 `ACTIVE.md` 工作项一致的纵向切片，避免全仓库重写。

## 验证

- 变更范围与已批准工作项一致；同一任务内不进行无关重构、批量格式化或依赖升级（见 [typescript.zh.md](typescript.zh.md)）。
