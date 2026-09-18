# Renderer Features Module

English | [中文](renderer-features.zh.md)

- Type: Module Design
- Status: Archived
- Layer: Electron Renderer / React
- Suggested location: `src/renderer/features/`
- Parent document: [Module Design Index](../module-structure.md)

## Responsibilities

Organize the React UI by user-facing capability. Responsible only for presentation, input, and short-lived interaction—not for reimplementing pi runtime semantics.

## Feature breakdown

### Conversation

Render completed messages, Markdown, code, diffs, thinking content, and streaming output. Maintain a single message timeline.

### Tools

Show tool start, arguments, partial results, completion, and errors by tool call ID. Handle long output and content without line breaks.

### Composer

Own unsubmitted drafts, attachment metadata, and input focus. Call prompt/steer/follow-up/abort APIs without treating an optimistic queue as authoritative state.

### Sessions

Show the list and create/switch/fork/rename actions. Does not own the runtime state machine.

### Models

Show model, thinking level, and authentication status. Does not touch secret values.

### Trust

Surface project risk and submit a one-shot trust response. Must not describe trust as a sandbox.

### Extension UI

Render semantic interaction controls. Treat extension text as untrusted content.

### Settings

Manage only non-sensitive pi-desktop preferences.

## General constraints

- do not import Electron, Node.js, or the pi SDK;
- do not depend directly on main-process implementation;
- icon buttons need tooltips and accessible names;
- fully support loading, empty, streaming, queued, aborting, error, offline, and crashed states;
- narrow windows and long content must not break layout.

## Testing focus

Keyboard navigation, focus, streaming stability, unsafe Markdown/links, narrow layouts, and all critical states.
