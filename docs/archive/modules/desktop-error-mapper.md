# DesktopErrorMapper

English | [中文](desktop-error-mapper.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/ipc/desktop-error-mapper.ts`
- Authority: Historical error-mapping responsibility, output boundary, exclusions, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Convert an internal Main `unknown` failure into a safe, stable `DesktopError`.

## Output

An error code, user-visible message, recoverability, optional retry time, and `diagnosticId`.

## Out of Scope

This module does not leak the original Error, stack, prompt, environment variables, credentials, or sensitive complete paths, and it does not decide how the UI presents the error.

## Testing Focus

Known domain errors, unknown errors, cause chains, redaction, and stable error codes.
