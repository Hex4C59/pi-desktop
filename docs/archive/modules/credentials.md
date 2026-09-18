# Credentials Module

English | [中文](credentials.zh.md)

- Type: Module Design
- Status: Superseded
- Layer: Electron Main / Credentials
- Suggested implementation: `credential-coordinator.ts`
- Authority: Historical authentication responsibilities, ownership, security constraints, errors, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Responsibilities

Coordinate provider authentication use cases while ensuring that secrets exist only in Main and the pi credential store.

## Public Capabilities

- Query authentication status without secret values.
- Submit a new API key once.
- Initiate OAuth login.
- Log out.

## Ownership

pi manages persisted credentials. This module only coordinates operations and does not create a credential copy in Electron `userData`.

## Security Constraints

- Do not return a saved API key.
- Do not return OAuth access or refresh tokens.
- Do not send `auth.json` contents to the Renderer.
- Do not write credentials to logs, errors, or telemetry.
- The Renderer should clear input state after submission whether it succeeds or fails.

## Error Semantics

The module must recognize `CredentialSynchronizationError` to avoid blindly repeating a submission when credentials were written but subsequent synchronization failed.

## Testing Focus

Status queries, successful submission, partial synchronization failure, OAuth cancellation, logout, and secret scanning of all outputs.
