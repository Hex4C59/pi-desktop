# 安全策略

[English](SECURITY.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[SECURITY.md](SECURITY.md)
- 原文版本：`Uncommitted baseline`
- 最近同步：2026-09-19

## 受支持版本

项目**尚无已发布应用**。安全修复适用于默认分支（`main`）以及未来存在的带 tag 的发布版本。

## 报告漏洞

**请勿在公开 GitHub Issue 中披露安全漏洞。**

1. 若仓库已启用，请使用 [GitHub 私有漏洞报告](https://github.com/github/securitylab/blob/main/documentation/private-vulnerability-reporting.md)，**或**
2. 在仓库 **Security → Advisories → Report a vulnerability** 中提交**私有**安全公告，**或**
3. 通过 README 或组织资料中公布的私有渠道联系维护者。

请尽量提供：

- 清晰描述与影响（尤其是凭据处理、IPC、文件系统访问或远程代码执行）。
- 在 Linux 上的复现步骤（如适用）。
- 受影响的 commit 或发布 tag（如已知）。

我们会在可能时确认收到，并与您协调披露时间。

## 本仓库范围外

- 上游 [pi](https://github.com/earendil-works/pi) 自身的漏洞——应向 pi 项目报告，除非问题仅由 pi-desktop 集成代码引入。
- 社会工程、用户 API 密钥被盗，或在本应用威胁模型之外滥用合法 pi 工具。

## 安全开发要求

贡献者须遵守 [`AGENTS.zh.md`](AGENTS.zh.md) 与 [`docs/guides/agent/security.zh.md`](docs/guides/agent/security.zh.md)：

- API 密钥与 OAuth 令牌不得进入渲染进程、普通日志或遥测。
- 新增机密须使用文档化的一次性凭据 IPC 模式。
- 不得将 IPC 扩展为任意主机代码执行。

感谢您帮助保护用户安全。
