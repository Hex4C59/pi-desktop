# SingleInstancePolicy

[English](single-instance-policy.md) | 中文

- 类型：Module Design
- 状态：Archived
- 翻译状态：Machine Draft
- 权威原文：[single-instance-policy.md](single-instance-policy.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/bootstrap/single-instance-policy.ts`
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

保证首版只有一个应用实例，并把第二实例请求转换成受验证的应用意图。

## 不负责

不直接打开目录，不信任传入路径，不执行 shell。

## 测试重点

首次锁、第二实例唤起、异常参数和已有窗口销毁。
