/**
 * Configuration for docs:i18n:check.
 * Paths are repository-relative POSIX paths.
 */

/** English sources that must have a `.zh.md` translation (bilingual-documentation.md §6). */
export const REQUIRED_CHINESE_PAIRS = [
  'README.md',
  'AGENTS.md',
  'docs/README.md',
  'docs/product-requirements.md',
  'docs/architecture/electron-architecture.md',
  'docs/architecture-review-guide.md',
  'docs/desktop-framework-options.md',
  'docs/document-conventions.md',
  'docs/bilingual-documentation.md',
  'docs/git-commit-convention.md',
  'docs/guides/agent-collaboration.md',
  'docs/guides/agent/README.md',
  'docs/guides/agent/path-triggers.md',
  'docs/guides/agent/judgment.md',
  'docs/guides/agent/doc-drift-audit.md',
  'docs/guides/agent/change-policy.md',
  'docs/guides/agent/boundaries.md',
  'docs/guides/agent/pi-integration.md',
  'docs/guides/agent/security.md',
  'docs/guides/agent/typescript.md',
  'docs/guides/agent/ui.md',
  'docs/guides/agent/testing.md',
  'docs/guides/agent/commands.md',
  'docs/guides/agent/documentation.md',
  'docs/reference/glossary.md',
  'docs/reference/architecture-gates.md',
  'docs/reference/README.md',
  'docs/reference/ipc-channels.md',
  'docs/reference/domain-events.md',
  'docs/reference/task-and-runtime-states.md',
  'docs/reference/persistence-layout.md',
  'docs/modules/README.md',
  'docs/modules/ipc-registration.md',
  'docs/modules/application-lifecycle.md',
  'docs/modules/task-registry.md',
  'docs/modules/task-runtime-controller.md',
  'docs/modules/runtime-registry.md',
  'docs/archive/README.md',
  'docs/archive/electron-architecture.md',
  'docs/archive/module-structure.md',
];

/** Directories skipped when scanning markdown (repository-relative). */
export const IGNORE_DIR_NAMES = new Set(['.git', 'node_modules', '.agents']);

export const VALID_TRANSLATION_STATUSES = new Set([
  'Machine Draft',
  'Human Reviewed',
  'Technically Verified',
  'Stale',
]);

export const SOURCE_REVISION_UNCOMMITTED = 'Uncommitted baseline';
