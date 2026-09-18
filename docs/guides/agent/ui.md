# Agent playbook: UI

English | [中文](ui.zh.md)

- Type: Guide
- Status: Accepted
- Authority: renderer UX and accessibility constraints
- When: components, layout, interaction, visual states

## Must

- High-frequency developer tool: prioritize information density, scan efficiency, keyboard use, and stable layout—not marketing-page design.
- Tool calls, permission-related actions, run state, errors, and current working directory must be clearly visible.
- Streaming content must not cause uncontrolled movement of the composer, toolbar, or primary navigation.
- Long commands, paths, model names, and unbroken output must wrap, truncate, or scroll without covering adjacent controls.
- Support loading, empty, streaming, queued, aborting, error, offline, and crashed states.
- Use semantic controls with keyboard access, visible focus, and reasonable screen-reader labels.
- Icon buttons need tooltips and accessible names; prefer compact icon actions when sufficient.

## Pointers

- User-visible requirements: `docs/product-requirements.md`
- Renderer must not import host/pi deps: [boundaries.md](boundaries.md)
