# Bilingual Documentation Guide

English | [中文](bilingual-documentation.zh.md)

- Type: Guide
- Status: Accepted
- Created: 2026-09-18
- Last reviewed: 2026-09-18
- Applies to: repository documentation maintained in English and Chinese
- Authority: language pairing, source authority, translation status, review, synchronization, links, and migration
- Related guide: [Documentation Organization and Maintenance Guide](document-conventions.md)
- Discussion: [Bilingual Documentation Discussion](discussions/bilingual-documentation-discussion.md)

## 1. Purpose

This guide defines how pi-desktop maintains English source documents and Chinese translations without creating two competing definitions of the same requirement, architecture, decision, or process.

The goals are to:

1. make the authoritative text unambiguous;
2. let readers switch languages from the same location on every paired page;
3. make translation quality and freshness visible;
4. prevent translation work from silently changing technical meaning;
5. keep synchronization reviewable as documents evolve.

## 2. Core policy

- English is the authoritative source language.
- An English source keeps the ordinary `.md` filename, such as `runtime-orchestration.md`.
- Its Chinese translation uses the same basename with `.zh.md`, such as `runtime-orchestration.zh.md`.
- Both files live in the same directory.
- A Chinese translation is a localized representation of its English source, not a second authority.
- If the two versions conflict, the English source governs.
- A translation may improve Chinese readability, but must not add, remove, weaken, strengthen, or reinterpret requirements and decisions.
- Errors in the source must be fixed in English first and then synchronized to Chinese. Translation-only errors may be fixed in the Chinese file alone.

This language authority is separate from document authority and status. For example, an English `Draft` remains non-final even though it is authoritative over its Chinese translation.

## 3. File pairing and language switcher

Examples:

```text
README.md
README.zh.md

docs/product-requirements.md
docs/product-requirements.zh.md

docs/archive/modules/shared-contracts.md
docs/archive/modules/shared-contracts.zh.md
```

Every paired document must place a language switcher immediately after the level-one title and before metadata or body text.

In the English source:

```markdown
# Document Title

English | [中文](document.zh.md)
```

In the Chinese translation:

```markdown
# 文档标题

[English](document.md) | 中文
```

The order is always `English | 中文`. The current language is plain text; the other language is a relative link. Do not use flag icons or redirect readers to a general language index when a paired page exists.

An unpaired English document does not need a nonfunctional switcher. Indexes may label a missing Chinese translation explicitly, but must not link to a placeholder page.

## 4. Metadata

The English source owns document type, document status, authority, scope, supersession, and relationships. The Chinese translation mirrors those facts in Chinese and must not assign itself a different document status.

A Chinese translation must additionally declare:

- translation status;
- authoritative English source;
- source revision when a stable Git revision is available;
- last synchronization date.

Recommended Chinese metadata:

```markdown
- 类型：Architecture
- 状态：Accepted
- 翻译状态：Human Reviewed
- 权威原文：[document.md](document.md)
- 原文版本：`<Git commit>`
- 最近同步：2026-09-18
```

Before the repository has a stable commit for the source, use `Uncommitted baseline` for the source revision. Replace it with a Git commit as soon as the pair is committed; do not treat an uncommitted baseline as durable synchronization evidence.

The English source does not need translation metadata.

## 5. Translation status

Use only these translation states:

- `Machine Draft`: machine-generated or substantially machine-rewritten and not yet checked line by line;
- `Human Reviewed`: checked against the complete English source for accuracy and completeness by a human reviewer;
- `Technically Verified`: human-reviewed and additionally checked by a maintainer competent in the relevant technical or product domain;
- `Stale`: the English source has changed beyond the recorded source revision and the translation has not been synchronized.

Translation status is independent of `Draft`, `Proposed`, `Accepted`, `Superseded`, and `Archived` document status.

A translation must not claim `Human Reviewed` merely because a model performed a second pass or back-translation. A reviewer may use automated assistance, but the status represents human accountability.

## 6. Required coverage and priority

Bilingual maintenance is required for:

- the root README and documentation index;
- accepted requirements and decisions intended for contributors;
- current architecture and security-boundary documents;
- contributor procedures needed to build, test, package, or release the application.

Drafts may be authored in English first and translated after their structure stabilizes. Module designs and reference documents should be translated according to contributor need and implementation priority.

Discussion logs, archives, superseded documents, raw research notes, and generated reference output do not require full translation by default. Their indexes should explain language availability. A summary may be translated instead of the full historical record, but it must not be presented as a complete translation.

## 7. Translation workflow

For a new paired document:

1. Write or update the complete English source.
2. Confirm its type, status, authority, and relationships.
3. Translate with the current project glossary and the full source context.
4. Preserve code, identifiers, commands, paths, URLs, event names, and normative strength.
5. Run structural and link checks.
6. Review the Chinese translation against the English source.
7. Record translation status, source revision, and synchronization date.
8. Update indexes and paired links in the same change.

For an existing pair:

1. change the English source first;
2. review the source diff rather than regenerating the entire Chinese document;
3. apply the corresponding Chinese changes;
4. check surrounding paragraphs for terminology and logical continuity;
5. update the synchronization metadata;
6. mark the translation `Stale` if synchronization cannot be completed in the same change.

Do not overwrite previously reviewed translation prose by regenerating an entire document for a small source change.

## 8. Quality requirements

Review must prioritize semantic fidelity over literal sentence structure or stylistic polish.

Every translated change must be checked for:

- omissions and information added without support from the source;
- changed negation, conditions, exceptions, scope, ownership, or lifecycle;
- changes to `must`, `must not`, `should`, `may`, and equivalent normative strength;
- confusion between implemented, accepted, proposed, planned, and unsupported behavior;
- altered numbers, versions, limits, paths, commands, identifiers, or links;
- inconsistent project terminology;
- unsafe changes to security, credential, trust, IPC, persistence, or recovery statements;
- heading, list, table, code-block, and cross-reference completeness.

README files, accepted requirements, ADRs, security documentation, IPC contracts, persistence formats, and build or release instructions require at least `Human Reviewed`. Security boundaries, public contracts, and irreversible decisions should reach `Technically Verified` before their Chinese translation is treated as dependable implementation guidance.

Machine drafts must display their status and must not be the only text relied upon for security-sensitive or irreversible work.

## 9. Terminology

The project maintains one English-to-Chinese glossary at [`reference/glossary.md`](reference/glossary.md) ([中文](reference/glossary.zh.md)). Reviewers must preserve established translations across paired documents and flag disputed terms instead of silently introducing variants.

The glossary covers at least:

- desktop host, renderer, runtime, session, task, agent, and sub-agent;
- steering message, follow-up message, compaction, and thinking level;
- project trust, credential, tool call, adapter, worktree, and lifecycle;
- abort, cancellation, retry, recovery, persistence, and authoritative source;
- normative terms such as `must`, `should`, and `may`.

Code identifiers and upstream API names remain unchanged unless the surrounding prose explicitly explains a translated term.

## 10. Links and indexes

- Paired documents link directly to each other using relative paths.
- Within Chinese prose, link to the Chinese target when a current paired translation exists; otherwise link to the English source and make the language clear when it may surprise the reader.
- English sources normally link to English targets.
- Renaming or moving either file requires updating both switchers, indexes, inbound links, and synchronization metadata.
- Documentation indexes must identify the English source as authoritative and must not list a stale translation as if it were current.

## 11. Automation

Run `npm run docs:i18n:check` from the repository root (see `package.json`). The check verifies mechanically testable invariants:

- `.zh.md` files have a matching English `.md` source;
- paired switchers are present, reciprocal, and correctly ordered;
- required translation metadata exists;
- the recorded source revision exists and whether the source changed afterward;
- relative links resolve;
- fenced code blocks, code fence languages, paths, commands, and protected identifiers have not changed unexpectedly;
- required paired documents have a Chinese translation;
- stale translations are visible in indexes or CI output.

Structural differences such as paragraph or heading counts may produce warnings, not unconditional failures, because accurate translation can require sentence restructuring. Automated checks support review; they do not certify translation quality.

## 12. Migration of existing Chinese documents

Most current repository documents were written in Chinese under ordinary `.md` names. They must not become English-authoritative merely because this guide has been accepted.

Migration is incremental and atomic per document pair:

1. select a current Chinese document;
2. preserve it as `<name>.zh.md`;
3. create and review the English `<name>.md` source;
4. add reciprocal language switchers and translation metadata;
5. update all affected links and indexes;
6. confirm that the English version faithfully represents the previously accepted meaning;
7. only then declare the English file authoritative for that pair.

Until a pair completes this process, the existing document retains its current authority and language. Do not leave an ordinary `.md` file with placeholder English text, silently downgrade accepted content during translation, or perform a repository-wide rename without reviewed English replacements.

Migrate in this order unless project needs require otherwise:

1. `README.md` and `docs/README.md`;
2. documentation and contribution guides;
3. accepted decisions, requirements, architecture, and security documents;
4. active module designs and references;
5. lower-priority historical material only when there is demonstrated reader need.

## 13. Change review checklist

Before merging a bilingual documentation change, confirm:

- the English source is the only semantic authority for a migrated pair;
- document status and translation status are not conflated;
- both language switchers point to the corresponding page;
- the Chinese metadata identifies the correct source and revision;
- all source changes are represented in Chinese or the translation is marked `Stale`;
- normative strength, implementation status, security boundaries, and technical identifiers are preserved;
- relevant indexes, discussion links, and related documents are updated;
- no secret, credential, sensitive path, or unsupported implementation claim was introduced.
