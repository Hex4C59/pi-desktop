# PiRuntimeFactory

[English](pi-runtime-factory.md) | 中文

- 类型：Module Design
- 状态：Archived
- 翻译状态：Machine Draft
- 权威原文：[pi-runtime-factory.md](pi-runtime-factory.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 建议实现：`src/main/pi/pi-runtime-factory.ts`
- 索引：[模块设计索引](../module-structure.zh.md)

## 单一职责

根据经过验证的创建参数构造一个满足项目 runtime port 的 pi runtime adapter。

## 依赖

只使用固定版本 `@earendil-works/pi-coding-agent` 的公共 API。

## 不负责

不决定项目是否可信，不持有活动 runtime，不引用 `../pi` 内部文件，不直接发布 Renderer event。

## 契约

创建中途失败必须清理部分资源；正式构建不依赖同级源码目录。

## 测试重点

创建成功、资源加载失败、中途清理、dispose 以及打包环境导入。
