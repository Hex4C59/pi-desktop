# WorkspaceCoordinator Module

English | [中文](workspace-coordinator.zh.md)

- Type: Module Design
- Status: Superseded
- Layer: Electron Main / Application
- Suggested implementation: `src/main/application/workspace-coordinator.ts`
- Authority: Historical workspace-opening orchestration, workflow, dependencies, exclusions, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Responsibilities

Orchestrate the complete application use case for selecting or opening a working directory.

## Input and Output

The input is a directory-selection or open request validated by the IPC schema; the output is a `WorkspaceSnapshot` or structured `DesktopError`.

## Workflow

1. Request a system directory selection or accept a candidate path;
2. Normalize and validate the real path;
3. Ask `ProjectTrustCoordinator` for a trust result;
4. Construct a runtime-creation request;
5. Call `RuntimeController.replace()`;
6. Persist the recent-directory reference after success;
7. Return the new workspace snapshot.

## Out of Scope

- Reading or writing the pi trust store;
- Loading project extensions before a trust decision;
- Holding a runtime/session long term;
- Converting SDK events;
- Sending IPC events directly to Renderer.

## Dependencies

Depends on a directory-selection port, path validator, `ProjectTrustCoordinator`, `RuntimeController`, and non-sensitive preference storage.

## Testing Focus

- The user cancels directory selection;
- The directory is invalid or disappears;
- Trust is denied or granted for this time only;
- Runtime replacement fails;
- The recent directory is not updated after failure.
