---
sidebar_position: 25
sidebar_class_name: z2k-code
aliases:
- JSON Command - upsert
- cmd upsert
---
# JSON Command: upsert
The `upsert` command creates a note from a template if the target file doesn't exist, or fills its remaining fields if it does. It is the safe choice for any automation that may run multiple times — the same command, the same result, regardless of whether the file was already there.

> [!NOTE] Upsert? Upwhat?
> This term was new to us as well, but when we discovered it - it so perfectly fit that we had to use it. The term "upsert" comes from the database world. The term "upsert" comes from the database world, where it describes an operation that will **insert** a new record if one doesn't exist, or **up**date the existing record if it does — hence, **up**date + in**sert** = **upsert**. One operation, two possible outcomes, no collision.

## Directive Summary
The following [[JSON Directives]] are relevant to the [[JSON Commands|JSON Command]] "`upsert`":

| Directive          | Required | Description                                                                                                                                    |
| ------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `cmd`              | Yes      | Must be `"upsert"` for this command.                                                                                                           |
| `existingFilePath` | Yes      | Vault-relative path to the target file. Checked for existence; used as the output path if the file is created.                                 |
| `templatePath`     | Yes      | Vault-relative path to the template. Used only when the file does not yet exist.                                                               |
| `prompt`           | No       | [[JSON Directives#Prompt Modes\|Prompt mode]]: `"none"`, `"remaining"`, or `"all"`.                                                            |
| `finalize`         | No       | Whether to [[Finalization\|finalize]] the note after filling. Default: template's own setting.                                                 |
| `templateJsonData` | No       | Bundled field data. See [[JSON Field Data]] for how to specify field data.                                                                     |

### Ignored Directives
`destDir`, `fileTitle`, `destHeader`, `location`, and `blockPath` are ignored. The output path is determined entirely by `existingFilePath`.

## How It Works
`upsert` follows one of two paths depending on whether the target file exists:

- **File exists** – behaves exactly like [[JSON Command - continue|`continue`]]. The template is ignored. The command fills any remaining `{{fields}}` in the existing file.
- **File doesn't exist** – behaves like [[JSON Command - new|`new`]], but creates the file at the exact path specified by `existingFilePath`. The parent folder is created automatically if needed. The filename comes from `existingFilePath` — `fileTitle` has no effect.

This distinction matters most in automation: `new` will silently create duplicates (`Note (1).md`, `Note (2).md`) if the file already exists. `upsert` will not.

## Command Queue Compatibility
`upsert` is fully supported in the [[Command Queues|Command Queue]]. Because the command queue uses the same JSON command format, a queued `.json` file with `"cmd": "upsert"` behaves identically to a JSON Package sent via URI. This makes `upsert` well-suited for delayed or batch automation workflows.

## Examples

### Minimal – Daily Note Automation
The classic `upsert` use case: create today's note if it doesn't exist, or pick up where it left off if it does.

```json
{
  "cmd": "upsert",
  "templatePath": "Templates/Daily Note.md",
  "existingFilePath": "Journal/2025-02-05.md"
}
```

On first run, the note is created and the user is prompted for any fields. On subsequent runs, the user is prompted only for fields that remain unresolved.

### Fully Automated – No Prompts
```json
{
  "cmd": "upsert",
  "templatePath": "Templates/Field Log.md",
  "existingFilePath": "Fieldwork/Galápagos-Day-12.md",
  "prompt": "none",
  "finalize": true,
  "species": "Geochelone nigra",
  "location": "Santa Cruz",
  "count": 3,
  "notes": "Two juveniles observed near the water source"
}
```

Whether `Galápagos-Day-12.md` exists or not, the result is the same: a finalized note with all fields filled. Safe to re-run if the job is interrupted.

### Recurring Capture – Keep Fields Open
A Shortcut appends observations throughout the day. `finalize` stays `false` so the file remains a [[WIP Stage|WIP]] for further updates.

```json
{
  "cmd": "upsert",
  "templatePath": "Templates/Observation Log.md",
  "existingFilePath": "Logs/2025-W06.md",
  "prompt": "none",
  "finalize": false,
  "temperature": 21.4,
  "humidity": 63,
  "station": "Roof"
}
```

The log is created on the first run of the week and updated on every subsequent run. Previously-filled fields are left untouched.

### Partial Data – Prompt for the Rest
```json
{
  "cmd": "upsert",
  "templatePath": "Templates/Project Brief.md",
  "existingFilePath": "Projects/Meridian.md",
  "prompt": "remaining",
  "projectName": "Meridian",
  "owner": "GP"
}
```

`projectName` and `owner` are pre-filled. Any other unresolved fields — whether the file is new or existing — will be prompted for interactively.

> [!DANGER] Internal Notes
> - The "file exists" path calls `continueCard`. Confirm that `templatePath` is fully ignored in this path — the template should not be re-applied to an existing content file.
> - The "file doesn't exist" path sets `existingTitle` (from the basename of `existingFilePath`) when calling `createCard`. ==**#TEST Confirm** that this suppresses the title prompt even when `prompt` is not `"none"`.==
> - `ifExists` directive was proposed in issue #131 (values: `continue`, `overwrite`, `fail`) but deliberately deferred. The current behavior is hardcoded: file exists → always continue. No override is available.
> - ==**#AR** The `templatePath` field is marked Required. Confirm the exact error thrown if it is omitted: source shows `throw new TemplatePluginError("Command: 'upsert' cmd requires 'templatePath' or 'templateContents'")`. Document that `templateContents` is an undocumented alternative accepted by the underlying dispatcher — decide whether to expose this or keep it internal.==
