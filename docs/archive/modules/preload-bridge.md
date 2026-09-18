# Preload Bridge Module

English | [中文](preload-bridge.zh.md)

- Type: Module Design
- Status: Archived
- Layer: Electron Preload
- Suggested implementation: `desktop-api-bridge.ts`, `runtime-event-buffer.ts`, `preload.ts`
- Parent document: [Module Design Index](../module-structure.md)

## Responsibilities

Serve as the sole bridge between the renderer and main process, expose a fixed, typed `PiDesktopApi`, and resolve snapshot/event races during initialization.

## Division of labor

- `DesktopApiBridge`: map API methods to fixed IPC channels;
- `RuntimeEventBuffer`: listen first and buffer events with bounds, then replay by sequence after snapshot handoff;
- `preload.ts`: minimal assembly entry point.

## Must not expose

- raw `ipcRenderer`;
- generic `send(channel, payload)`;
- generic `invoke(channel, payload)`;
- Node.js `process`, `fs`, or `child_process`;
- the full Electron API.

## Initialization contract

1. Install event listeners;
2. buffer events until the snapshot returns;
3. apply the snapshot in the renderer;
4. replay only events with sequence greater than the snapshot sequence;
5. switch to live consumption.

## Testing focus

Listener cleanup, buffer limits, event replay order, duplicate sequence values, and renderer reload.
