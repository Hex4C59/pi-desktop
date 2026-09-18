# Agent playbook：UI

[English](ui.md) | 中文

- 类型：Guide
- 状态：Accepted
- 权威范围：Renderer 体验与无障碍约束
- 适用：组件、布局、交互、视觉状态
- 权威原文：[ui.md](ui.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 必须

- 高频开发工具：优先信息密度、扫描效率、键盘与稳定布局，非营销页设计。
- 工具调用、权限相关操作、运行状态、错误与当前工作目录须清晰可见。
- 流式内容不得导致输入区、工具栏或主导航不可控跳动。
- 长命令、路径、模型名与无换行输出须正确换行、截断或滚动，不遮挡相邻控件。
- 完整支持 loading、empty、streaming、queued、aborting、error、offline、crashed。
- 语义化控件、键盘可达、焦点可见、合理屏幕阅读器标签。
- 图标按钮须有 tooltip 与 accessible name；能用紧凑图标则不用大块文字按钮。

## 指针

- 用户可见需求：`docs/product-requirements.md`
- Renderer 不得依赖 host/pi：[boundaries.zh.md](boundaries.zh.md)
