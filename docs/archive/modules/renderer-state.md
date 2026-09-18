# Renderer State Module

English | [中文](renderer-state.zh.md)

- Type: Module Design
- Status: Archived
- Layer: Electron Renderer / Store
- Suggested implementation: `renderer-store.ts`, `runtime-synchronizer.ts`
- Parent document: [Module Design Index](../module-structure.md)

## Responsibilities

Maintain the sole renderer projection of main-process snapshots and events, and coordinate first-time synchronization and desync recovery.

## RendererStore ownership

- current generation;
- last applied sequence;
- authoritative snapshot projection;
- transient text/thinking/tool streaming state;
- required short-lived shared UI state.

## RuntimeSynchronizer responsibilities

- subscribe to events before requesting a snapshot;
- complete preload buffer handoff;
- stop applying increments and request a fresh snapshot on sequence gaps;
- unsubscribe on teardown.

## Reducer rules

- discard stale generations;
- duplicate or out-of-order sequence must not corrupt state;
- `message.completed` replaces transient increments with the complete message;
- do not guess missing events;
- exhaustively handle `DesktopEvent`.

## Out of scope

- pi SDK business semantics;
- Electron or Node.js calls;
- credential persistence;
- copies of prompts or file contents in browser storage.

## Testing focus

Initialization races, stale generations, sequence gaps, completed-message replacement, and stable subscriptions under high-frequency deltas.
