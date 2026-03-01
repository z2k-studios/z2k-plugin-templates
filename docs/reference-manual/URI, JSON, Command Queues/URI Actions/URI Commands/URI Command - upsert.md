---
sidebar_position: 25
sidebar_label: "upsert"
sidebar_class_name: z2k-code
aliases:
- URI Command - upsert
- URI upsert
---
# URI Command: upsert
The URI `upsert` command creates a note from a template if the target file doesn't exist, or fills its remaining fields if it does. It is the correct command for any automation that may run multiple times against the same file — the operation is safe to repeat.

> [!NOTE] Upsert? Upwhat?
> This term was new to us as well, but when we discovered it - it so perfectly fit that we had to use it. The term "upsert" comes from the database world. The term "upsert" comes from the database world, where it describes an operation that will **insert** a new record if one doesn't exist, or **up**date the existing record if it does — hence, **up**date + in**sert** = **upsert**. One operation, two possible outcomes, no collision.

## Quick Reference
A minimal URI to create or update a note:

```
obsidian://z2k-templates?vault=MyVault&cmd=upsert&templatePath=Templates%2FDaily.md&existingFilePath=Journal%2F2025-02-05.md
```

If `Journal/2025-02-05.md` exists, the command fills its remaining fields. If it doesn't exist, the command creates it from `Templates/Daily.md` at that exact path.

## JSON Consistency
The URI `upsert` command is equivalent to the [[JSON Command - upsert|JSON `upsert` command]] – same directives, same behavior, different transport. For the full command reference, see [[JSON Command - upsert]].

## How It Works
`upsert` follows one of two paths depending on whether the target file exists:

- **File exists** – behaves exactly like [[URI Command - continue|`continue`]]. The template is ignored. The command fills any remaining `{{fields}}` in the existing file.
- **File doesn't exist** – behaves like [[URI Command - new|`new`]], but creates the file at the exact path specified by `existingFilePath`. The folder is created automatically if needed. The filename is taken from `existingFilePath` directly – `fileTitle` has no effect on the output path.

> [!NOTE]
> Unlike `new`, there is no ambiguity about the output file path. `upsert` always writes to `existingFilePath`, whether creating or updating. This makes it safe to chain with other commands or run repeatedly without producing duplicates.

## Supported Directives
The table below summarizes the [[URI Directives]] relevant to the `upsert` command.

| Directive          | Required | Notes                                                                                  |
| ------------------ | -------- | -------------------------------------------------------------------------------------- |
| `existingFilePath` | Yes      | Vault-relative path to the target file. Used to check existence and as the output path when creating. |
| `templatePath`     | Yes      | Vault-relative path to the template. Used only when the file does not yet exist.       |
| `prompt`           | No       | `none`, `remaining`, or `all`                                                          |
| `finalize`         | No       | `true` or `false`                                                                      |

> [!NOTE]
> `fileTitle` and `destDir` are not used by `upsert`. The output path is determined entirely by `existingFilePath`.

## Field Data
All remaining parameters that do not match a [[URI Directives|URI Directive]] keyword are treated as field data. The plugin fills the matching `{{fields}}` with the provided values regardless of which path is taken (create or update). See [[URI Field Data]].

All values arrive as strings. The plugin converts them based on [[URI Type Handling|field type declarations]].

## Examples

### Example – Daily Note Automation
*Task:* A morning automation triggers a daily note. On the first run it creates the file. On every subsequent run that day it fills any remaining fields – without creating duplicates.

*Pre-encoded:*
```
vault            = MyVault
cmd              = upsert
templatePath     = Templates/Daily Note.md
existingFilePath = Journal/2025-02-05.md
prompt           = none
mood             = Hopeful
weather          = Overcast
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=upsert&templatePath=Templates%2FDaily%20Note.md&existingFilePath=Journal%2F2025-02-05.md&prompt=none&mood=Hopeful&weather=Overcast
```

First run: `Journal/2025-02-05.md` is created from the template with `{{mood}}` and `{{weather}}` pre-filled. Second run: the existing file receives the same values, leaving any already-filled fields untouched.

### Example – Recurring Capture, No Prompting
*Task:* A Shortcut captures sensor readings throughout the day into a single weekly log. The log is created on first capture, updated on every subsequent one.

*Pre-encoded:*
```
vault            = MyVault
cmd              = upsert
templatePath     = Templates/Weekly Log.md
existingFilePath = Logs/2025-W06.md
prompt           = none
finalize         = false
temperature      = 21.4
humidity         = 63
station          = Roof
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=upsert&templatePath=Templates%2FWeekly%20Log.md&existingFilePath=Logs%2F2025-W06.md&prompt=none&finalize=false&temperature=21.4&humidity=63&station=Roof
```

The file is created on Monday and updated throughout the week. `finalize=false` keeps remaining fields open for later captures.

### Example – Idempotent Full Automation
*Task:* A batch job generates a report note with all fields pre-filled. The operation must be safe to re-run if the job is interrupted and retried.

*Pre-encoded:*
```
vault            = MyVault
cmd              = upsert
templatePath     = Templates/Report.md
existingFilePath = Reports/Q4-2025.md
prompt           = none
finalize         = true
title            = Q4 Performance Summary
period           = Q4 2025
author           = Automation
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=upsert&templatePath=Templates%2FReport.md&existingFilePath=Reports%2FQ4-2025.md&prompt=none&finalize=true&title=Q4%20Performance%20Summary&period=Q4%202025&author=Automation
```

Whether this URI runs once or ten times, the result is the same: a single finalized note at `Reports/Q4-2025.md`.

> [!DANGER] INTERNAL NOTES
> - The "file exists" path calls `continueCard` directly. Confirm that `continueCard` ignores `templatePath` when called from `upsert` — the source shows no explicit guard, but the `continue` command's own `Ignored Directives` note suggests this is safe. Verify there is no template re-application.
> - The "file doesn't exist" path extracts the basename from `existingFilePath` by stripping `.md` and sets it as `existingTitle` on `createCard`. ==**#TEST Confirm** that this prevents the user being prompted for a title even when `prompt` is not `none`. Does `existingTitle` fully suppress the title prompt?==
> - `ifExists` directive (e.g., `ifExists=continue|overwrite|fail`) was proposed in issue #131 but deliberately deferred. Current behavior is fixed: file exists → always continue. If the `overwrite` path is later added, this page will need a new section.
> - ==**#TEST** Confirm that `upsert` works correctly via Command Queues. Source code inspection confirms `processCommand` is shared, but end-to-end queue testing for this command path has not been documented.==
