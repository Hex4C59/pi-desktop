# 参与贡献 pi-desktop

[English](CONTRIBUTING.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[CONTRIBUTING.md](CONTRIBUTING.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

感谢关注本项目。仓库仍处于**初始化阶段**：尚无可运行应用，进行中的工作见 [`ACTIVE.md`](ACTIVE.md)。

## 开 PR 之前

1. 阅读 [`AGENTS.zh.md`](AGENTS.zh.md)（[English](AGENTS.md)）了解仓库级工程与安全约束。
2. 阅读 [Agent 协作指南](docs/guides/agent-collaboration.zh.md)（[English](docs/guides/agent-collaboration.md)）了解工作项、gate 与评审流程。
3. 遵循 [`docs/git-commit-convention.zh.md`](docs/git-commit-convention.zh.md)（[English](docs/git-commit-convention.md)）：commit message 使用英文与 Conventional Commits。
4. 代码变更将按 [`docs/guides/code-review.zh.md`](docs/guides/code-review.zh.md)（[English](docs/guides/code-review.md)）验收。

## 当前适合贡献的内容

- 文档修正与澄清（修改双语配对页面时保持中英文同步，见 [`docs/bilingual-documentation.zh.md`](docs/bilingual-documentation.zh.md)）。
- 与 `ACTIVE.md` 当前工作项一致的设计讨论与 spike——未经维护者同意请勿提交大规模无关功能 PR。

## 本地检查

```bash
npm run docs:verify
```

CI 在 Pull Request 上运行相同命令（见 [`.github/workflows/docs.yml`](.github/workflows/docs.yml)）。

## 测试与 pi 集成

- 测试中勿调用真实付费模型；使用 fake provider、fixture 或受控本地替身。
- 勿提交 API 密钥、OAuth 令牌或 pi 认证文件内容。
- 并列的 `../pi` 检出仅用于本地开发；生产构建不得依赖该路径。

## 安全问题

请按 [`SECURITY.md`](SECURITY.md) 报告安全漏洞，勿在公开 issue 中披露。

## 提问

非敏感问题可使用 GitHub Discussions 或 Issues。重大设计变更请先确认是否需要 ADR（[`docs/decisions/README.zh.md`](docs/decisions/README.zh.md)）。
