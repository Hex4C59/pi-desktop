# Security Policy

English | [中文](SECURITY.zh.md)

## Supported versions

The project has **no released application yet**. Security fixes apply to the default branch (`main`) and to tagged releases once they exist.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

1. Use [GitHub Private Vulnerability Reporting](https://github.com/github/securitylab/blob/main/documentation/private-vulnerability-reporting.md) for this repository if it is enabled, **or**
2. Open a **private** security advisory via the repository **Security → Advisories → Report a vulnerability** tab, **or**
3. Contact the repository maintainers through a private channel they publish in the repository README or organization profile.

Include:

- A clear description and impact (especially credential handling, IPC, filesystem access, or remote code execution).
- Steps to reproduce on Linux, if applicable.
- Affected commit or release tag, if known.

We will acknowledge receipt when possible and coordinate disclosure timing with you.

## Out of scope for this repository

- Vulnerabilities in upstream [pi](https://github.com/earendil-works/pi) itself—report those to the pi project unless they are introduced solely by pi-desktop integration code.
- Social engineering, stolen user API keys, or misuse of legitimate pi tooling outside this app's threat model.

## Secure development expectations

Contributors must follow [`AGENTS.md`](AGENTS.md) and [`docs/guides/agent/security.md`](docs/guides/agent/security.md):

- API keys and OAuth tokens must not reach the renderer, ordinary logs, or telemetry.
- Use the documented one-shot credential IPC pattern for new secrets.
- Do not expand IPC to arbitrary host code execution.

Thank you for helping keep users safe.
