# PiRuntimeAdapter

[English](pi-runtime-adapter.md) | 中文

- 类型：Module Design
- 状态：Archived
- 翻译状态：Machine Draft
- 权威原文：[pi-runtime-adapter.md](pi-runtime-adapter.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/pi/pi-runtime-adapter.ts`
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

用项目 runtime port 包装一个具体 pi SDK runtime 实例。

## 公共能力

提供 session、prompt、model、queue、abort 和事件订阅所需的窄操作，不泄漏 SDK 实例。

## 不负责

不拥有全局活动 runtime，不处理 Electron IPC/窗口，不决定 trust，不把 SDK 类型传入 shared 或 Renderer。

## 替换性

未来 utility process 或 RPC 实现应满足相同项目 port。

## 测试重点

SDK 操作映射、取消、错误 cause、引用清理和接口替身兼容性。
