# First Usable Version Product Requirements Discussion

English | [中文](product-requirements-discussion.zh.md)

- Type: Discussion
- Status: Draft
- Created: 2026-09-18
- Last updated: 2026-09-18
- Authority: historical context for how product requirements were formed; not an implementation authority
- Corresponding document: [Product Requirements](../product-requirements.md)
- Related architecture: [Electron System Architecture](../architecture/electron-architecture.md), [Module Structure](../archive/module-structure.md) (archived)
- Recording conventions: [Documentation Organization and Maintenance Guide](../document-conventions.md)

> This log organizes the discussion chronologically without copying chat verbatim. It deliberately preserves initial assumptions, conceptual clarifications, rejected options, and later corrections. Current product behavior is governed by the corresponding requirements document.

## 2026-09-18 — Discussion goals and material scope

### Question

The user wanted to form a requirements document through discussion after reading the Electron architecture, module structure, and all module designs, rather than deriving product conclusions directly from technical architecture.

### Initial materials

Existing material already defined fairly completely:

- Electron Main, Preload, Renderer, and pi SDK boundaries;
- a single active runtime, generation, and sequence;
- workspace, session, agent command, and model coordination modules;
- project trust, credentials, attachments, and extension UI;
- first-version UI states and security requirements.

The material mainly answered “how to implement” but did not fully answer “why users need this, what the first version specifically commits to, and how to recover after failure.”

### Agent analysis

The agent first translated 34 module designs into user capabilities, end-to-end flows, security requirements, error recovery, and open decisions, and noted that product requirements should not copy implementation details such as generation, sequence, and IPC ownership.

### Impact

The decision was to confirm product behavior item by item through discussion, then produce a separate `product-requirements.md`.

## 2026-09-18 — Product positioning and first-version success criteria

### Question

Should the first version be a focused pi graphical client or a full replacement for the pi TUI?

### Agent recommendation

The first version should serve Linux developers with a complete daily loop of “open project—handle project resources—create or restore session—choose model—converse with the Agent—view tool activity—abort or continue—recover session,” without aiming to replicate every pi TUI capability.

### User decision

The user confirmed this positioning matched expectations.

### Impact

The requirements document treats “end-to-end core workflow usable” as the success criterion, not feature count or full TUI replacement.

## 2026-09-18 — Clarifying “window” and “active workspace”

### Question

Before deciding single-window versus multi-window, the user asked for explanations of window, workspace, and active workspace.

### Conceptual clarification

The discussion distinguished:

- **Window**: one independent desktop application window;
- **Workspace**: a local project directory and its pi, Git, resource, and runtime context;
- **Active workspace**: the workspace actually connected to a runtime and receiving commands;
- **Session**: a distinct Agent conversation and context within the same workspace.

The initial architecture recommendation was single instance, one main window, one active workspace, and one active session.

### Further user question

The user did not immediately accept that model and asked to compare against the actual product shape of ChatGPT Desktop first.

### Significance

This clarification avoided treating “single instance,” “single window,” “remember only one project,” and “only one Agent may run” as the same thing.

## 2026-09-18 — Comparing ChatGPT Desktop and Codex

### Question

Does ChatGPT Desktop represent a single active context, multiple windows, or single-window parallel tasks?

### Agent research and analysis

The discussion concluded:

- ordinary ChatGPT Project/Chat usage is closer to switching the current context within one window;
- the Companion Window is a lightweight auxiliary window, not an independent local runtime per window;
- Codex-style capability is closer to one application managing multiple parallel Agent tasks.

### User decision

The user explicitly stated:

> The first version must support multiple Agents running in the background in parallel, and let users switch between projects or tasks without aborting prior tasks.

Parallel scope was later confirmed to include both cross-project work and different sessions within the same project.

### Supersession

This decision superseded core assumptions in the existing architecture: a single active runtime, session switching as replacement, and the Renderer maintaining only one current conversation.

### Impact

Later requirements introduced:

- multiple projects and multiple top-level tasks;
- background task state;
- task/runtime registry;
- multi-task event routing;
- concurrent scheduling;
- state aggregation in the project tree.

## 2026-09-18 — Parallel write isolation within one project

### Question

If multiple Agents in the same project share a directory, they might modify the same files, interfere with tests, and pollute Git state. How should isolation work?

### Options considered

- share the original directory with conflict warnings;
- automatically copy the project directory;
- create an independent Git worktree per task;
- forbid a second parallel task for non-Git projects.

### User decision

- different projects may run in parallel directly;
- parallel write tasks in the same Git project default to independent worktrees;
- for non-Git projects, unavailable Git, or worktree creation failure, forbid a second parallel Agent;
- do not silently fall back to a shared directory or auto-copy directories.

Later discussion further confirmed: all Git top-level write tasks, including when only one task exists, also use an independent worktree so execution, review, and apply flows stay consistent.

### Important correction

Later discussion recognized that a worktree is workflow isolation, not a permission sandbox. pi, shell, extensions, and project programs may still access user-writable locations via absolute paths or other means.

### Impact

The requirements document must not promise Agents technically cannot write outside the worktree; it can only commit that pi-desktop binds default cwd and result apply flows to the worktree and states non-sandbox boundaries clearly.

## 2026-09-18 — Reviewing and applying task results

### Question

How do changes completed in an independent worktree return to the user’s target workspace?

### Options considered

- show only the worktree path and leave external Git tools to handle it;
- in-app diff view and apply;
- auto-commit and merge after task completion;
- apply per task, per file, or per hunk;
- resolve conflicts in-app, or stop on conflict.

### User decision

- first version shows file list and full diff in-app;
- support only whole-task apply at once, not per-file or per-hunk;
- stop and retain the worktree when the target workspace is dirty or apply would conflict;
- do not leave half-applied or conflict markers in the target workspace;
- after successful apply, changes appear as uncommitted modifications;
- do not auto-commit or merge;
- unapplied results may be permanently discarded after secondary confirmation.

### Follow-up safety analysis

“Atomic apply” was initially stated too strongly. Later additions included:

- base commit;
- `resultRevision`;
- review-time changes invalidating results;
- pre-apply checks;
- apply journal;
- implementation-time definition of capability boundaries for binaries, symlinks, submodules, LFS, and similar cases.

### Open questions

Concrete Git apply algorithms and abnormal recovery remain for architecture and technical spike.

## 2026-09-18 — Top-level tasks and sub-agents

### Question

May multiple main Agents run in the same session at once, and how should parallel work inside a main Agent be presented?

### User decision

- at most one main Agent per top-level session at a time;
- the main Agent may start parallel sub-agents;
- parallel top-level work is achieved through multiple tasks or sessions;
- sub-agents appear in a detailed tree with task description, state, output, tools, model, usage, and parent/child relationships;
- users may abort a sub-agent individually but cannot send messages directly to it;
- aborting the main task cascades cancellation to sub-agents;
- the main task may reach final completion only after blocking sub-agents have all ended, failed, or been canceled.

### Follow-up capability review

Later review noted current pi SDK documentation cannot assume a complete first-class sub-agent API. A spike is required via a stable upstream public API or a pi-desktop-owned, compatibility-guarded custom tool/runtime protocol.

### Open questions

- concrete public API or owned protocol for sub-agents;
- nesting depth;
- sub-agent session/runtime ownership;
- how extension UI and usage route to the parent task.

## 2026-09-18 — Closing the window and restart recovery

### Question

Does “run in the background” mean execution continues after closing the main window?

### User decision

- background running means only continuing after switching to another project or task within the app;
- show confirmation when closing the window while tasks are still running;
- after the user confirms exit, abort all main tasks and cascade-cancel sub-agents;
- no system tray in the first version;
- retain sessions, task records, follow-ups, and unapplied worktrees;
- after restart, formerly running tasks are marked interrupted and do not auto-resume;
- users may restore the original session and add a “continue” instruction in the original worktree.

### Important clarification

Restoring a session is not the same as resuming from the interrupted command execution point. Prior tools and sub-agents should be marked interrupted; a new round re-checks files, Git, and model state.

### Follow-up persistence correction

To restore follow-up content that had not yet executed, user messages must be persisted in Main-controlled, permission-restricted dedicated task state storage. The product cannot simultaneously claim “restore queued content” and “store only non-secret metadata.”

## 2026-09-18 — Project `.pi` resources and “open without loading”

### User question

The user had not clearly encountered a “do not trust project” option in Codex Desktop and asked why pi-desktop needs that choice and what `.pi` resources do.

### Conceptual clarification

Discussion explained `.pi` may contain:

- project settings;
- executable extensions;
- skills;
- prompt templates;
- system prompts;
- themes;
- project packages.

Project trust controls whether these project resources load; it does not control whether the Agent has the user’s permissions and is not a sandbox. Codex also has project configuration trust concepts but combines them with a different OS sandbox and approval model, so UX may differ.

### Options considered

- refuse to open when not trusted;
- open in a so-called read-only mode;
- open without loading project resources.

### User decision

Choose “open without loading project resources.”

Specific confirmations:

- “load for this session only” applies to that project and its tasks for the current application process;
- “do not load project resources” is remembered persistently;
- provide an entry to change project resource settings;
- copy uses “load project resources / do not load project resources,” not only abstract “trust / do not trust”;
- clearly state this is not a sandbox.

### Follow-up architecture issue

The pi trust store works on normalized paths while task worktrees are internal temporary paths. Product trust scope should bind to a stable `projectId`; persistent decisions write to the original project path, temporary decisions stay in the Main project registry, and independent trust records must not remain per worktree.

## 2026-09-18 — Full extension UI support

### Question

After loading project extensions, if Desktop does not support interaction, extensions may wait indefinitely.

### User decision

First version fully supports:

- `select`;
- `confirm`;
- `input`;
- `editor`;
- `notify`.

In parallel environments, requests must identify project, top-level task, and sub-agent; background requests enter waiting and can be reached from the project tree and desktop notifications. Abort, crash, exit, or timeout must resolve pending requests.

## 2026-09-18 — Concurrency limits and scheduling

### Question

Multiple top-level Agents and sub-agents may consume system resources and provider quotas simultaneously; should concurrency be limited?

### User decision

Use configurable conservative defaults with separate limits for:

- top-level tasks;
- sub-agents per task;
- total Agents globally.

Confirmed defaults:

- 3 top-level tasks;
- 3 sub-agents per task;
- 6 total globally.

When over limit, queue rather than fail immediately.

### Follow-up deadlock correction

If a main Agent holds all slots and synchronously waits for queued sub-agents, deadlock is possible. Later requirements added:

- release model execution slots while the main Agent waits for sub-agents;
- sub-agents already depended on by a parent task take priority over new top-level tasks;
- bounded waiting, cancellation, and starvation protection.

## 2026-09-18 — Main UI structure and discovering background state

### Question

How can one window manage multiple projects, tasks, sessions, sub-agents, and results awaiting review?

### User decision

Use a three-column structure:

- left project/task tree;
- center current session;
- right task details, sub-agents, and change review.

The user rejected a separate global todo center; the first version relies mainly on persistent state markers in the project and task tree. Waiting for input, failure, interrupted, and pending review must be visible in the tree, not only via color or desktop notifications.

## 2026-09-18 — Git task starting point and a dirty original workspace

### Question

Should a new worktree be created from the default branch, a user-selected commit, or the original workspace’s current `HEAD`? What if the original workspace has uncommitted changes?

### User decision

- default to the currently checked-out `HEAD`;
- show branch and short commit ID before creation;
- detached `HEAD` may be used but must be labeled;
- allow creation when the original workspace has uncommitted changes;
- clearly warn the task cannot see uncommitted changes;
- do not auto-stash, commit, or copy those changes.

Apply still requires a clean target workspace, so ongoing local modifications block applying results.

## 2026-09-18 — Task completion, verification, and result state

### Question

Does the Agent stopping generation equal task success? How are unrun or failed tests expressed?

### User decision

Display separately:

1. Agent execution state;
2. verification state;
3. result review state.

Agent completion does not mean tests passed; failed tests do not auto-discard changes; passed tests do not auto-apply.

### Follow-up refinement

Verification records should bind to `resultRevision`, including command, cwd, exit status, time, and source. After file changes, old test results cannot represent the current result.

## 2026-09-18 — Model selection and sub-agent models

### Question

Is model configuration global, task-level, or per message? What model do sub-agents use?

### User decision

- provider, model, and thinking level are chosen per message;
- a snapshot forms when the message is accepted;
- multiple tasks may use different models;
- the main Agent may choose authenticated, allowed models for sub-agents;
- the UI shows the sub-agent’s actual model without silent substitution.

### Follow-up upstream semantics correction

pi SDK model state is primarily session-level; native steer/follow-up queues do not carry independent model snapshots. Requirements later clarified:

- steer inherits the current run’s configuration;
- follow-ups needing a distinct model are deferred by Desktop scheduling and set before the next round starts;
- this commitment cannot rely on the upstream native queue alone.

## 2026-09-18 — Usage and cost

### Question

Do parallel Agents need budget thresholds and auto-pause?

### User decision

First version shows tokens and cost only, without auto-pause:

- sub-agents shown separately and rolled up to the top-level task;
- aggregation per project and per application run;
- distinguish actual cost from estimates;
- unknown pricing shows “cost unknown,” not a false zero.

Hard budgets are deferred to later versions.

## 2026-09-18 — Linux desktop notifications

### Question

When the user views another task, how should background tasks signal waiting for input, failure, or completion?

### User decision

- waiting for input and failure notify by default;
- ordinary completion notifications off by default, configurable on;
- do not repeat notifications for the currently visible task;
- clicking a notification focuses the correct task;
- notifications are redacted and deduplicated;
- the project tree is the persistent state source; notifications are auxiliary only.

## 2026-09-18 — New messages while running and abort

### Question

When the main Agent is running, should a new message steer immediately or join the follow-up queue by default? What happens to the queue after abort?

### User decision

- default to follow-up;
- user may explicitly switch to steer;
- aborting the current run retains follow-ups but pauses the queue;
- do not auto-run the next item;
- user then chooses to continue, edit, or clear.

Scheduling queue, follow-up queue, and provider retry must be clearly distinguished.

## 2026-09-18 — General file attachments

### Question

Existing architecture designed only for images, but coding Agent users may want to attach text, logs, documents, or other files.

### User decision

- first-version product entry supports controlled general file attachments;
- external attachments apply only to the current message;
- do not copy into the task worktree;
- must not remain accessible to subsequent messages by default;
- Renderer holds only metadata and short-lived tokens.

### Follow-up capability narrowing

Upstream prompts natively support mainly text and images. Later review required implementation specs to follow real conversion capability:

- images map to upstream image content;
- text injects into the current message within encoding and size limits;
- binary types such as PDF, office documents, and archives are explicitly rejected until safe parsing or reference approaches are defined;
- do not show a selectable entry while pretending the model can read unsupported types.

## 2026-09-18 — Drafting the requirements document and cross-review

### Process

The user chose to draft the full requirements document directly. After the first draft, cross-review against architecture, modules, and upstream pi capabilities followed.

### Major risks found

- worktree misdescribed as stronger permission isolation than reality;
- sub-agent capability lacked stable upstream integration basis;
- follow-up restart recovery conflicted with “do not save prompts”;
- per-message models conflicted with session-level model semantics;
- absolute atomic apply promises lacked algorithm and recovery basis;
- same-process runtime cannot guarantee the main window survives a single-task crash;
- trust decisions cannot persist directly against temporary worktree paths;
- task, session, worktree, and result versions need separate domain entities;
- multilevel scheduling risked parent tasks waiting on sub-agents and deadlocking.

### Corrections

The requirements document later added or narrowed:

- worktree non-sandbox explanation;
- sub-agent spike prerequisites;
- controlled follow-up persistence;
- `resultRevision` and apply journal;
- scheduling deadlock-prevention rules;
- distinction between catchable runtime exceptions and main process crash;
- task registry and added resource owner inventory;
- more complete acceptance scenarios for anomalies, desync, security, and recovery.

### Current outcome

This produced [Product Requirements](../product-requirements.md). It remains Draft but includes product direction explicitly confirmed in this discussion and states that the existing single-runtime architecture requires revision.

## 2026-09-18 — Open questions

The following remain undecided or need technical validation:

- whether multiple runtimes live in a utility/child process for fault isolation;
- stable public API or owned protocol for sub-agents;
- final domain model and persistence format for task/session/worktree;
- concrete Git apply algorithm, supported boundaries, and abnormal recovery;
- final allowlist, size limits, and conversion for general attachments;
- OAuth callback, external link protocol, and diagnostic retention policy;
- final visual design for thinking, retry, and compaction;
- how existing architecture and module documents should be refactored for the multi-task model.
