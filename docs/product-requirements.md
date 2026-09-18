# pi-desktop First Usable Version Product Requirements

English | [中文](product-requirements.zh.md)

- Type: Requirement
- Status: Draft
- Created: 2026-09-18
- Last reviewed: 2026-09-18
- Platform: Linux
- Product phase: First usable version
- Authority: user-visible behavior, product scope, and acceptance boundaries for the first usable version
- Related architecture: [First-Version Electron System Architecture](architecture/electron-architecture.md)
- Module design (archived): [First-Version Module Design Index](archive/module-structure.md)
- Discussion log: [First Usable Version Product Requirements Discussion](discussions/product-requirements-discussion.md)
- Documentation index: [pi-desktop Documentation Index](README.md)

> This document describes planned product behavior and acceptance boundaries. It does not mean the related features are already implemented. The multi-project, multi-top-level-task, and multi-runtime system structure is captured in [`architecture/electron-architecture.md`](architecture/electron-architecture.md); that architecture remains Proposed. Planned capabilities must not be described as implemented until the related spikes and ADRs are closed.

## 1. Product overview

pi-desktop is a graphical desktop client for pi aimed at Linux developers. While reusing pi agents, models, tools, sessions, resources, and extension mechanisms, it provides a multi-task desktop interface suited to everyday high-frequency development work.

The first version must let users complete the following end-to-end loop:

1. Open a local project and explicitly decide whether to load pi resources provided by the project;
2. Create or restore top-level tasks and sessions;
3. Run one or more Agent tasks in isolated Git worktrees;
4. Switch between projects and tasks without aborting background runs;
5. View streaming answers, thinking, tool execution, and sub-agent activity;
6. Handle interactions, failures, and waiting states initiated by extensions;
7. Review complete code changes produced by Agents;
8. Safely apply the full set of changes back to the target workspace, or explicitly discard them;
9. After an application restart, restore task records, sessions, and unapplied worktree results.

The first version does not aim to fully replace the pi TUI, an IDE, or a general-purpose Git client.

## 2. Product goals

### 2.1 Core goals

- Provide a single-window Agent workbench with multiple projects and multiple top-level tasks;
- Support multiple Agents running in parallel in the background across projects and sessions;
- Use separate Git worktrees to isolate write tasks within the same project;
- Make sub-agents started by the main Agent visible, traceable, and individually abortable;
- Preserve pi streaming messages, tool calls, queues, abort, retry, compaction, and tree-shaped session semantics;
- Let users review complete diffs in the app before deciding whether to apply changes;
- Keep working directory, run state, models, usage, and pending interactions clearly visible;
- Isolate the Renderer from high-privilege runtimes and do not expose credentials or generic system capabilities to the UI;
- Keep task ownership clear and recoverable after switching, exit, desync, errors, and crashes.

### 2.2 First-version success criteria

The first version is considered usable only when all of the following are met:

- Users can start top-level tasks in at least two different projects at the same time and switch between tasks without affecting background runs;
- Users can create multiple top-level tasks with separate worktrees in the same Git project;
- Each top-level session runs at most one main Agent at a time, but the main Agent can start multiple parallel sub-agents;
- Background tasks do not lose waiting-for-input, failed, interrupted, completed, or pending-review states;
- pi-desktop binds each Git task’s default working directory to a separate worktree and does not apply task results to the original Git workspace before user confirmation; the UI clearly states that worktrees are workflow isolation, not a system permission sandbox;
- Users can view the complete task diff and apply all changes as uncommitted modifications to a clean target workspace;
- When the target workspace is dirty or application would conflict, the app stops safely without leaving a half-applied state;
- Exiting the app does not automatically discard unapplied worktree results;
- After restart, users can restore task records and worktrees and manually continue interrupted tasks;
- Credentials, full prompts, attachment content, and sensitive diagnostic information do not leak into Renderer persistence, ordinary logs, or system notifications.

## 3. Target users and core scenarios

### 3.1 Target users

- Users doing local software development on Linux;
- Users who already use or want to use pi agents, models, tools, sessions, extensions, skills, and prompts;
- Developers who need to advance multiple coding tasks in parallel and review each task’s results;
- High-frequency users who value task isolation, observability, keyboard efficiency, and change control.

### 3.2 Core scenarios

- Run an implementation task in project A while running an investigation task in project B;
- Create worktrees for multiple independent tasks in the same Git project and run them in parallel without cross-contamination;
- View multiple sub-agents started inside one main Agent and their tool activity;
- Switch to another task while the original keeps running and notify the user when input is needed;
- After a task completes, inspect the file list, complete diff, test results, and usage, then apply the whole result;
- Keep unapplied results after exit and restore and continue the original session on next launch.

## 4. Core concepts

### 4.1 Project

A project is a user-selected local working directory and its pi, Git, and task context. A project can contain multiple top-level tasks. In the first version, a project usually corresponds to one Git repository; a non-Git directory can run a single task but does not support parallel tasks within the same project.

### 4.2 Original workspace

The original workspace is the local project directory the user initially selected. For Git projects, pi-desktop binds the task runtime and default working directory for built-in tools to a separate worktree; task results are written back to the original workspace as uncommitted modifications only after the user confirms application.

A Git worktree is workflow isolation, not a system permission boundary. pi, shell, extensions, and project processes still run with the current user’s privileges and may access other user-writable locations via absolute paths, symbolic links, or external programs. If users need a guarantee that code cannot escape the worktree, they must use containers, VMs, or OS-level sandboxes; the first version does not promise this.

### 4.3 Top-level tasks and sessions

A top-level task is an independent unit of work the user creates or restores in a project, bound to one pi session and one actual working directory. Each top-level task runs at most one main Agent at a time.

### 4.4 Sub-agent

A sub-agent is an internal parallel execution unit the main Agent creates to complete the current top-level task. Sub-agents:

- Belong to one top-level task;
- Share the parent task’s worktree;
- Do not become independent top-level sessions;
- Can run in parallel;
- Can be viewed and aborted individually;
- Cannot receive messages directly from the user;
- Have results aggregated and used by the main Agent;
- The main task can reach final completed state only when all sub-agents that block completion have completed, failed, or been cancelled.

### 4.5 Task worktree

For Git projects, every top-level write task runs in a separate Git worktree, including when only one task is running in the project. The worktree is based on the `HEAD` checked out in the original workspace when the task was created, and records an immutable base commit.

### 4.6 Currently viewed task and background tasks

The currently viewed task is the one shown in the central session area. Background tasks are not displayed but remain running, queued, waiting for input, or in another active state. Switching the currently viewed task must not abort background tasks.

## 5. First-version scope

### 5.1 In scope

- Linux single instance, single main window;
- Multi-project and multi-top-level-task navigation;
- Parallel Agents across projects and sessions;
- Git worktree creation, retention, inspection, and safe cleanup;
- Session create, restore, switch, fork, and rename;
- Prompt, steer, follow-up, abort, and clear follow-up queue;
- Detailed state and activity for main Agent and sub-agents;
- Provider, model, thinking level, and authentication;
- Per-message model and thinking level selection;
- Text, Markdown, code, diff, thinking, and tool activity;
- Controlled generic file attachments;
- Extension `select`, `confirm`, `input`, `editor`, and `notify`;
- Token and cost display;
- Complete task diff review, whole-task apply, and explicit discard;
- Linux desktop notifications;
- Task, session, and worktree recovery after application restart.

### 5.2 Explicitly out of scope

- Windows and macOS;
- Multiple main windows;
- Continue running in the system tray after the app is closed;
- Multiple main Agents in the same top-level session at once;
- Parallel Agents in the same non-Git project;
- Automatic copying of non-Git projects for isolation;
- Automatic commit, merge, or Pull Request creation;
- Selective apply by file or diff hunk;
- Built-in Git conflict resolver;
- Automatically resume Agents that were running before app exit;
- User messages sent directly to sub-agents;
- Hard token or cost budgets;
- System sandbox promises for project trust;
- Generic Renderer filesystem or shell APIs;
- Direct parsing or rewriting of pi session JSONL;
- Remote Agent services and multi-device sync;
- Auto-update and Flatpak permission models.

## 6. Information architecture

### 6.1 Main window

The first version uses a three-column main layout:

```text
Projects / task tree | Current session | Task details
```

#### Left: projects and task tree

Top-level tasks are grouped by project. Project nodes show aggregated counts for:

- Running;
- Waiting for concurrency slots;
- Waiting for user input;
- Failed;
- Interrupted;
- Pending review.

Task nodes must show at least:

- Task name;
- Main execution state;
- Unread state;
- Verification state summary;
- Result state summary;
- Worktree or branch summary.

The first version does not provide a separate global todo center. Key pending states must remain persistently visible in the project tree, not only via transient notifications.

#### Center: current session

Shows for the current task:

- User and assistant messages;
- Streaming text and thinking;
- Tool calls;
- Retry, compaction, and errors;
- Composer;
- Steer and follow-up entry points.

Switching the central current task only changes what is displayed; it does not change the run state of any background task.

#### Right: task details

Context-dependent display of:

- Top-level task state;
- Sub-agent tree;
- Tool details;
- Actual working directory and base commit;
- Model, thinking level, and usage;
- File changes and complete diff;
- Verification results;
- Apply or discard actions.

On narrow windows the right column may collapse or become a drawer, but the central session and Composer must remain usable.

### 6.2 State expression

State must not be conveyed by color alone. The task tree, session, and details panel should combine text, icons, counts, and accessible labels.

## 7. Opening projects and project resources

### 7.1 Open project

Users can open a project via the system directory picker. The app must:

1. Normalize and validate the real path;
2. Check that the directory exists, is readable, and whether it is a Git repository;
3. Check for pi project resources that require trust;
4. Complete the applicable project resource decision;
5. Create a project record and load the task list;
6. Record recent projects only after success.

Cancelling directory selection must not show an error or change current state.

### 7.2 Project resource prompt

When a project contains pi resources that require trust and no applicable decision exists, the UI must not use vague “trust / don’t trust” copy alone. It must explain that the project contains resources that can affect Agent behavior or execute code, and offer:

- **Load and remember**: persistently allow loading;
- **Load this time only**: allow only for the current application process lifetime;
- **Do not load project resources**: persistently skip protected resources but continue opening the project;
- **Cancel open**: do not open the project.

Protected resources include upstream pi-defined project settings, extensions, skills, prompts, themes, system prompts, project packages, and project `.agents/skills`.

### 7.3 Do not load project resources

After the user chooses “Do not load project resources”:

- The project can still be opened;
- Users can still create, restore, and run Agent tasks;
- Resources protected by project trust are skipped;
- The project tree and task details continuously show “Project resources not loaded”;
- Users can see which resource types were skipped;
- The app provides an entry to “Change project resource settings”;
- This state must not be described as read-only, safe mode, or a sandbox;
- It must clearly state that the Agent still reads, modifies files, and runs commands with the current user’s privileges.

“Do not load project resources” is a persistent decision. Desktop must handle it through pi public APIs and trust store semantics and must not parse or rewrite `trust.json` on its own.

### 7.4 Load this time only

“Load this time only” applies for the lifetime of the current pi Desktop process to all tasks and worktrees created or restored for that project:

- Does not write a persistent trust record;
- Re-opening in the current process does not ask again;
- Expires when the application fully exits;
- On next launch, asks again.

Project resource decisions cannot hot-switch already running runtimes. Changing a decision affects only tasks created or rebuilt afterward.

At the product layer, trust scope binds to a stable `projectId`, not a temporary worktree path. Persistent decisions are still written to the original normalized project path per pi public APIs; “Load this time only” is stored in a project-level ephemeral registry in the Main process; when creating a worktree runtime, that project decision is applied explicitly and no separate persistent trust record may remain for internal worktree paths. This behavior must be verified against the public APIs of a pinned pi version first.

## 8. Task creation and worktree isolation

### 8.1 Git projects

Every top-level task that may write code must use a separate worktree, even when the project has only one task.

New tasks default to the `HEAD` checked out in the original workspace at creation time:

- Show branch or detached HEAD state before creation;
- Show short commit ID;
- Record base commit;
- Do not automatically include uncommitted changes from the original workspace.

### 8.2 Uncommitted changes in the original workspace

Users may still create a task, but the app must:

- Prominently mark the original workspace as dirty;
- Show the count of uncommitted changed files;
- Clearly state that the task is based only on current `HEAD` and cannot see uncommitted changes;
- Not automatically stash, commit, copy, or modify the user’s original workspace;
- Allow the user to continue or cancel.

### 8.3 Non-Git projects

Non-Git projects may run one top-level task directly in the original directory, but:

- When an active or retained write task exists in the same project, starting a second parallel task is forbidden;
- Do not automatically copy the directory;
- Do not silently fall back to parallel use of a shared directory;
- Error messages should suggest waiting for the existing task to finish or initializing the project as a Git repository.

When Git is unavailable, worktree creation fails, permissions are insufficient, or paths conflict, new tasks requiring isolation must not start either.

### 8.4 Sub-agent working directory

Sub-agents in the same top-level task share the parent task’s worktree. The UI should explain that parallel sub-agents within the same task may operate on the same files at once and the main Agent coordinates their work.

Sub-agents are not a first-class stable capability that can be assumed from current pi SDK documentation. Before implementation, a spike must validate creation, events, cancellation, models, usage, and extension UI routing through upstream stable public APIs or a custom tool/runtime protocol defined by pi-desktop with compatibility protection. If a pinned pi version cannot reliably provide these semantics, the first-version implementation must not silently degrade or fake sub-agent state; architecture decisions must block entering implementation instead.

## 9. Multi-Agent concurrency and scheduling

### 9.1 Concurrency scope

The first version allows:

- Parallel top-level tasks in different projects;
- Parallel top-level tasks in the same Git project;
- One main Agent starting multiple sub-agents inside a task.

Each top-level session runs at most one main Agent at a time.

### 9.2 Default limits

Default concurrency limits for the first version:

- Concurrent running top-level tasks: 3;
- Concurrent running sub-agents per top-level task: 3;
- Global concurrent main Agents and sub-agents: 6.

Users can adjust these values in settings.

### 9.3 Scheduling behavior

- Agents over the limit enter “waiting for concurrency slot” rather than failing;
- Setting changes affect only subsequent scheduling and do not force abort of running Agents;
- Agents waiting for user input do not occupy model execution slots;
- While the main Agent waits for sub-agent results it releases the model execution slot but keeps the task active;
- After waiting ends, if slots are full, re-enter the scheduling queue;
- Queued sub-agents with parent-task dependencies are scheduled before new top-level tasks to avoid deadlock from a parent holding a slot while waiting;
- The scheduler must provide bounded waiting, cancellation, and starvation protection; when a schedulable request cannot be established for a sub-agent, creation must fail explicitly, not wait indefinitely;
- Sub-agents are subject to both per-task and global limits;
- Scheduling queue, follow-up queue, and provider retry must be clearly distinguished in state and copy.

## 10. Main Agent and sub-agents

### 10.1 Sub-agent visibility

Task details provide an expandable sub-agent tree showing at least:

- Name or task description;
- Parent-child relationship;
- queued, running, waiting, completed, failed, cancelled, interrupted states;
- Start time and duration;
- Current activity summary;
- Streaming output or final result;
- Tool calls and errors;
- Actual working directory;
- Provider, model, and thinking level;
- Tokens and cost;
- Whether it blocks main task completion.

### 10.2 User control

Users can:

- View sub-agent details;
- Individually abort sub-agents that are still running.

Users cannot send messages directly to sub-agents. After individual abort, whether the main Agent continues or fails is determined by pi run semantics and shown clearly in the UI.

Aborting the entire main task must cascade-cancel all sub-agents still running.

### 10.3 Sub-agent models

The main Agent may choose provider, model, and thinking level per sub-task for sub-agents, but:

- Only authenticated and allowed models may be used;
- The UI must show the actual selection;
- Unavailable models must not be silently replaced;
- Users cannot change models directly while a sub-agent is running;
- Main task results must be traceable to participating sub-agents and their models.

## 11. Sessions, messages, and queues

### 11.1 Session capabilities

Users can:

- View sessions and top-level tasks in a project;
- Create new sessions;
- Restore and switch sessions;
- Fork from a valid branch point;
- Rename sessions.

Switching the currently viewed session must not abort tasks in other sessions.

### 11.2 Prompt acceptance

When sending a message, the app must return “accepted” or a specific preflight rejection quickly; IPC requests must not wait for the entire Agent run to finish.

Preflight must verify at least:

- Task and runtime available;
- Input valid;
- Provider authenticated;
- Model and thinking level available;
- Attachments still valid;
- Project resources and working directory ownership consistent.

On preflight failure, preserve the draft and attachments not yet consumed.

### 11.3 New messages while running

While the main Agent is running, new messages in the same session default to follow-up:

- Composer shows “Will send after current run ends”;
- User can explicitly switch to steer to affect the current run immediately;
- Steer and follow-up use different copy, icons, and states;
- Follow-ups display in authoritative order;
- User can clear follow-ups not yet executed.

### 11.4 Abort and queue

When aborting the current main Agent run:

- Cascade-cancel sub-agents still running;
- Preserve partial answers, tool records, and file modifications;
- Unexecuted follow-ups remain but enter paused state;
- Do not automatically run the next follow-up;
- User can continue the queue, re-edit and send, or clear the queue.

## 12. Models, thinking, and authentication

### 12.1 Per-message selection

Provider, model, and thinking level are selected per message:

- Composer shows the actual configuration for the next message;
- User can change it before sending prompt, steer, or follow-up;
- When a message is accepted, configuration forms an immutable snapshot;
- Changing Composer affects only messages sent afterward;
- Does not change running Agents, queued messages, or other tasks;
- Each run record can show the configuration actually used.

When restoring an old session, Composer defaults to the last successfully sent configuration, but the user can change it.

In the current pi SDK, model and thinking level are mainly session-level state, and native steer/follow-up queues do not carry independent model snapshots. Before implementation, the following mapping must be verified and made explicit: ordinary prompts can set a message snapshot before starting a new turn; steer defaults to inheriting the running main Agent configuration and must not switch mid-run; follow-ups that need independent model snapshots must have configuration set by Desktop immediately before the next turn actually starts, not handed early to an upstream queue that cannot preserve the snapshot. If the upstream queue is still used, narrow the corresponding product commitment or drive upstream public API support.

### 12.2 Authentication

Users can view provider authentication status, submit API keys, start OAuth, and log out. Requirements:

- Saved API keys and OAuth tokens must not return to the Renderer;
- User-entered API keys submit through a one-shot dedicated command;
- Clear frontend secret input immediately after success or failure;
- OAuth supports cancel and timeout;
- On partial credential sync failure, re-query state instead of guiding blind resubmission;
- Multiple tasks may use different authenticated providers concurrently.

## 13. Conversation and tool presentation

### 13.1 Messages

Conversation must show:

- Completed messages;
- Markdown;
- Code blocks;
- Diffs;
- Thinking;
- Streaming text and thinking;
- Retry, compaction, and error states.

Increments must correlate to the correct content blocks; the final completed message must atomically replace temporary state without duplicate timelines.

### 13.2 Tools

Each tool call must show at least:

- Tool name;
- Start state;
- Parameter summary;
- Accumulated partial result;
- Complete, failed, or cancelled;
- Owning top-level task and sub-agent;
- Necessary timing information.

Long commands, long paths, and unbroken output must not break layout.

## 14. Extension UI

The first version fully supports:

- `select`;
- `confirm`;
- `input`;
- `editor`;
- `notify`.

Each request must identify source project, top-level task, and sub-agent. When a background task issues a blocking request:

- Task enters waiting;
- Project tree shows a persistent marker;
- Send applicable desktop notification by default;
- User can jump to the request source;
- Requests must not be lost because the task is not currently viewed.

Multiple blocking requests for the same task are handled in a deterministic order. On user cancel, single-Agent abort, main task abort, runtime crash, app exit, or request timeout, related pending requests must be resolved. Late responses must not be sent to an invalid runtime.

Extension text is rendered safely as untrusted content; HTML and scripts are not executed; user input does not enter ordinary persistence.

## 15. Generic file attachments

### 15.1 Supported scope

The first version supports controlled generic file attachments, including common:

- Images;
- Text and logs;
- Source code;
- Structured data;
- Documents;
- Archives.

Specific MIME types, extensions, per-file size, count, and total size are defined in implementation specs but must form an explicit allowlist and limits. Product entry may accept generic file selection, but only types with clear, safe conversion semantics may be sent: images map to upstream-supported image content; text types convert to current-message text content within size and encoding limits; PDFs, office documents, archives, and other binary types must be explicitly rejected until parse/reference approaches pass security review—not only upload metadata or pretend the model can read them.

### 15.2 Selection and validation

Attachments may be added only via the system file picker or explicitly approved drag-drop and paste. The Renderer holds only metadata and short-lived tokens.

Main must re-validate:

- File type;
- Size;
- Readability;
- Ordinary file attributes;
- Whether the file changed after selection;
- Whether provider/model supports it.

Do not automatically extract and execute archive contents. Directories, device files, special files, and obvious credential files must be rejected or require extra protection.

### 15.3 Message-level lifecycle

External attachments are input for the current message only:

- Not copied into the task worktree;
- Do not become default-accessible files for later messages;
- Not included in code diffs;
- Tokens bind to task and message and must not be reused across tasks;
- Preserved on preflight failure for retry;
- Authorization consumed when the message is accepted;
- Retry after background failure requires reconfirming attachments;
- pi-desktop does not long-term copy original file content.

## 16. Task state model

Each top-level task maintains three user-visible dimensions separately.

### 16.1 Agent execution state

- queued: waiting for concurrency slot;
- running: main Agent or sub-agent executing;
- waiting: waiting for user or extension input;
- completed: Agent finished;
- failed: run failed;
- cancelled: user aborted;
- interrupted: interrupted by app exit or exception.

### 16.2 Verification state

- not-run: not run;
- running: verifying;
- passed: passed;
- failed: failed;
- partial: partially passed;
- unknown: cannot determine.

When tests have not run, do not show “all succeeded”. Test failure does not automatically discard changes; test pass does not automatically apply.

Each verification record must include command or verification type, cwd, exit status, start/end time, source, and associated `resultRevision`. When file state changes after verification, old verification results must not represent current results; verification state returns to not-run or unknown. Agent prose alone cannot constitute passed; only verifiable tool execution or explicitly imported user results form verification records.

### 16.3 Result state

- no-changes: no file changes;
- review-required: pending review;
- applicable: applicable;
- blocked: apply blocked;
- applied: applied;
- discarded: discarded.

The Agent returning a final answer only means execution ended; it does not mean verification passed or results were applied.

## 17. Change review and application

### 17.1 Review content

After task complete, fail, abort, or interrupt, whenever the worktree has changes, users can view:

- Changed file list;
- Added, modified, deleted, and renamed status;
- Complete diff per file;
- Agent execution state;
- Verification state and verifiable test records;
- Worktree path;
- Base commit;
- Target workspace and target branch;
- Whether uncommitted changes or in-task commits exist.

### 17.2 Apply granularity

The first version can only apply the full set of task changes at once:

- Per-file viewing is allowed;
- Per-file checkboxes are not supported;
- Per-hunk selection is not supported;
- Before apply, show target, file count, and change summary again.

### 17.3 Apply prerequisites

Before apply, re-validate:

- Target workspace exists;
- Target workspace still corresponds to the expected repository;
- Target workspace is clean;
- Base and target state allow safe apply;
- Task worktree is intact;
- Reviewed result version has not changed since review;
- All changes pass pre-apply checks and can be written safely for change types supported in the first version.

Task results are defined as `base commit → current worktree file state`, not only reading uncommitted diff. Record `resultRevision` when entering review; when worktree, target ref, or file state changes afterward, existing review and applicable state invalidate immediately and users must refresh and re-review. Implementation specs must define supported boundaries for rename, binary, file mode, symbolic links, submodules, Git LFS, and sparse checkout, and recovery after apply journal and process anomalies. Until these algorithms are verified, cross-file writes must not be advertised as absolutely atomic.

### 17.4 Conflict strategy

If the target workspace has uncommitted changes or changes cannot apply cleanly:

- Stop apply;
- Do not overwrite target files;
- Do not leave half-applied state or conflict markers;
- Keep the complete task worktree;
- Show blocking reason and recovery steps;
- User can retry after handling the target workspace.

The first version does not provide a built-in conflict resolver.

### 17.5 Apply outcome

After successful apply:

- All task changes enter the target workspace as uncommitted modifications;
- No automatic commit;
- No automatic branch merge;
- Do not change author or commit message;
- Show summary of what was actually written;
- Worktree is retained temporarily until the user confirms cleanup.

### 17.6 Discard

Users can permanently discard unapplied results:

- Running tasks must be aborted and cleaned up first;
- Show project, task, worktree path, and change summary;
- Clearly state irreversibility;
- Require second confirmation;
- After confirmation, delete worktree and unapplied changes within it;
- On delete failure, keep current state and provide recovery information;
- Modifications already applied to the target workspace are unaffected.

## 18. Usage and cost

The first version provides transparent display but does not enforce hard budgets:

- Each top-level task shows input, output, and available cached token data;
- Each sub-agent is shown separately and aggregated to the top-level task;
- Project nodes aggregate task usage during the current application run;
- A global area shows cumulative usage during this application run;
- Calculated separately per actual message and model;
- Indicate whether cost is provider-returned actual or estimate;
- When price cannot be determined, show “cost unknown”, not a false zero;
- Aborting a task does not clear usage already incurred.

The first version does not automatically pause tasks when token or cost thresholds are reached.

## 19. Desktop notifications

The first version uses Linux desktop notifications:

- Default notify when background tasks wait for user input;
- Default notify when background tasks fail;
- Ordinary completion notifications default off, configurable in settings;
- Do not duplicate system notifications for the currently visible task;
- Clicking a notification focuses the existing main window and jumps to the corresponding project, task, or request;
- Deduplicate same state to avoid notification storms;
- Notification content is redacted: no full prompts, file content, tool output, credentials, or sensitive full paths;
- When system notifications are unavailable, project tree markers must still be complete.

## 20. Exit, restart, and recovery

### 20.1 Close window

“Run in background” means continue running after switching tasks within the app, not after closing the app.

When closing the main window with running tasks:

- Show a confirmation dialog;
- Show counts of running top-level tasks and sub-agents;
- On cancel close, all tasks remain unchanged;
- On confirm exit, abort all main tasks and cascade-cancel sub-agents;
- Cancel trust, extension, and other pending requests;
- Preserve sessions, task records, follow-up queue, and unapplied worktrees;
- Exit after bounded cleanup; partial cleanup failure must not block indefinitely;
- First version does not stay in the tray.

### 20.2 Restart recovery

After restart, restore:

- Project records;
- Top-level tasks and sessions;
- Worktree paths and base commits;
- Message, tool, and sub-agent history;
- Follow-up queue content, order, per-message model snapshots, and paused state;
- Change and review state.

Restoring the follow-up queue requires persisting user messages not yet executed. This content may be stored only in Main-controlled, permission-restricted dedicated task state storage—not Renderer storage, ordinary logs, system notifications, or diagnostic summaries; delete promptly after message execution, user clears queue, or permanent task deletion. If controlled persistence cannot be met during implementation, narrow to not restoring message content after restart rather than restoring only a queue placeholder that cannot continue.

Tasks in running, queued, waiting, or aborting state before exit are uniformly marked interrupted. The app must not automatically resume model requests, commands, or sub-agents.

### 20.3 Manual continue

Users can restore the original session and send a new continue instruction in the original worktree:

- Preserve historical messages and file modifications;
- Do not pretend to resume from the machine execution point of an interrupted command;
- Mark old tools and sub-agents as interrupted;
- User may add or edit instructions before clicking continue;
- New turn re-checks files, Git state, models, and project resource decisions;
- Recovery is subject to concurrency limits;
- When session cannot be restored, still retain worktree and allow review, apply, or discard.

Recovery must verify directory and Git facts, not trust cache alone. When worktree is missing, corrupted, or externally deleted, enter a diagnosable error state.

## 21. Errors, desync, and recovery

### 21.1 Error requirements

All user-visible errors must state:

- Which operation failed;
- Whether the user’s current data and tasks are safe;
- Whether recovery is possible;
- Suggested next step;
- `diagnosticId` when necessary.

Do not return raw `Error`, stack, credentials, full prompts, environment variables, or sensitive full paths to the Renderer.

### 21.2 Event consistency

Multi-task events must correlate to explicit project, top-level task, Agent, and runtime identity. The Renderer:

- Must not apply one task’s events to another task;
- Must discard late events from invalid runtimes;
- On detected event gaps, stop guessing and re-request that task or a globally consistent snapshot;
- On resync failure, provide manual retry;
- Must not lose background task events because of current task switching.

### 21.3 Runtime crash

When a single runtime exception is caught by the host without terminating Electron main:

- Stop related running indicators;
- Mark incomplete messages, tools, and sub-agents;
- End or invalidate related extension requests;
- Preserve completed messages and worktree modifications;
- Show redacted error and diagnostic ID;
- Provide entry to restore original session, review results, or recreate task.

If pi SDK, extensions, or native dependencies run in the same process as Electron main, `process.exit()`, event-loop blocking, OOM, or native crash may terminate the entire app and all tasks at once; the real-time crash UI above cannot be guaranteed. The first version must decide during architecture revision whether utility/child processes provide fault isolation; if still same-process, product commitment should be limited to “recover from persistent state after restart and mark interrupted” and clarify that one runtime may affect all tasks. Separate processes provide fault isolation, not a permission sandbox.

## 22. Security and privacy

### 22.1 Permission boundaries

pi runs with the launching user’s privileges. Project resource trust is not a system sandbox. The Renderer must not directly obtain:

- Node.js APIs;
- Raw Electron IPC;
- Shell;
- Arbitrary file read/write;
- pi SDK instances;
- Provider credentials.

All host commands must be a fixed allowlist, with schema validation in Main for `unknown` input.

### 22.2 Untrusted content

Treat all of the following as untrusted data:

- Markdown and HTML;
- Model output;
- Tool and terminal output;
- Diffs;
- File paths and links;
- Extension text;
- Attachment metadata.

Forbid arbitrary script execution, remote code application, and unapproved navigation. Reject `javascript:` and any external `file:` navigation. Approved external links open in the system browser.

### 22.3 Credentials

- Saved API keys and OAuth tokens do not return to the Renderer;
- Do not copy pi credentials into Electron `userData`;
- Credentials do not enter ordinary logs, system notifications, error reporting, or telemetry;
- Renderer does not persist newly entered secrets from the user.

### 22.4 Logging and persistence

Ordinary logs must not record:

- Full prompts;
- File or attachment content;
- Environment variables;
- API keys or tokens;
- Authentication files;
- Full IPC payloads;
- Sensitive full paths.

pi-desktop persists only task metadata needed for product recovery, controlled unexecuted follow-up content, window state, and application preferences. Task records must include at least stable `taskId`, `projectId`, pi session reference, worktree identity and path, base commit, target workspace, expected target ref, `resultRevision`, and lifecycle state; the same pi session must not bind to two active top-level tasks at once. Unexecuted messages are user content, not ordinary metadata; they must live in Main-controlled, permission-restricted dedicated storage with explicit deletion lifecycle; they must not enter Renderer storage, ordinary logs, notifications, or diagnostic summaries. pi-managed sessions, authentication, model settings, and trust store continue to be managed through pi public APIs.

The above constraints cover only Renderer persistence, application logs, diagnostics, notifications, and error responses controlled by pi-desktop itself. Providers, user or project extensions, tools, and processes they start may handle input per their own behavior; project resource decisions and pi-desktop logging policy cannot constrain that high-privilege code.

## 23. Accessibility, keyboard, and layout

- All critical flows completable by keyboard alone;
- All interactive controls have visible focus;
- Icon buttons provide tooltips and accessible names;
- Dialogs focus a reasonable element on open and restore trigger position on close;
- State changes must not rely on color alone;
- Screen readers can understand running, queued, waiting, aborting, failed, interrupted, and review-required;
- On narrow windows, project tree, central session, and details drawer remain accessible;
- Long project names, model names, paths, commands, and output must not cover adjacent controls;
- High-frequency streaming updates must not cause uncontrolled jumping of Composer, navigation, or task details.

## 24. Settings

First-version settings include at least:

- Top-level task concurrency limit;
- Per-task sub-agent concurrency limit;
- Global Agent total limit;
- Default provider, model, and thinking level for new sessions;
- Toggle for waiting-for-input notifications;
- Toggle for failure notifications;
- Toggle for completion notifications;
- Theme and non-sensitive UI preferences;
- View and change entry for project resource decisions.

Setting changes must not leak credentials or silently change already accepted messages and running Agents.

## 25. Key acceptance scenarios

### AC-01 Cross-project parallelism

1. Open projects A and B;
2. Start one task in each;
3. Both tasks run concurrently;
4. Switch between them;
5. The non-displayed task continues receiving events and completes.

### AC-02 Same-project worktree isolation

1. Create two tasks in one Git project;
2. Both tasks establish different worktrees based on `HEAD` shown at creation;
3. Both tasks can modify the same filename in parallel;
4. Original workspace unchanged before apply;
5. Each task shows only its own changes.

### AC-03 Non-Git parallelism blocked

1. Start one task in a non-Git directory;
2. Attempt to start a second task in the same project;
3. App refuses and explains missing safe isolation;
4. No copy created, no shared-directory parallelism.

### AC-04 Sub-agent observation and abort

1. Main Agent starts multiple sub-agents;
2. Details panel shows tree, state, models, output, and tools;
3. User aborts one sub-agent individually;
4. Other sub-agents are not wrongly aborted;
5. Aborting entire main task cancels all remaining sub-agents.

### AC-05 Concurrency scheduling

1. Start Agents over default 3/3/6 limits;
2. Excess items show waiting for concurrency slot;
3. After slot release, start in scheduling order;
4. Not confused with follow-up or retry state.

### AC-06 Do not load project resources

1. Open a project with protected pi resources;
2. Choose “Do not load project resources”;
3. Project can still create tasks;
4. Protected resources are not loaded;
5. UI continuously shows state and non-sandbox explanation;
6. Persistent decision still effective after restart.

### AC-07 Follow-up and abort

1. Send new message while main Agent runs;
2. Defaults to follow-up;
3. User can switch to steer;
4. After aborting main Agent, follow-ups remain and pause;
5. User can continue or clear.

### AC-08 Extension background requests

1. Background task issues `confirm` or `editor` request;
2. Project tree shows waiting for input;
3. System notification jumps to correct task;
4. Response submits only to source Agent;
5. Late response rejected after Agent abort.

### AC-09 Complete diff apply

1. Task produces multi-file changes;
2. User views complete diff per file;
3. Target workspace is clean;
4. User clicks whole-task apply;
5. All changes appear as uncommitted modifications;
6. Apply does not create a commit.

### AC-10 Dirty workspace and conflicts

1. Target workspace has uncommitted changes or target state conflicts with task results;
2. Apply operation stops safely;
3. Target workspace has no half-applied state;
4. Worktree and results fully preserved;
5. User can retry after handling.

### AC-11 Exit and recovery

1. Running tasks, sub-agents, follow-ups, and unapplied results exist;
2. Confirmation shown when closing window;
3. After confirm, abort and exit;
4. After restart, tasks marked interrupted;
5. Worktree, history, and queue restored;
6. User manually continues original session;
7. No automatic model requests.

### AC-12 Credentials and attachment security

1. Submit API key and generic file attachment;
2. Renderer does not receive saved key or arbitrary file read capability;
3. Attachment used only for target message and not written to worktree;
4. Logs, notifications, and errors contain no secrets or file content;
5. Tokens cannot be replayed across tasks.

### AC-13 Multi-task event isolation and desync recovery

1. Two tasks produce same tool call ID and high-frequency streaming events;
2. One runtime rebuilds and old events arrive late;
3. Duplicate, out-of-order, or missing events trigger per-task resync;
4. Only the correct task is updated;
5. Resyncing one task does not freeze others.

### AC-14 Trust decisions and multiple worktrees

1. Verify “Load and remember”, “Load this time only”, and “Do not load project resources” separately;
2. Multiple worktrees in same project use same project-level decision;
3. Internal worktree paths do not create separate persistent trust records;
4. After restart, “Load this time only” expires, persistent decisions remain;
5. After project resource decision changes, only new or rebuilt runtimes are affected.

### AC-15 Scheduling deadlock prevention

1. Multiple main Agents request and wait for sub-agents concurrently;
2. Parent Agents wait to release execution slots;
3. Dependent sub-agents get scheduling opportunity;
4. Queued Agents can be cancelled;
5. Dynamically lowering limits does not abort running Agents or cause permanent starvation.

### AC-16 Result revision and external Git changes

1. User completes diff review;
2. Worktree, target branch, or target workspace state then changes;
3. Original review and applicable state invalidate;
4. Apply blocked and refresh required;
5. Re-review new `resultRevision` before apply.

### AC-17 Apply anomaly recovery

1. Run pre-apply checks for supported add, modify, delete, rename, binary, or mode changes;
2. Simulate process exit, disk errors, and permission errors at different apply stages;
3. After restart, identify state via journal;
4. Do not show unknown or half-complete state as applied;
5. User gets clear recovery or manual handling guidance; worktree preserved.

### AC-18 Recovery failure degradation

1. Simulate session loss, worktree loss, Git corruption, and partial task metadata corruption separately;
2. App does not create empty tasks posing as recovery;
3. Available session, worktree, or diff data remains;
4. User can review, apply, discard, or get manual recovery path;
5. Errors include redacted diagnostic ID.

### AC-19 Safe rendering and external links

1. Messages, diffs, tool output, and extension text contain malicious HTML, ANSI, very long unbroken text, and obfuscated links;
2. No script execution or arbitrary navigation;
3. `javascript:` and unapproved `file:` rejected;
4. External links handed to system browser only per allowed protocols;
5. Narrow window and keyboard focus still usable.

### AC-20 Bounded exit

1. Runtime, sub-agent, or extension request does not respond to cancel;
2. After exit cleanup timeout, app can still terminate;
3. Next launch marks related tasks interrupted;
4. Session, follow-up, and worktree results not silently discarded.

## 26. Architecture revision outcomes

[`architecture/electron-architecture.md`](architecture/electron-architecture.md) created on 2026-09-18 incorporated the following differences into the new Proposed system architecture; the old single-runtime proposal moved to [`archive/electron-architecture.md`](archive/electron-architecture.md). These items remain for checking module refinement and implementation completeness:

1. **Single active runtime** changed to multiple parallel top-level runtimes/tasks;
2. `RuntimeController` can no longer own only one runtime; needs a task/runtime registry or equivalent ownership model;
3. A single global `runtimeGeneration` is insufficient to route multi-task events; stable project, task, Agent, and runtime identity is required;
4. “Switching project or session equals replacement” changed to “switching current view does not affect background runtimes”;
5. Renderer cannot maintain only one current conversation projection; needs task summary collection and per-task isolated detailed state;
6. Snapshot/event initialization, desync recovery, and sequence must support multi-task;
7. Application lifecycle must uniformly manage multiple runtimes, worktrees, and pending requests;
8. Attachments expanded from images to controlled generic files;
9. Added worktree management, task result review, whole-task apply, and discard;
10. Added sub-agent detailed observability, individual abort, and multi-level concurrency scheduling;
11. Model configuration expanded from single current model to immutable per-message run snapshots;
12. Single-window assumption remains, but single active workspace and single active session assumptions no longer hold.

The new system architecture already assigns logical owners for the following resources; multi-task module design documents are not written yet—before implementation, complete them under `docs/modules/` per that owner model:

- project/task/runtime registry;
- top-level and sub-agent scheduler and concurrency slots;
- generation and event sequence per runtime incarnation;
- global task summary snapshot and per-task detailed snapshot;
- task/session/worktree persistence and recovery;
- worktree create, validate, lock, and cleanup;
- Git state, diff, `resultRevision`, and validation record;
- apply/discard transactions and recovery journal;
- desktop notification;
- subagent orchestration;
- attachment, trust, extension, and request scope bound to `taskId + runtimeId`.

These ownership questions already have unique answers at the system architecture layer; implementation should not start from existing single-runtime module documents until the module index and per-module documents complete multi-task revision.

## 27. Items to refine without blocking architecture revision

The following are determined during implementation specification:

- Generic attachment MIME allowlist, size, count, and total volume;
- Specific support scope for drag-drop and clipboard paste;
- Thinking default expand, collapse, and hide policy;
- Specific visual style for retry and compaction;
- OAuth browser callback details;
- Allowed external link protocols and whether to confirm each time;
- Diagnostic log retention period, capacity, and cleanup entry;
- Worktree naming, storage location, and cleanup failure recovery;
- Advanced entry to choose non-default base commit at task creation;
- Specific Git algorithm for whole-task apply and atomic rollback implementation;
- Window and panel shortcuts;
- Theme options and default theme;
- Whether to provide task search, sort, and archive.

These details must not change the security boundaries, concurrency model, worktree isolation, and user confirmation requirements already confirmed in this document.