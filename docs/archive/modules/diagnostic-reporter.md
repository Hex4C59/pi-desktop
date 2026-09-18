# DiagnosticReporter

English | [中文](diagnostic-reporter.zh.md)

- Type: Module Design
- Status: Superseded
- Suggested implementation: `src/main/diagnostics/diagnostic-reporter.ts`
- Authority: Historical diagnostic responsibility, redaction boundary, exclusions, and tests for the first release
- Parent document: [Module Design Index](../module-structure.md)

## Single Responsibility

Record redacted diagnostics and generate a correlatable `diagnosticId`.

## Redaction Scope

Sensitive paths, prompts, file contents, environment variables, API keys, tokens, authentication files, and complete IPC payloads.

## Out of Scope

This module is not a general payload dumping ground, does not send raw diagnostics to the Renderer, and does not store authoritative business state.

## Testing Focus

Secret scanning, path redaction, ID correlation, retention, and cleanup policy.
