# Agent playbook：测试与验证

[English](testing.md) | 中文

- 类型：Guide
- 状态：Accepted
- 权威范围：测试要求与验证诚实性
- 适用：编写测试或声称任务完成
- 权威原文：[testing.md](testing.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 必须

- 测试不得依赖真实 API key、付费模型或不稳定外部服务。
- 用 fake provider、fixture 或 mock transport 验证 agent 行为。
- adapter 至少覆盖：流式文本/思考、工具生命周期、队列、中止、重试、压缩、错误、session replacement。
- IPC/RPC 至少覆盖：畸形输入、未知消息、乱序响应、子进程提前退出、stderr 噪声、请求超时。
- UI 关键流程用组件或 E2E 测试，含键盘与窄布局。
- 改代码后运行仓库 lint、typecheck 与受影响测试；改打包或 Linux 集成时另验证 dev 启动与安装产物。
- 不声称未实际运行的命令已通过；无法执行时说明原因。

## 任务完成

与 [AGENTS.md](../../../AGENTS.md) 完成标准一致：端到端行为、清理、测试已跑、安全边界未越界。
