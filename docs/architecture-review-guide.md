# Software Architecture Review Guide

English | [中文](architecture-review-guide.zh.md)

- Type: Guide
- Status: Accepted
- Recorded: 2026-09-18
- Last reviewed: 2026-09-19
- Applies to: pi-desktop and similar desktop apps, long-running task apps, and high-privilege local tools
- Purpose: shared understanding and review of module decomposition, public interfaces, dependencies, contracts, and ownership, plus what else a complete software architecture must consider
- Authority: module decomposition, public interfaces, dependencies, contracts, ownership, and complete architecture review method
- Related document: [pi-desktop First-Release Electron System Architecture](architecture/electron-architecture.md)

## 1. Why this guide exists

Software architecture review cannot stop at abstract conclusions such as “clear structure,” “low coupling,” or “extensible.” Without evidence, risks, and next actions, those statements rarely guide implementation or become automated constraints and tests.

This guide answers four kinds of questions:

1. What problem each of module decomposition, public interfaces, dependencies, contracts, and ownership solves;
2. What language to use when judging whether each aspect is done well;
3. Whether software of different sizes must consider these aspects;
4. Beyond these five, what else a complete software architecture must consider.

A building analogy helps:

- **Module decomposition**: how rooms are divided;
- **Public interfaces**: which doors connect rooms;
- **Dependencies**: which directions people and supplies flow;
- **Contracts**: rules that must be followed when passing through doors;
- **Ownership**: who holds keys, maintains, and closes doors.

These five relate to each other but solve different problems.

## 2. Module decomposition

### 2.1 Definition

Module decomposition answers:

> What parts make up the system, what is each part responsible for, and what does it explicitly not do?

Modules can be:

- A process;
- A package;
- A directory;
- A service;
- A class;
- A group of related functions;
- A frontend feature.

For pi-desktop, process-level modules include:

```text
Renderer
Preload
Electron Main
Pi Runtime
```

Inside Electron Main:

```text
RuntimeController
PiAdapter
IpcRouter
ProjectTrustCoordinator
CredentialCoordinator
AttachmentService
ExtensionUiCoordinator
```

### 2.2 Purpose

#### Control complexity

When developing `AttachmentService`, you should not need to understand model selection, session replacement, and window restoration at the same time.

#### Isolate change

When the pi SDK upgrades, change should stay near `PiAdapter`, not spread across every renderer component.

#### Establish security boundaries

The renderer does not access Node.js directly; credentials are managed only by the main process.

#### Enable testing

You can verify independently:

- How `PiAdapter` transforms events;
- How `IpcRouter` rejects malformed input;
- How `AttachmentService` cleans expired tokens.

### 2.3 Criteria

Good module decomposition usually has:

- **Single responsibility**: a clear primary duty per module;
- **High cohesion**: related logic stays together;
- **Low coupling**: modules do not need extensive internal knowledge of others;
- **Clear reasons for change**: changes for different reasons land in different modules when possible;
- **Testable boundaries**: modules can be verified without starting the whole system;
- **Permissions match duties**: modules receive only capabilities needed for their role.

Common problems:

- One module manages windows, pi events, and credentials together;
- Multiple modules can mutate runtime directly;
- Changing one event field requires touching many unrelated modules;
- `Manager` or `Utils` modules keep expanding;
- Modules call each other in dependency cycles.

### 2.4 Recommended evaluation language

Do not say only:

> Module decomposition is reasonable.

Better:

> Modules are divided by process privileges and primary duties; boundaries among renderer, preload, main, and pi runtime are clear. Inside the main process, runtime, IPC, trust, credentials, and attachments are recognized as independent reasons for change.

Then name gaps:

> But the call boundary between `RuntimeController` and `PiAdapter` is not fixed; who directly executes prompt, abort, and session replacement is still ambiguous.

When evaluating, state:

- Principles used for decomposition;
- Which boundaries are clear;
- Where responsibilities overlap;
- Whether necessary modules are missing;
- Whether parts can be tested independently;
- Whether modules align with permission boundaries.

## 3. Public interfaces

### 3.1 Definition

Public interfaces answer:

> Through which operations can other modules use this module?

“Public” here does not necessarily mean third-party API. It can also be:

- Preload APIs available to the renderer;
- Runtime APIs callable from `IpcRouter`;
- Credential APIs callable from application services;
- Ports that test doubles must implement.

Example:

```typescript
interface AttachmentService {
  chooseImage(): Promise<AttachmentMetadata | null>;
  consume(token: AttachmentToken): Promise<ImageContent>;
  revoke(token: AttachmentToken): void;
  dispose(): void;
}
```

Callers know only these capabilities and must not depend on:

- Whether tokens live in a `Map` or database;
- How the file picker is invoked;
- How images are read;
- How expiry timers are implemented.

### 3.2 Purpose

#### Hide implementation details

Callers depend on capabilities, not internal data structures.

#### Limit permissions

The renderer can request “choose image,” not “read arbitrary absolute path.”

#### Support replacement

Future `SdkPiRuntimeAdapter` can become `RpcPiRuntimeAdapter` if both satisfy the same project domain interface.

#### Improve testability

Tests can supply fake implementations without starting a real pi runtime.

### 3.3 Criteria

Good public interfaces are usually:

- **Narrow**: expose only what callers truly need;
- **Explicit**: names, inputs, and outputs express business meaning;
- **Domain-oriented**: use project types, not leaking framework types;
- **Validatable**: cross-process or external input has runtime schema;
- **Recoverable**: errors, cancellation, and timeouts are explicit;
- **Complete**: callers need not bypass the interface to reach internal objects;
- **Relatively stable**: internal changes do not force every caller to change.

Too-wide interface:

```typescript
interface HostApi {
  invoke(method: string, args: unknown[]): Promise<unknown>;
}
```

Better interface:

```typescript
interface AgentApi {
  prompt(input: PromptInput): Promise<CommandResult<PromptAcceptance>>;
  abort(): Promise<CommandResult<void>>;
}
```

### 3.4 Interface is not the same as contract

An interface might say:

```typescript
abort(): Promise<void>
```

But not say:

- What happens when no task is running;
- Whether message queues are cleared;
- Whether the session is idle when the promise resolves;
- What happens on timeout;
- How concurrent session replacement is handled.

Those belong to contracts, not interface types alone.

### 3.5 Recommended evaluation language

Do not say only:

> Interfaces are clear.

Better:

> Preload interfaces for the renderer form a use-case-level outline without exposing generic IPC or Node capabilities; direction is correct.

Then gaps:

> But interfaces are still illustrative; `RuntimeSnapshot`, command inputs and outputs, domain event payloads, and error codes are not formally defined, so they cannot yet serve as executable contracts.

When evaluating, state:

- Whether interfaces are narrow enough;
- Whether they leak implementation types;
- Whether inputs and outputs are explicit;
- Whether runtime validation is possible;
- Whether callers can complete their work;
- Whether replacements and test doubles are supported.

## 4. Dependencies

### 4.1 Definition

Dependencies answer:

> Who may know whom, call whom, or import whom? What is the dependency direction?

For pi-desktop, a reasonable direction can be:

```text
Renderer
    ↓
Shared contracts
    ↑
Preload
    ↓
Electron IPC
    ↓
Main application services
    ↓
Runtime port
    ↓
Pi SDK adapter
    ↓
pi SDK
```

### 4.2 Purpose

#### Prevent boundary bypass

If the renderer imports pi SDK directly, preload and IPC security boundaries fail.

#### Control change propagation

The renderer depends on project domain types, not pi SDK types. pi SDK upgrades can stay near the adapter.

#### Prevent cycles

For example:

```text
RuntimeController → PiAdapter
PiAdapter → RuntimeController
```

Bidirectional dependency complicates initialization, testing, and lifecycle.

#### Clarify layers

High-level business rules should not depend on Electron IPC handlers directly; Electron adapters should call the business layer.

### 4.3 Criteria

Good dependencies usually have:

- **One direction**: most calls flow a fixed way;
- **No cycles**: the dependency graph has no loops;
- **Stable boundaries**: business logic depends on domain interfaces, not volatile framework details;
- **Framework at the edge**: Electron, pi SDK, and filesystem sit in adapter or infrastructure layers;
- **Automated checks**: lint, TypeScript project references, or directory rules block illegal imports;
- **Permissions do not flow backward**: the renderer cannot gain Node capabilities indirectly through shared modules.

Saying only “renderer must not depend on main” is insufficient; also require:

```text
shared must not depend on renderer, preload, main, Electron, Node.js, or pi SDK
```

Otherwise:

```text
Renderer → Shared → Main
```

can indirectly break boundaries.

### 4.4 Recommended evaluation language

Do not say only:

> Dependencies are reasonable with low coupling.

Better:

> Documentation already states the renderer does not depend on Electron, Node.js, or pi SDK, and `src/shared` is planned to stay pure TypeScript; basic dependency direction is correct.

Then gaps:

> But a full dependency graph is missing, and call order among `IpcRouter`, application services, runtime port, and SDK adapter inside main is not specified; illegal imports have no automated enforcement yet.

When evaluating, state:

- Dependency direction;
- Whether cycles exist;
- Whether frameworks sit at the edge;
- Whether high-level logic depends on abstractions;
- Which dependencies are explicitly forbidden;
- Whether rules can be enforced automatically.

## 5. Contracts

### 5.1 Definition

Contracts answer:

> When calling an interface or receiving an event, what behavior do both sides specifically promise?

Contracts are broader than TypeScript types. They include:

- Inputs;
- Outputs;
- Preconditions;
- Postconditions;
- Errors;
- State restrictions;
- Ordering;
- Concurrency;
- Cancellation;
- Timeouts;
- Idempotence;
- Resource release;
- Security and privacy rules.

Example interface:

```typescript
abort(): Promise<CommandResult<void>>
```

A full contract might include:

- Applies only to the current `runtimeGeneration`;
- Returns success when no active operation;
- Runtime enters `aborting` when abort starts;
- Session is idle when the promise resolves;
- By default does not clear steering/follow-up queue;
- Returns `OPERATION_TIMED_OUT` after 30 seconds without completion;
- Returns `SESSION_REPLACED` after session replacement begins;
- Multiple calls do not create parallel abort flows.

You cannot infer this from the function signature alone.

### 5.2 Purpose

#### Remove ambiguity

Implementers, callers, and tests share the same understanding of behavior.

#### Handle failure paths

Hard problems often come from:

- Concurrent calls;
- Mid-flight cancellation;
- Window close;
- Runtime replacement;
- Request timeout;
- Late events.

#### Generate tests directly

Preconditions, outcomes, errors, concurrency, and cleanup in contracts map to test cases.

#### Support cross-process communication

IPC sides cannot share objects or memory; they rely on explicit data and behavior agreements.

### 5.3 Criteria

Good contracts need:

- Explicit inputs and outputs;
- Explicit legal states;
- Explicit failure modes;
- Explicit cancellation and timeouts;
- Explicit event ordering;
- Explicit authoritative final data;
- Explicit concurrent behavior;
- Explicit idempotence;
- Explicit lifecycle boundaries;
- Ability to write automated tests.

Example:

> `message_end.message` is the authoritative completed message.

That is explicit and testable. Even if earlier deltas were lost or assembled incorrectly, state must be corrected from the full message after `message_end`.

### 5.4 Recommended evaluation language

Do not say only:

> IPC contracts are fairly complete.

Better:

> IPC already separates command, result, and event, and considers generation, sequence, snapshot sync, and authoritative `message_end` values; cross-process contract foundations are solid.

Then gaps:

> But internal module behavior contracts are incomplete, especially runtime state machine, command executable states, concurrent linearization, cancellation, timeout, and idempotence rules.

When evaluating, state:

- Whether data structures are explicit;
- Whether behavior semantics are explicit;
- Whether state and ordering are explicit;
- Whether errors, cancellation, and timeouts are explicit;
- Whether concurrent behavior is explicit;
- Whether contracts are test-verifiable.

## 6. Ownership

### 6.1 Definition

Ownership answers:

> Who is responsible for creating, modifying, replacing, and releasing a state or resource?

This is architectural responsibility, not language-level ownership alone.

Example:

```text
Resource: AgentSessionRuntime
Owner: RuntimeController
```

Only `RuntimeController` may:

- Create;
- Replace;
- Abort;
- Dispose;
- Decide which runtime is currently valid.

Other modules may use runtime capabilities through controlled interfaces but must not control lifecycle themselves.

### 6.2 What ownership applies to

Ownership applies not only to objects but also to:

- Runtime;
- Session subscription;
- Pending promises;
- Timers;
- Child processes;
- Event sequence;
- Attachment token;
- Extension UI request;
- Windows;
- IPC handlers;
- Logs or diagnostic records;
- Cache;
- Database connections;
- Renderer store.

### 6.3 Purpose

#### Prevent double release

Two modules both believing they should `dispose()` can cause double cleanup and exceptions.

#### Prevent nobody cleaning up

Multiple modules use one timer but no module stops it, causing leaks.

#### Prevent concurrent mutation

Two modules replacing the current session causes races and inconsistent state.

#### Clarify lifecycle

Know when resources are created, when they become invalid, and when they must be cleaned up.

### 6.4 Criteria

Good ownership design usually satisfies:

- Each long-lived resource has a single owner;
- Only the owner can replace or destroy the resource;
- Borrowers must not hold references longer than the owner;
- Creation and release duties are paired;
- Behavior on session replacement, window close, and app exit is explicit;
- The owner can cancel pending operations it created;
- Few entry points modify state.

Example ownership description:

```text
Resource: Extension UI pending request
Owner: ExtensionUiCoordinator
Created: extension initiates UI request
Normal completion: user responds
Other completion: cancel or timeout
Session replacement: cancel all
Window close: cancel all
App exit: cancel all
Duplicate response: reject
```

### 6.5 Recommended evaluation language

Do not say only:

> Ownership is fairly clear.

Better:

> `RuntimeController` is defined as the sole owner of `AgentSessionRuntime`, and other modules are forbidden from holding old `AgentSession` references long term; this core ownership design is clear.

Then gaps:

> But owners for `ModelRuntime`, SDK subscription, event sequence, attachment token, extension UI pending request, and diagnostic cause are not specified item by item.

When evaluating, state:

- Who creates the resource;
- Who may modify it;
- Who releases it;
- Who may hold references;
- When the resource becomes invalid;
- Handling on session replacement;
- Handling on window close and app exit;
- Cleanup on exceptional paths.

## 7. Recommended architecture evaluation structure

Architecture evaluation should not stop at “good” or “bad.” Use this four-part structure.

### 7.1 Current conclusion

Example:

> Module decomposition is basically clear but not yet unambiguous enough to implement without guesswork.

### 7.2 Completed parts and evidence

Example:

> Renderer, preload, main, and pi runtime are divided by privilege; credentials, trust, and attachment capabilities stay in the main process.

### 7.3 Specific gaps and risks

Example:

> Both `RuntimeController` and `PiAdapter` could be read as SDK call entry points. Without fixing the direct executor, multiple modules may hold `AgentSession` and mutate runtime concurrently.

### 7.4 Actionable improvements

Example:

> Add `PiRuntimePort`, require only `SdkPiRuntimeAdapter` to import pi SDK, and have `RuntimeController` own adapter lifecycle and operation serialization.

Each evaluation should contain:

```text
Conclusion
    ↓
Evidence
    ↓
Risk
    ↓
Action
```

Compared with “architecture is reasonable; refine later,” this is easier to guide development and acceptance.

## 8. Must all software development consider these five aspects?

### 8.1 Short answer

Yes, but not all need formal documents or heavy abstraction.

These questions always exist objectively:

- Code forms some structure;
- One part calls another;
- Calls have inputs and outputs;
- Some place modifies state;
- Resources are created and destroyed at some time.

The difference is:

> Whether you design these relationships deliberately or let them form randomly as code grows.

### 8.2 Design depth by scale

#### One-off small scripts

Usually consider only:

- Function inputs and outputs;
- Files and processes closed correctly;
- Errors reported;
- User data not corrupted.

No need for many interfaces or formal architecture documents.

#### Typical frontend pages

Usually consider:

- Feature and component division;
- API client boundaries;
- Server response types;
- State ownership;
- Side-effect cleanup;
- Error, loading, and empty states.

#### Desktop applications

Also consider:

- Process boundaries;
- System permissions;
- IPC;
- Window lifecycle;
- Local persistence;
- Install and upgrade;
- OS differences.

#### Coding agent desktop clients

Require stricter design because they combine:

- High-privilege file access;
- Shell execution;
- Streaming async events;
- Long-running work;
- User extensions;
- Provider credentials;
- Session persistence;
- Project switching;
- Electron multi-process.

Unclear interfaces, contracts, and ownership can directly cause:

- Commands running in the wrong directory;
- Old session events entering a new session;
- Credentials leaking to the renderer;
- Tasks continuing after window close;
- Extension UI promises never settling;
- Listener leaks after runtime replacement.

pi-desktop therefore deserves explicit design before large-scale coding.

### 8.3 Avoid over-engineering

“Must consider” does not mean “every function needs an interface.”

Simple functions with one caller, one implementation, and no cross-security or cross-process boundary usually need no dedicated port abstraction.

Prioritize formal interfaces and contracts at:

- Cross-process boundaries;
- Permission boundaries;
- External dependencies;
- Long-lived resources;
- Multiple implementations;
- Need for fake-based tests;
- Known replacement requirements.

## 9. Beyond the five aspects

These five mainly describe static structure and interaction responsibility. Complete software architecture also needs the following.

### 9.1 Requirements and scope

Answer:

- Which user problems the first release solves;
- Which features are explicitly out of scope;
- What success criteria are;
- Which scenarios are core paths;
- What is deferred.

Without clear scope, architecture tends to expand for hypothetical features.

### 9.2 Domain model

Answer:

- What is a workspace;
- What is a runtime;
- What is a session;
- What is a message;
- What is a tool execution;
- What is an attachment;
- How they relate.

Clarify for example:

```text
Workspace ≠ Runtime ≠ Session ≠ Conversation View
```

Otherwise UI, persistence, and runtime lifecycle get conflated.

### 9.3 State machines

Answer:

- Which states the system has;
- Which transitions are legal;
- How illegal operations are handled.

Example states:

```text
uninitialized
opening
ready
running
aborting
switching
error
crashed
disposing
disposed
```

Define transitions such as:

```text
ready → running
running → aborting
aborting → ready
ready → switching
switching → ready
switching → error
any active state → disposing → disposed
```

State machines are part of contracts but important enough for long-task apps to design separately.

### 9.4 Concurrency model

Answer:

- Which operations may run concurrently;
- Which must be serialized;
- Whether abort can preempt;
- Priority when session switch and prompt coincide;
- How to stop all work on app shutdown;
- How late events are handled.

pi-desktop should define especially:

- Runtime mutation queue;
- Mutual exclusion between prompt and replacement;
- Credential refresh versus model selection;
- Extension UI pending responses;
- Event sync on renderer reload.

### 9.5 Error and recovery strategy

Answer:

- Which errors are retriable;
- Which require rebuilding runtime;
- Which require app restart;
- What the user sees;
- How underlying cause is preserved;
- How to avoid leaking sensitive information.

Error handling is not only `try/catch`; it includes explicit recovery paths.

### 9.6 Security and trust model

Answer:

- Where trust boundaries lie;
- Which inputs an attacker might control;
- Which components hold system privileges;
- Where credentials are stored;
- Which data must not be logged;
- How external links are handled;
- What permissions extensions have.

For pi-desktop, clarify:

```text
Renderer sandbox
≠ Project trust
≠ Operating-system sandbox
```

These solve different problems and do not substitute for each other.

### 9.7 Data and persistence

Answer:

- Who saves which data;
- Where it is stored;
- Format;
- Whether encrypted;
- How to migrate;
- Recovery on corruption;
- Concurrent write handling;
- Whether flush is required before exit.

Even if pi manages sessions, Electron UI settings still need format, version, and migration strategy.

### 9.8 Lifecycle and cleanup

Answer:

- Startup order;
- Window creation order;
- When runtime is created;
- What happens on renderer reload;
- What happens on session replacement;
- What happens on window close;
- What happens on app exit;
- Whether forced exit after timeout.

Lifecycle relates closely to ownership but focuses on system-level time ordering.

### 9.9 Performance and backpressure

Answer:

- Streaming delta frequency;
- Whether every character crosses IPC;
- Whether the renderer re-renders excessively;
- How long tool output is truncated or virtualized;
- Event buffer limits;
- What happens when the renderer cannot keep up.

pi-desktop should consider especially:

- Text delta coalescing;
- Cumulative tool output updates;
- Virtual lists for long sessions;
- Preload buffer limits;
- Snapshot resynchronization.

### 9.10 Observability and privacy

Answer:

- What to log;
- Log level definitions;
- How diagnostic IDs are generated and queried;
- Whether crash data is collected;
- Whether performance metrics are recorded;
- What must be redacted;
- Log retention.

Coding agents should not log by default:

- Full prompts;
- File contents;
- API keys;
- Full environment variables;
- Sensitive full paths under the user home directory.

### 9.11 Test strategy

Answer:

- What unit tests verify;
- What contract tests verify;
- What component tests verify;
- What E2E verifies;
- Post-packaging smoke tests;
- How to avoid real paid models;
- How to simulate failure, timeout, and races.

Tests should derive from contracts, not pick a few happy paths after implementation.

### 9.12 Build, release, and upgrade

Answer:

- How dependencies are pinned;
- How to build;
- How to produce RPM/deb and other packages;
- Installed program and data paths;
- How to upgrade;
- How old-version data migrates;
- How to roll back on failure.

Electron should additionally verify:

- Bundled Node.js version;
- ASAR;
- Native modules;
- WASM;
- Chromium sandbox;
- Different Linux distributions.

### 9.13 Compatibility and versioning

Answer:

- Supported pi SDK versions;
- What to verify on upstream upgrade;
- Whether IPC has schema version;
- Whether persistence format has version;
- Which breaking changes are allowed during early development;
- How to migrate after release.

The project currently allows breaking changes, but version mismatch must fail explicitly, not be silently ignored.

### 9.14 User experience and accessibility

Answer:

- How loading, empty, error, offline, and crashed states appear;
- Keyboard operation and focus management;
- Screen reader usage;
- Long commands and unbroken output display;
- Whether streaming content causes layout jump;
- How dangerous actions are confirmed.

Architecture affects UX directly. For example, `ExtensionUiCoordinator` lifecycle determines whether modals cancel correctly and restore focus.

## 10. General architecture review framework

When reviewing any software architecture, ask these questions in order.

### 10.1 Structure

- What modules does the system have?
- What is each module responsible for?
- What does each module explicitly not do?

### 10.2 Boundaries

- What interfaces does each module expose externally?
- What capabilities must not be exposed?
- Do boundaries match permissions and reasons for change?

### 10.3 Direction

- Who depends on whom?
- Are there cycles?
- Are there layer violations?
- Can dependency rules be checked automatically?

### 10.4 Behavior

- What contracts do calls and events obey?
- How are failure, concurrency, cancellation, and timeout handled?
- Which data is authoritative?

### 10.5 Responsibility

- Who owns state and resources?
- Who creates, modifies, replaces, and releases?
- Who cleans up on exceptional paths?

### 10.6 Time

- What happens at startup, during operation, on switch, and on shutdown?
- What is the system state machine?
- How are late events handled?

### 10.7 Data

- Where is data stored and by whom?
- How is it migrated, recovered, and cleaned up?
- Which data is sensitive?

### 10.8 Risk

- What are security, crash, performance, and privacy risks?
- How are risks detected, limited, and recovered?

### 10.9 Verification

- How do types, schema, lint, and tests prove the design?
- Which constraints exist only in documents?
- Which constraints need automated enforcement?

## 11. Architecture maturity levels

Use these levels to describe how complete architecture is.

### 11.1 Direction level

Technology direction and main process boundaries are chosen, but modules, interfaces, and behavior still rely heavily on implementer judgment.

### 11.2 Structure level

Major modules, duties, and dependency direction are defined, but public interfaces, state machines, and resource ownership remain incomplete.

### 11.3 Implementable level

Defined:

- Module duties;
- Allowed and forbidden dependencies;
- Key public interfaces;
- Command/event/snapshot contracts;
- State machine and concurrency rules;
- Long-lived resource ownership;
- Error, cancellation, and cleanup strategy.

Developers can start implementation without inventing key architectural rules.

### 11.4 Verifiable level

Beyond implementable level, key rules are automated through:

- TypeScript types;
- Runtime schema;
- Lint/import boundaries;
- Contract tests;
- State machine tests;
- Lifecycle and cleanup tests;
- Packaging smoke tests.

### 11.5 Evolvable level

Also has:

- Compatibility and versioning strategy;
- Persistence migration;
- Upstream upgrade process;
- Observability;
- Performance baselines;
- Failure recovery;
- Release and rollback strategy.

The project need not reach the highest level before coding starts, but critical security and lifecycle boundaries should reach implementable level early and move to verifiable level quickly.

## 12. pi-desktop current review example

Using this guide, the current Electron architecture can be described as follows.

### 12.1 Current conclusion

Macro layering and main security boundaries are in place; maturity is **structure level**, not yet fully **implementable level** without ambiguity.

### 12.2 Module decomposition

**Conclusion: basically clear.**

Evidence:

- Renderer, preload, Electron main, and pi runtime are separated;
- Main process identifies runtime, IPC, trust, credentials, and attachment duties;
- High-privilege capabilities concentrate in the main process.

Gaps:

- SDK call boundary between `RuntimeController` and `PiAdapter` is not fixed;
- `ExtensionUiCoordinator` and diagnostics modules are not fully in the formal directory structure.

### 12.3 Public interfaces

**Conclusion: outline exists, not formally complete.**

Evidence:

- Shapes exist for `PiDesktopApi`, `CommandResult<T>`, `DesktopError`, and `DesktopEventEnvelope`;
- Preload does not expose generic IPC or Node capabilities.

Gaps:

- `PiRuntimePort` not defined;
- `RuntimeSnapshot` not formally defined;
- Command inputs/outputs and event payloads not fixed item by item;
- `DesktopError.code` is still too wide as `string`.

### 12.4 Dependencies

**Conclusion: direction correct, explicit rules and dependency graph missing.**

Evidence:

- Renderer does not depend on Electron, Node.js, or pi SDK;
- `src/shared` is planned to stay pure TypeScript.

Gaps:

- No formal dependency graph inside main for `IpcRouter → application service → runtime port → SDK adapter`;
- Forbidden dependencies not fully listed;
- No lint or TypeScript config yet enforcing illegal imports.

### 12.5 Contracts

**Conclusion: IPC outer contracts have foundation; internal module contracts and state machine incomplete.**

Evidence:

- Command, result, and event are separated;
- `runtimeGeneration`, `sequence`, and snapshot sync are designed;
- `message_end.message` is authoritative for completed messages.

Gaps:

- Runtime state machine not formally defined;
- Allowed command states not defined item by item;
- Concurrency, linearization, idempotence, cancellation, and timeout rules not fully documented.

### 12.6 Ownership

**Conclusion: core runtime ownership clear; other long-lived resources need detail.**

Evidence:

- `RuntimeController` is sole owner of `AgentSessionRuntime`;
- Other modules are forbidden from holding old `AgentSession` long term.

Gaps:

- Owner of `ModelRuntime`;
- Owner of SDK subscription;
- Owner of event sequence;
- Owner of preload event buffer;
- Owner of attachment token;
- Owner of extension UI pending request;
- Owner of diagnostic cause.

### 12.7 Next steps

Before large-scale UI and pi adapter implementation, prioritize:

1. Module dependency rules and forbidden dependencies;
2. Internal public interfaces such as `PiRuntimePort`;
3. Formal domain contracts for command/event/snapshot;
4. Runtime state machine and concurrency rules;
5. Long-lived resource ownership and cleanup matrix.

Performance and backpressure, logging and privacy, Electron local config format and migration can refine around scaffold and minimal runtime spike, but must not be omitted before release.

## 13. Architecture review template

Copy this template for future reviews:

```markdown
## Review subject

- Name:
- Scope:
- Current phase:

## 1. Current conclusion

One sentence on maturity and the most important gap.

## 2. Module decomposition

- Conclusion:
- Completed and evidence:
- Gaps:
- Risks:
- Improvements:

## 3. Public interfaces

- Conclusion:
- Completed and evidence:
- Gaps:
- Risks:
- Improvements:

## 4. Dependencies

- Conclusion:
- Completed and evidence:
- Gaps:
- Risks:
- Improvements:

## 5. Contracts

- Conclusion:
- Completed and evidence:
- Gaps:
- Risks:
- Improvements:

## 6. Ownership

- Conclusion:
- Completed and evidence:
- Gaps:
- Risks:
- Improvements:

## 7. Other dimensions

- Requirements and scope:
- Domain model:
- State machine and concurrency:
- Errors and recovery:
- Security and trust:
- Data and persistence:
- Lifecycle and cleanup:
- Performance and backpressure:
- Observability and privacy:
- Test strategy:
- Build, release, and upgrade:
- Compatibility and versioning:
- User experience and accessibility:

## 8. Follow-up actions

1. 
2. 
3. 
```

## 14. Summary

Module decomposition, public interfaces, dependencies, contracts, and ownership answer five foundational questions:

```text
What is the system made of?
How are modules used?
What is the call direction?
What rules must interactions obey?
Who owns the full lifecycle of state and resources?
```

These five are not formalities for large projects only; any software naturally forms this structure. The more complex, higher-privilege, longer-lived, and more concurrent the project, the more you should design and record them deliberately.

High-quality architecture review should always include:

```text
Conclusion + evidence + risk + action
```

Documents express constraints only. Key constraints must ultimately land as types, schema, lint, state machines, and automated tests to turn “design intent” into “verifiable architecture.”
