# Runtime Controller 模块

[English](runtime-controller.md) | 中文

- 类型：Module Design
- 状态：Archived
- 翻译状态：Machine Draft
- 权威原文：[runtime-controller.md](runtime-controller.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 层级：Electron Main / Runtime
- 建议实现：`src/main/runtime/runtime-controller.ts`
- 上游文档：[模块设计索引](../module-structure.zh.md)

## 职责

作为活动 pi runtime 的唯一 owner，提供原子访问、替换和销毁边界。

## 拥有的状态

- 当前 runtime 引用；
- 当前 `runtimeGeneration`；
- 当前 runtime 生命周期状态；
- replacement 互斥区；
- 当前事件订阅句柄。

## 公共能力

- 在受控回调作用域中访问当前 session；
- 使用 factory 原子替换 runtime；
- 查询不泄漏 SDK 实例的一致性只读视图；
- 中止和 dispose 当前 runtime；
- 查询当前 generation 和状态。

## 不负责

- Workspace、session 和 prompt 用例编排；
- SDK 事件转换；
- event sequence 分配；
- Renderer snapshot 组装；
- IPC handler 注册。

## 关键契约

- 其他模块不得长期保存 `AgentSession`；
- replacement 必须串行；
- replacement 开始后旧 generation 失效；
- 新 runtime 创建失败时不得把旧 runtime 宣称为可用；
- `dispose()` 必须幂等。

## 依赖

可以依赖 runtime factory、状态机、事件订阅抽象和诊断模块。不得依赖 Renderer、Preload 或原始 IPC。

## 测试重点

- 并发 replacement；
- 创建失败后的明确错误状态；
- 旧订阅清理；
- generation 递增；
- 重复 dispose。
