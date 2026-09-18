# Attachments 模块

[English](attachments.md) | 中文

- 类型：Module Design
- 状态：Superseded
- 翻译状态：Machine Draft
- 权威原文：[attachments.md](attachments.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19
- 层级：Electron Main / Attachments
- 建议实现：`attachment-service.ts`
- 权威范围：历史首版附件的职责、所有权、约束、流程和测试
- 上游文档：[模块设计索引](../module-structure.zh.md)

## 职责

管理经系统文件选择器授权的短生命周期图片附件，使 Renderer 无需获得通用文件读取权限。

## 拥有的状态

- attachment token 到受控文件引用的映射；
- token 的窗口、generation、过期和消费状态。

## 工作流程

1. Renderer 请求选择图片；
2. Main 打开系统文件选择器；
3. 校验 MIME、扩展名、大小和可读性；
4. 签发随机、短生命周期 token；
5. Renderer 只持有 metadata 和 token；
6. prompt 提交时读取并消费 token；
7. 完成、取消、过期或窗口关闭时撤销。

## 不负责

- 通用文件浏览或任意路径读取；
- 长期缓存图片；
- 跨窗口、跨 session 或跨 generation 复用 token；
- 直接发送 prompt。

## 测试重点

类型伪造、超限文件、路径在选择后变化、重复消费、过期、窗口关闭和 replacement 清理。
