# Workspace Coordinator 模块

[English](workspace-coordinator.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[workspace-coordinator.md](workspace-coordinator.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 层级：Electron Main / Application
- 建议实现：`src/main/application/workspace-coordinator.ts`
- 权威范围：历史首版 workspace 打开用例编排、工作流、依赖、禁止事项和测试
- 上游文档：[模块设计索引](../module-structure.zh.md)

## 职责

编排“选择或打开工作目录”的完整应用用例。

## 输入与输出

输入为经 IPC schema 校验的目录选择或打开请求；输出为 `WorkspaceSnapshot` 或结构化 `DesktopError`。

## 工作流程

1. 请求系统目录选择或接收候选路径；
2. 规范化并验证真实路径；
3. 请求 `ProjectTrustCoordinator` 获取信任结果；
4. 构造 runtime 创建请求；
5. 调用 `RuntimeController.replace()`；
6. 成功后保存最近目录引用；
7. 返回新 workspace snapshot。

## 不负责

- 读写 pi trust store；
- 在信任决定前加载项目 extension；
- 长期持有 runtime/session；
- 转换 SDK 事件；
- 直接向 Renderer 发送 IPC event。

## 依赖

依赖目录选择 port、路径验证器、`ProjectTrustCoordinator`、`RuntimeController` 和非敏感偏好存储。

## 测试重点

- 用户取消目录选择；
- 非法或消失的目录；
- 信任拒绝和仅本次信任；
- runtime replacement 失败；
- 失败时不更新最近目录。
