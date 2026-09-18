# Attachments Module

English | [中文](attachments.zh.md)

- Type: Module Design
- Status: Superseded
- Layer: Electron Main / Attachments
- Suggested implementation: `attachment-service.ts`
- Authority: Historical attachment responsibilities, ownership, constraints, workflow, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Responsibilities

Manage short-lived image attachments authorized through the system file picker so that the Renderer does not need general file-read access.

## Owned State

- Mapping from attachment tokens to controlled file references.
- The window, generation, expiration, and consumption state associated with each token.

## Workflow

1. The Renderer requests image selection.
2. Main opens the system file picker.
3. Validate MIME type, extension, size, and readability.
4. Issue a random, short-lived token.
5. The Renderer retains only metadata and the token.
6. Read and consume the token when the prompt is submitted.
7. Revoke it on completion, cancellation, expiration, or window close.

## Out of Scope

- General file browsing or arbitrary path reads.
- Long-term image caching.
- Reusing tokens across windows, sessions, or generations.
- Sending prompts directly.

## Testing Focus

Spoofed types, oversized files, paths that change after selection, repeated consumption, expiration, window close, and replacement cleanup.
