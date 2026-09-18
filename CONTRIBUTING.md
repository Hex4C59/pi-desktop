# Contributing to pi-desktop

English | [中文](CONTRIBUTING.zh.md)

Thank you for your interest in this project. The repository is still in its **initialization phase**: there is no runnable application yet, and active work is tracked in [`ACTIVE.md`](ACTIVE.md).

## Before you open a PR

1. Read [`AGENTS.md`](AGENTS.md) for repository-level engineering and security constraints.
2. Read the [Agent collaboration guide](docs/guides/agent-collaboration.md) for how work items, gates, and reviews are handled.
3. Follow [`docs/git-commit-convention.md`](docs/git-commit-convention.md) (English commit messages, Conventional Commits).
4. For code changes, expect review against [`docs/guides/code-review.md`](docs/guides/code-review.md).

## What to contribute now

- Documentation fixes and clarifications (keep English/Chinese pairs in sync when you touch a paired page; see [`docs/bilingual-documentation.md`](docs/bilingual-documentation.md)).
- Discussions and spikes that align with the current work item in `ACTIVE.md`—do not open large unrelated feature PRs without maintainer agreement.

## Local checks

```bash
npm run docs:verify
```

CI runs the same command on pull requests (see [`.github/workflows/docs.yml`](.github/workflows/docs.yml)).

## Tests and pi integration

- Do not call real paid models in tests; use fake providers, fixtures, or controlled local substitutes.
- Do not commit API keys, OAuth tokens, or contents of pi auth files.
- The sibling `../pi` checkout is for local development only; production builds must not depend on it.

## Security issues

Please report security vulnerabilities as described in [`SECURITY.md`](SECURITY.md), not in public issues.

## Questions

Use GitHub Discussions or issues for questions that are not security-sensitive. For substantial design changes, check whether an ADR is required ([`docs/decisions/README.md`](docs/decisions/README.md)).
