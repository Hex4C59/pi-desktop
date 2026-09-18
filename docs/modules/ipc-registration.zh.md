# IpcRegistration 与 IpcRouter

[English](ipc-registration.md) | 中文

- 类型：Module Design
- 状态：stub
- 创建：2026-09-19
- 上次评审：2026-09-19
- Owner：`IpcRegistration`、`IpcRouter`（固定 allowlist 面）
- Planned code path：`src/main/ipc/`；preload：`src/preload/`
- 权威原文：[ipc-registration.md](ipc-registration.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 职责

- 注册**固定** IPC channel/handler 集合；禁止动态或通用宿主执行 API。
- 在 Main 用 TypeScript 类型与运行时 schema 校验所有入站消息。
- 将合法命令路由到应用服务；返回可序列化结果与错误。
- 与 `RequestScopeRegistry` 协调取消与窗口生命周期（WI-002 定细节）。

## 排除

- 业务状态所有权（任务、runtime、worktree、凭据）。
- 直接调用 pi SDK 或 Git。
- 仅以 Renderer 校验作为安全边界。

## 依赖

- `shared/contracts/`（随脚手架引入）。
- `ApplicationLifecycle`（窗口关闭/退出时清理 pending IPC）。

## 测试焦点

- 畸形与未知消息安全拒绝。
- Allowlist：未注册 channel 不可调用。
- 乱序/重复响应不破坏 handler 状态。
- 超时与提前关窗取消作用域内请求。
- 错误载荷不向 Renderer 泄露凭据。

## 接口

TBD — channel 列表与 schema 在 **WI-002** 定义。本 stub 不发明 channel 名。

## 未决

- Preload API 形态（WI-002）。
- 与 [ipc-channels 契约](../reference/ipc-channels.zh.md)（WI-002 前为 `Planned`）同步维护 channel 登记表。
