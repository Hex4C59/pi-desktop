# Archive Documentation Index

English | [中文](README.zh.md)

- Type: Reference
- Status: Accepted
- Created: 2026-09-18
- Last reviewed: 2026-09-19
- Authority: navigation for archived documents
- Maintenance guide: [Documentation Organization and Maintenance Guide](../document-conventions.md) (Chinese translation available)

This directory stores complete documents that are no longer current but still have historical value.

Archived documents do not participate in current implementation decisions. Before archiving a document:

1. mark it `Superseded` or `Archived`;
2. link the document that replaces it;
3. update the index or known conflicts in [`../README.md`](../README.md);
4. repair relative links affected by the move.

## Current archive

- [`electron-architecture.md`](electron-architecture.md) ([中文](electron-architecture.zh.md)): the 2026-09-17 single-active-workspace, single-active-runtime Electron architecture proposal (`Superseded`); superseded by [`../architecture/electron-architecture.md`](../architecture/electron-architecture.md).
- [`module-structure.md`](module-structure.md) ([中文](module-structure.zh.md)): historical first-release module design index.
- [`modules/`](modules/): collection of historical single-runtime module design documents.
