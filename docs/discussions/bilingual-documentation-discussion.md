# Bilingual Documentation Discussion

English | [中文](bilingual-documentation-discussion.zh.md)

- Type: Discussion
- Status: Accepted
- Created: 2026-09-18
- Last reviewed: 2026-09-18
- Authority: historical context for the bilingual documentation policy; not an implementation authority
- Final guide: [Bilingual Documentation Guide](../bilingual-documentation.md)

## 2026-09-18 — Selecting the bilingual documentation model

### Question

The repository needed a maintainable way to publish both English and Chinese documentation without losing translation quality or creating conflicting authorities.

### Research and options considered

The discussion reviewed common open-source approaches:

- separate README files;
- paired language files beside each other;
- mirrored locale directories;
- separate repositories for translation communities.

Paired files in the same directory were considered the best fit for the repository's current scale. Mirrored locale directories or separate repositories would add workflow and synchronization cost before the project has a documentation site or an independent translation community. Mixing English and Chinese paragraph by paragraph in one file was rejected because it harms scanning, linking, search, and maintenance.

### User decisions

The user confirmed:

- paired English and Chinese pages stay in the same directory;
- English keeps the ordinary `<name>.md` filename;
- Chinese uses `<name>.zh.md`;
- English is the authoritative source;
- the language switcher appears directly below the document title;
- the switcher is ordered as `English | 中文`;
- the current language is plain text and the other language is a link to the paired page.

### Translation-quality concern

The user explicitly raised concern that translations might be poor. The proposed response combined:

- one authoritative source language;
- separate translation status from document status;
- human review for important documents;
- technical verification for security and contract material;
- an English-to-Chinese glossary;
- source revision tracking and a visible stale state;
- automated structural, link, and drift checks;
- translating source diffs instead of regenerating whole reviewed documents.

### Result

The accepted policy is documented in the [Bilingual Documentation Guide](../bilingual-documentation.md). The guide also adds an incremental migration rule because existing ordinary `.md` files are predominantly Chinese: they retain their current authority until each complete English/Chinese pair is created and reviewed atomically.

### Deferred work

The discussion did not create:

- reviewed English translations for existing Chinese documents;
- a repository-wide migration schedule beyond priority guidance.

These are implementation tasks governed by the guide rather than unresolved policy questions.

A project glossary and `docs:i18n:check` were added on 2026-09-19; see [`reference/glossary.md`](../reference/glossary.md) and `npm run docs:i18n:check`.

## 2026-09-19 — First repository-wide bilingual migration

### Context

After accepting the bilingual guide, the user requested migrating all project documentation to paired `<name>.md` / `<name>.zh.md` files, normalizing older metadata layouts, and updating indexes.

### Work completed

- Migrated root `README.md`, `docs/README.md`, `AGENTS.md`, guides, requirements, architecture, discussions, decisions, and archive indexes.
- Archived historical single-runtime module designs under `docs/archive/modules/` with bilingual pairs; removed duplicate `docs/modules/` copies.
- English ordinary files are authoritative; Chinese translations are marked `Machine Draft` unless otherwise noted.
- Updated `docs/README.md` and `docs/README.zh.md` navigation and removed stale “Chinese only” labels where pairs exist.

### Remaining follow-ups

- Human review of high-risk documents (requirements, architecture, security-related material) before raising translation status.
- Replace `Uncommitted baseline` source-revision metadata with Git commit hashes after the first repository commit.
