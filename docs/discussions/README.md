# Discussion Log Index

English | [中文](README.zh.md)

- Type: Reference
- Status: Accepted
- Created: 2026-09-18
- Last reviewed: 2026-09-18
- Authority: navigation for discussion logs
- Maintenance guide: [Documentation Organization and Maintenance Guide](../document-conventions.md)

Discussion logs preserve the chronological formation of requirements, architecture, and design, including initial assumptions, user reasoning, agent analysis, options considered, rejected approaches, confirmed decisions, later corrections, and unresolved questions.

Discussion logs are historical context, not current implementation specifications. Current behavior is governed by Accepted Requirements, Decisions, Architecture, and Module Designs.

## Current logs

- [First Usable Version Product Requirements Discussion](product-requirements-discussion.md): formation of the product requirements for the first usable version.
- [Electron System Architecture Discussion](electron-architecture-discussion.md): formation of the revised multi-project, multi-task Electron system architecture.
- [Bilingual Documentation Discussion](bilingual-documentation-discussion.md): formation of the file-pairing, authoritative English source, and translation-quality rules.

## Maintenance principles

- By default, maintain one continuously appended discussion for each important final document.
- Do not mechanically create a new file for every conversation.
- Do not copy complete chats verbatim.
- Clearly distinguish user views, agent recommendations, and confirmed decisions.
- Do not remove early errors or uncertainty; mark supersession in a later timeline entry.
- Do not invent earlier reasoning based on the final conclusion.
- When updating a discussion, also check the corresponding final document and the [documentation index](../README.md).
