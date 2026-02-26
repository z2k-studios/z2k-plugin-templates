---
sidebar_position: 10
sidebar_class_name: z2k-code
aliases:
- JSON Command - new
- cmd new
---
# JSON Command: new
The `new` command creates a new note from a template. It is the most common command in a [[JSON Packages Overview|JSON Package]] — the standard way to programmatically generate notes from outside Obsidian.

## Directive Summary
The following [[JSON Directives]] are relevant to the [[JSON Commands|JSON Command]] "`new`":

| Directive          | Required | Description                                                                                                     |
| ------------------ | -------- | --------------------------------------------------------------------------------------------------------------- |
| `cmd`              | Yes      | Must be `"new"` for this command.                                                                               |
| `templatePath`     | Yes      | Vault-relative path to the template file.                                                                       |
| `destDir`          | No       | Vault-relative path to the output folder. Defaults to the template's card type folder. Auto-creates if missing. |
| `prompt`           | No       | [[JSON Directives#Prompt Modes\|Prompt mode]]: `"none"`, `"remaining"`, or `"all"`.                             |
| `finalize`         | No       | Whether to [[Finalization\|finalize]] the note (resolve all remaining fields). Default: template's own setting. |
| `fieldData` | No       | Bundled field data. See [[JSON Field Data]] for how to specify field data.                                      |
### Ignored Directives
The directives `existingFilePath`, `destHeader`, `location`, `blockPath` are ignored. These are not used by the `new` command.

## Output Filename
The filename of the created note is determined by the [[Built-In Fields - File Data|fileTitle]] field. You can provide it as field data in the JSON Package:

```json
{
  "cmd": "new",
  "templatePath": "Templates/Meeting Notes.md",
  "fileTitle": "Team Standup 2024-01-15"
}
```

If `fileTitle` is not provided:
- The template's `z2k_template_suggested_title` YAML property is used as a suggestion
- If `prompt` is not `"none"`, the user is prompted for a title
- If `prompt` is `"none"` and no title is available, the plugin's default naming applies

## Examples

### Minimal — Template Only
```json
{
  "cmd": "new",
  "templatePath": "Templates/Daily Note.md"
}
```

The user will be prompted to select field values and enter a title interactively.

### Fully Automated — No Prompts
```json
{
  "cmd": "new",
  "templatePath": "Templates/Meeting Notes.md",
  "prompt": "none",
  "finalize": true,
  "fileTitle": "Standup 2024-01-15",
  "attendees": "Alice, Bob, Charlie",
  "meetingType": "standup",
  "duration": 30
}
```

All fields are supplied, no prompting occurs, and the note is finalized immediately.

### Partial Data — Prompt for the Rest
```json
{
  "cmd": "new",
  "templatePath": "Templates/Project Brief.md",
  "prompt": "remaining",
  "fileTitle": "Z2K v2 Brief",
  "projectName": "Z2K v2",
  "owner": "GP"
}
```

`projectName` and `owner` are pre-filled and the user won't be prompted for them. Any other fields in the template will be prompted normally.

### Custom Output Folder
```json
{
  "cmd": "new",
  "templatePath": "Templates/Contact Card.md",
  "destDir": "People/New Contacts",
  "prompt": "none",
  "fileTitle": "Alice Chen",
  "name": "Alice Chen",
  "role": "Engineer"
}
```

The note will be created in `People/New Contacts/` instead of the template's default folder. The folder is created if it doesn't exist.

### With External Field Data
```json
{
  "cmd": "new",
  "templatePath": "Templates/Import Record.md",
  "prompt": "none",
  "finalize": true,
  "fieldData": "Data/imports/record-2024-01-15.json"
}
```

Field data is loaded from a separate file in the vault. See [[fieldData]] for details.

> [!DANGER] Internal Notes
> - Confirm exact behavior when `prompt` is `"none"`, `fileTitle` is not provided, and no `z2k_template_suggested_title` exists. Does the plugin generate a name from the template filename? Does it throw an error? The code path needs tracing through `createCard` → title resolution.
> - The `destDir` auto-creation uses `this.createFolder()` — confirm this works for nested paths (e.g., `"A/B/C"` where none exist).
