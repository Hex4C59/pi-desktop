# Agent playbook: Change policy

English | [中文](change-policy.zh.md)

- Type: Guide
- Status: Accepted
- Authority: breaking-change and scope rules for agents (see [AGENTS.md](../../../AGENTS.md) load map)
- When: refactors, directory layout, IPC contracts, dependencies, internal models

## Must

- Early initialization: stable public APIs, persistence, IPC, and migration promises do not exist yet; necessary breaking changes are acceptable when scoped to the current task.
- Do not use breaking changes as cover for unplanned refactors. Remove obsolete code that no longer needs compatibility.
- Breaking changes must not violate [security.md](security.md) or pull `../pi`, machine paths, or undeclared deps into production builds.
- When a change affects user-visible behavior, dev/test/build commands, pi SDK/RPC strategy, security boundaries, credential/session storage, or future migration surfaces—record it in commit message, architecture docs, or `README.md`.
- Do not keep complex compatibility layers for internal APIs, experiments, or unreleased features for hypothetical backward compatibility.
- When multiple approaches work, prefer lower validation cost, clear boundaries, and replaceability over early long-term compatibility promises.
- After public release, user data, or stable protocols exist, revisit policy and add migration plans (document when that happens).

## Should

- Prefer vertical slices that match `ACTIVE.md` work items over repo-wide rewrites.

## Verify

- Change scope matches the approved work item; unrelated refactors, bulk format, and dependency upgrades are not bundled into the same task ([typescript.md](typescript.md)).
