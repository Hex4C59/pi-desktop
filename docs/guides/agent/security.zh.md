# Agent playbook：安全

[English](security.md) | 中文

- 类型：Guide
- 状态：Accepted
- 权威范围：安全与信任边界（L0 亦见 [AGENTS.md](../../../AGENTS.md)）
- 适用：IPC、preload、凭据、项目信任、shell、日志、不可信内容渲染
- 权威原文：[security.md](security.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 必须

- pi 以启动用户权限运行；项目信任不是沙箱——UI 与实现不得暗示相反结论。
- 已保存 API key、OAuth token 与认证文件内容不得回传 renderer，不得进入前端持久化、遥测、错误报告或普通日志；新凭据仅经专用一次性 IPC，提交后立即从 UI 状态清除。
- 在宿主校验 IPC/RPC 输入；仅暴露命名明确的 allowlist 操作；禁止通用「执行任意宿主代码」接口。
- Markdown、HTML、终端输出、diff、路径、链接与扩展 UI 按不可信处理；禁用任意脚本执行并限制外部导航。
- 不静默绕过 pi 项目信任；加载项目 `.pi` 资源前须有适用信任决策。
- 不将不受限制的绝对路径拼入 shell 命令；优先参数数组与结构化 API。
- 日志默认脱敏；避免记录完整 prompt、文件内容、环境变量与用户主目录敏感路径。
- 新增网络、shell、文件或凭据能力时，须同时加边界测试与失败处理（[testing.zh.md](testing.zh.md)）。

## 指针

- `docs/architecture/electron-architecture.md`（安全与持久化相关节）
- `../pi/packages/coding-agent/docs/security.md`
