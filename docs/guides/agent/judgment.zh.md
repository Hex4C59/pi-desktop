# Agent playbook：判断与如实回答

[English](judgment.md) | 中文

- 类型：Guide
- 状态：Accepted
- 创建：2026-09-19
- 上次评审：2026-09-19
- 适用：开放性问题、做/不做、「还能做什么」「我理解对吗」
- 权威范围：agent 回答模式；不凌驾内核、PRD 或维护者决策
- 相关：[`AGENTS.md`](../../../AGENTS.zh.md)（判断与诚实 L0）、[协作指南](../agent-collaboration.zh.md)
- 权威原文：[Judgment and honest answers](judgment.md)
- 翻译状态：Machine Draft
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

下文**示例仅作说明**。涉及工作项或 gate 时，以磁盘上的 **`ACTIVE.md` 与 reference 文档**为准。

## 回答前自问

1. 维护者要的是**判断**还是**执行**？
2. 是否已读 `ACTIVE.md` 及将引用的文件——还是在猜？
3. 所列每一项能否指向文件、阶段或已跑过的命令？
4. 若诚实答案是「当前没有必须项」，就直接说。

## A. 优化 / 「还能做什么」

### A1 — 文档流程刚落地

- **问：**「`docs:verify` 和漂移 playbook 都有了，还有哪些要优化？」
- **宜：**「WI-001 前文档侧无必须项；可选：日后 CI 跑 `docs:verify`。现在不会新开文档 WI。」
- **忌：** 无依据地堆 skill、重写 PRD、WI-006…010。
- **因：** `ACTIVE.md` 已排优先级；凑项会分散 WI-001。

### A2 — 更多 Cursor skill？

- **问：**「很多做法是不是都该做成 skill？」
- **宜：**「不必系统性做；一个薄 handoff 目前够用；再多易与 playbook 双份权威。」
- **忌：**「好主意，再加五个 skill。」
- **因：** 维护者在权衡重复；**可以不做**是正确答案。

### A3 — 明确头脑风暴

- **问：**「**头脑风暴**一下一年后可能用的文档工具。」
- **宜：** 列想法并标 **可选 / 延后**；停车场风格；说明非承诺。
- **忌：** 把 brainstorm 写成「你下一步就该做这些」。
- **因：** 任务类型不同；列想法可以，但须标优先级。

## B. 是不是 / 谁来做

### B1 — 谁跑 `docs:verify`？

- **问：**「是不是每次都要我自己判断何时跑 verify？」
- **宜：**「不必你记。大改 docs、关文档 WI 前 agent 应跑。完整漂移报告按 `doc-drift-audit` 触发器——不是每场会话都要报告。」
- **忌：**「对，都要你自己判断。」（把负担推回来问的人。）
- **因：** 如实描述 playbook 已有分工。

### B2 — Skill 会自动触发吗？

- **问：**「handoff 这类 skill agent 能自己判断吗？」
- **宜：**「设计为按 description 由模型选用；**不保证**每次命中。兜底仍是 AGENTS、playbook 与 `docs:verify`。」
- **忌：**「完全自动，只靠 skill 就行。」
- **因：** 启发式工具 vs 硬保证。

### B3 — 关 gate / ADR

- **问：**「Spike 做完了，能关 `gate-build-baseline` 吗？」
- **宜：**「仅在你验收 spike 并确认基线之后；此前保持 `In spike`、更新 Last session、不写 Accepted ADR。」
- **忌：** 未确认就起草 Accepted `0001` 或将 gate 标为 Accepted。
- **因：** 过早同意违反 `ACTIVE.md` 与 `decisions/README.md` 的 ADR 策略。

## C. 前提有误

### C1 — 把规划说成已交付

- **问：**「Electron 壳已经能连 pi 会话了吧？」
- **宜：**「还没有——WI-001 建造前无应用脚手架；当前无业务 `src/` IPC。」
- **忌：**「差不多有了，再 polish…」
- **因：** `README.md` 与 `ACTIVE.md` 的初始化阶段事实。

### C2 — 以 archive 为权威

- **问：**「按 `archive/modules` 实现 IPC。」
- **宜：**「不行——以当前 `docs/modules/`、`docs/reference/` 与内核为准；archive 仅历史背景。」
- **忌：**「好的，按 archive 写。」

## D. 提案与协作

### D1 — 下一步做什么？

- **问：**「接下来做什么最好？」
- **宜：** 复述排队 #1（WI-001）。若维护者未批准建造，保持准备阶段——不悄悄搭脚手架。
- **忌：** 未更新 `ACTIVE.md` 就开工 WI-002 或并行多个 WI。

### D2 — 「我这样理解对吗？」

- **问：**「关 gate 一定要有 Accepted ADR，我理解对吗？」
- **宜：**「对，**且** spike 后须维护者确认；进行中只 `In spike`、无 Accepted ADR。」（若错则指出错句。）
- **忌：**「完全正确！」却不核对「确认」步骤。

## E. 自检（元）

维护者问「还有什么要改进？」时：

- 空列表 +「**本阶段没有必须项**」是合法回答。
- 简短可选项须标 optional 并有依据。
- 为显得积极而编造工作项属于**内核违反**——见 `AGENTS.md` 判断与诚实（L0）。
