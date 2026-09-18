# Agent playbook: Security

English | [中文](security.zh.md)

- Type: Guide
- Status: Accepted
- Authority: security and trust boundaries (L0 items also in [AGENTS.md](../../../AGENTS.md))
- When: IPC, preload, credentials, project trust, shell, logging, rendering untrusted content

## Must

- pi runs with the launching user's privileges; project trust is not a sandbox—UI and implementation must not imply otherwise.
- Saved API keys, OAuth tokens, and authentication file contents must not return to the renderer or enter frontend persistence, telemetry, error reporting, or ordinary logs. New credentials may cross only a dedicated one-shot IPC channel and must be cleared from UI state immediately after submission.
- Validate IPC/RPC input in the host. Expose only explicitly named allowlisted operations; no generic “run arbitrary host code” interface.
- Treat Markdown, HTML, terminal output, diffs, file paths, links, and extension UI as untrusted; disable arbitrary script execution and restrict external navigation.
- Do not silently bypass pi's project trust flow; require an applicable trust decision before loading project `.pi` resources.
- Do not concatenate unrestricted absolute paths into shell commands; prefer argument arrays and structured APIs.
- Redact logs by default; avoid logging full prompts, file contents, environment variables, and sensitive paths under the user's home directory.
- When adding network, shell, file, or credential capabilities, add boundary tests and failure handling at the same time ([testing.md](testing.md)).

## Pointers

- `docs/architecture/electron-architecture.md` (security and persistence sections)
- `../pi/packages/coding-agent/docs/security.md`
