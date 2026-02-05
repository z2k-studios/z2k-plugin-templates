---
sidebar_position: 30
sidebar_class_name: z2k-code
aliases:
- JSON Command - insertblock
- cmd insertblock
---
# JSON Command: insertblock
The `insertblock` command inserts a [[Block Templates|block template]] into an existing note at a specified position. It is the programmatic equivalent of the [[Insert block template]] command palette action.

## Directive Summary
The following [[JSON Directives]] are relevant to the [[JSON Commands|JSON Command]] "`insertblock`":

| Directive          | Required    | Description                                                                                                                                                   |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cmd`              | Yes         | Must be `"insertblock"` for this command.                                                                                                                     |
| `templatePath`     | Conditional | Vault-relative path to the block template. Required unless the plugin can prompt interactively.                                                               |
| `blockPath`        | Conditional | Alias for `templatePath`. Either `templatePath` or `blockPath` must be provided.                                                                              |
| `existingFilePath` | Conditional | Vault-relative path to the target file. Required for batch/URI use. In interactive mode, defaults to the active file.                                         |
| `destHeader`       | Conditional | Target header in the file. Required when `location` is `"header-top"` or `"header-bottom"`. See [[JSON Directives#destHeader Matching\|destHeader Matching]]. |
| `location`         | No          | Where to insert the block. See [[#Insertion Location]] below.                                                                                                 |
| `prompt`           | No          | [[JSON Directives#Prompt Modes\|Prompt mode]]: `"none"`, `"remaining"`, or `"all"`.                                                                           |
| `finalize`         | No          | Whether to [[Finalization\|finalize]] the inserted block. Default: template's own setting.                                                                    |
| `templateJsonData` | No          | Bundled field data. See [[JSON Field Data]] for how to specify field data.                                                                                    |
### Ignored Directives
The directive `destDir` is ignored for the `insertblock` command. The block is inserted into an existing file, not used to create a new one.

## Insertion Location
The `location` and `destHeader` directives work together to determine where the block content is placed:

| `location`        | `destHeader` | Behavior                                                                                                |
| ----------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `"file-top"`      | ignored      | Insert at the top of the file content (after frontmatter).                                              |
| `"file-bottom"`   | ignored      | Insert at the bottom of the file.                                                                       |
| `"header-top"`    | **required** | Insert at the beginning of the matched header's section.                                                |
| `"header-bottom"` | **required** | Insert at the end of the matched header's section (before the next header).                             |
| `<number>`        | ignored      | Insert at a specific line number.                                                                       |
| omitted           | provided     | Defaults to `"header-top"` for backward compatibility.                                                  |
| omitted           | omitted      | Falls through to **editor mode** — inserts at the cursor position. Only meaningful for interactive use. |

> [!WARNING]
> When using `insertblock` from a [[Command Queues|Command List]] (batch processing), always specify `location` or `destHeader` explicitly. Editor mode requires an active editor and cursor position, which is not available in batch context.

### destHeader Matching
The `destHeader` value is matched against headers in the target file. For full matching rules (case sensitivity, header level, multiple matches), see [[JSON Directives#destHeader Matching]].

## Examples

### Insert at a Specific Header
```json
{
  "cmd": "insertblock",
  "blockPath": "Templates/Blocks/Task List.block",
  "existingFilePath": "Notes/Project Plan.md",
  "destHeader": "Tasks",
  "location": "header-bottom",
  "projectName": "Z2K v2"
}
```

The block template is rendered with `projectName = "Z2K v2"` and inserted at the bottom of the `## Tasks` section (or whichever level the "Tasks" header is at).

### Insert at a Specific Header Level
```json
{
  "cmd": "insertblock",
  "blockPath": "Templates/Blocks/Note.block",
  "existingFilePath": "Notes/Journal.md",
  "destHeader": "### Morning",
  "location": "header-top"
}
```

The `###` prefix restricts the match to H3 headers only — `### Morning` matches, but `## Morning` or `# Morning` do not.

### Insert at the Top of a File
```json
{
  "cmd": "insertblock",
  "blockPath": "Templates/Blocks/Status Banner.block",
  "existingFilePath": "Projects/Z2K v2.md",
  "location": "file-top",
  "status": "active",
  "lastUpdated": "2024-01-15"
}
```

### Insert at a Line Number
```json
{
  "cmd": "insertblock",
  "blockPath": "Templates/Blocks/Divider.block",
  "existingFilePath": "Notes/Long Note.md",
  "location": 42
}
```

The block is inserted at line 42 of the file.

### Fully Automated Batch Insert
```json
{
  "cmd": "insertblock",
  "blockPath": "Templates/Blocks/Milestone.block",
  "existingFilePath": "Projects/Z2K v2.md",
  "destHeader": "Milestones",
  "location": "header-bottom",
  "prompt": "none",
  "finalize": true,
  "milestone": "Alpha Release",
  "targetDate": "2024-03-01"
}
```

No prompting, fully finalized — suitable for batch processing via a [[JSONL Format|.jsonl file]].

> [!DANGER] Internal Notes
> - There is currently no way to pass inline block content (a raw template body) via `insertblock` — it always requires a `templatePath` or `blockPath` pointing to an existing template file. An inline content parameter would be a useful addition. File as a feature request.
> - Confirm what happens when `location` is a line number that exceeds the file's total lines. Does it insert at the end? Does it throw?
> - When `location` is omitted and `destHeader` is omitted, the command falls through to editor mode. In a batch context (Command Queue), this would likely throw because there's no active editor. Confirm this error behavior.
> - The YAML from the block template is merged into the existing file's frontmatter using "last wins" strategy. Worth documenting this YAML merging behavior — it may warrant its own note or cross-reference to [[Merging Multiple YAML Sources]].
