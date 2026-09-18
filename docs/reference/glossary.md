# pi-desktop Documentation Glossary

English | [中文](glossary.zh.md)

- Type: Reference
- Status: Accepted
- Created: 2026-09-19
- Last reviewed: 2026-09-19
- Authority: recommended English-to-Chinese translations for recurring pi-desktop and pi integration terms in paired documentation
- Related guide: [Bilingual Documentation Guide](../bilingual-documentation.md)

This glossary supports human reviewers and `docs:i18n:check`. It does not override English source documents. When a paired document already uses an entry consistently, keep that wording unless the English source changes.

Code identifiers, CLI commands, file paths, event names, and upstream API symbols stay in English in both languages unless surrounding prose explicitly introduces a Chinese gloss.

## Architecture and process boundaries

| English | Chinese | Notes |
| --- | --- | --- |
| desktop host | 桌面宿主 | Electron Main and privileged coordination layer; do not call it a sandbox. |
| renderer | Renderer | Keep the English role name in technical prose; gloss as 呈现层 when explaining responsibilities. |
| runtime | runtime | pi agent runtime; may write pi runtime when disambiguating from task record. |
| session | session | pi session binding; not 会话 unless quoting UI copy that uses 会话 deliberately. |
| task | 任务 | Top-level user-facing work unit in pi-desktop. |
| agent | Agent | Main pi agent; keep capital A when naming the role. |
| sub-agent | 子 Agent | Child agent run scoped to a parent task. |
| adapter | 适配器 | pi adapter layer between host services and the SDK or RPC transport. |
| lifecycle | 生命周期 | Startup, steady state, shutdown, and replacement semantics. |
| worktree | worktree | Git worktree isolation; not translated. |

## Messaging, queueing, and model behavior

| English | Chinese | Notes |
| --- | --- | --- |
| steering message | steering 消息 | In-flight redirection of the current run. |
| follow-up message | follow-up 消息 | Message queued while a run is active. |
| compaction | 压缩 | Context compaction; not 紧凑化. |
| thinking level | 思考级别 | pi thinking-level setting. |
| tool call | 工具调用 | Correlate with tool call ID in event text. |
| abort | 中止 | User-initiated stop of the current run. |
| cancellation | 取消 | Cooperative or system-driven cancel semantics. |
| retry | 重试 | Automatic or user-visible retry of a failed step. |

## Trust, credentials, and data

| English | Chinese | Notes |
| --- | --- | --- |
| project trust | 项目信任 | pi project-trust flow; not a permission sandbox. |
| credential | 凭据 | API keys, OAuth tokens, and auth file contents. |
| persistence | 持久化 | Saved application or task state; distinguish from pi session files. |
| recovery | 恢复 | Restart or journal-driven recovery after failure. |
| authoritative source | 权威原文 | English `<name>.md` for a migrated pair. |

## Normative language (RFC 2119 style)

Use these renderings in Chinese documentation when translating English normative keywords. Preserve inline English `must`, `should`, or `may` in code or quotations.

| English | Chinese |
| --- | --- |
| must | 必须 |
| must not | 不得 |
| should | 应 |
| should not | 不应 |
| may | 可以 |

## Disputed or context-sensitive terms

Mark alternatives in review instead of silently mixing them in one document:

| English | Preferred | Avoid or restrict |
| --- | --- | --- |
| desktop host | 桌面宿主 | 桌面主机 (use only if already fixed in a legacy page being revised holistically) |
| session (UI) | 会话 | Do not use for pi session identifiers. |
| contract | contract | Prefer keeping English in IPC and module boundaries; 约定 only in plain-language summaries. |

When adding a new recurring term, update this glossary in the same change as the English source and record the Chinese translation status separately in the paired page metadata.
