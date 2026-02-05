---
sidebar_position: 30
aliases:
- JSON Directives
- JSON Directive Keys
- directive keys
---
# JSON Directives
A [[JSON Packages Overview|Z2K Templates JSON Package]] supports a number of directives to help guide how [[JSON Commands]] are performed. This page describes the directives in more detail.

## Contents
- [[#Directive Keys]]

## Directive Keys
These keys are recognized as command directives and are separated from field data during processing:

| Key                  | Type                         | Description                                                                                                                                                                                                   |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cmd`                | string                       | **Required.** The command to execute. See [[JSON Commands]] for more details.                                                                                                                                 |
| `templatePath`       | string                       | Vault-relative path to the template file.                                                                                                                                                                     |
| `blockPath`          | string                       | Alias for `templatePath` — used when inserting block templates.                                                                                                                                               |
| `existingFilePath`   | string                       | Vault-relative path to an existing file (for `continue` and `insertblock` commands).                                                                                                                          |
| `destDir`            | string                       | Vault-relative path to the destination folder for the output file. If omitted, the template's configured card type folder is used. The folder is created automatically if it doesn't exist.                   |
| `destHeader`         | string                       | Target header name within the existing file. See [[#destHeader Matching]] for matching rules.                                                                                                                 |
| `prompt`             | string                       | Controls whether the user is prompted for field values. See [[#Prompt Modes]].                                                                                                                                |
| `finalize`           | boolean or string            | Whether to finalize the output file (resolve all remaining fields). Accepts `true`, `false`, `"true"`, `"false"`, `"1"`, `"0"`, `"yes"`, `"no"`.                                                              |
| `location`           | string or number             | Where to insert content (for `insertblock`). See [[#Location Values]].                                                                                                                                        |
| `templateJsonData`   | object, string, or file path | Field data, provided as an inline JSON object, an inline JSON string, or a vault-relative path to a `.json` file containing field data. See [[templateJsonData]] for all three input forms and merging rules. |
| `templateJsonData64` | string                       | Base64-encoded field data. See [[JSON64 Format]].                                                                                                                                                             |
| `json`               | string                       | A JSON-encoded command string — the payload for the `json` command. Not used with other commands. See [[json Command]].                                                                                       |
| `json64`             | string                       | Base64-encoded equivalent of `json`. See [[JSON64 Format]].                                                                                                                                                   |
| `maxRetries`         | number                       | Maximum retry attempts on failure (default: 0). Used by the [[Command Queue]].                                                                                                                                |
| `retryDelayMs`       | number                       | Delay in milliseconds between retry attempts (default: 0). Used by the [[Command Queue]].                                                                                                                     |

## Prompt Modes
The `prompt` directive controls whether the user is prompted to fill in field values:

| Value         | Behavior                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `"none"`      | No prompts — all fields use their provided values or fallbacks silently.                                                         |
| `"remaining"` | Only prompt for fields that were *not* supplied in the JSON Package. Fields with values from the package are marked `no-prompt`. |
| `"all"`       | Prompt for every field, even those with supplied values. The supplied values become suggested defaults.                          |
When `prompt` is omitted, the template's own prompting configuration determines behavior.

## Location Values
The `location` directive controls where content is inserted (relevant for `insertblock`):

| Value             | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `"file-top"`      | Insert at the top of the file (after frontmatter).                             |
| `"file-bottom"`   | Insert at the bottom of the file.                                              |
| `"header-top"`    | Insert at the top of the section under `destHeader`. Requires `destHeader`.    |
| `"header-bottom"` | Insert at the bottom of the section under `destHeader`. Requires `destHeader`. |
| `<number>`        | Insert at a specific line number.                                              |

When `location` is omitted:
- If `destHeader` is provided, the plugin defaults to `"header-top"` for backward compatibility
- If neither `location` nor `destHeader` is provided, the command falls through to **editor mode** — it inserts at the cursor position in the active editor. This is only meaningful for interactive (UI) use; batch commands from the [[Command Queue]] should always specify `location` or `destHeader`.

## destHeader Matching
The `destHeader` value is matched against headers in the target file with these rules:
- **With `#` symbols** (e.g., `"## Tasks"`) — matches only headers at that specific level. `"## Tasks"` matches `## Tasks` but not `### Tasks` or `# Tasks`.
- **Without `#` symbols** (e.g., `"Tasks"`) — matches the header text at any level. `"Tasks"` matches `# Tasks`, `## Tasks`, `### Tasks`, etc.
- **Case-insensitive** — `"tasks"` matches `## Tasks`.
- **Full text match** — the header text must match completely. `"Task"` does not match `## Tasks` or `## Task List`.
- **First match wins** — if multiple headers match, the first one in the file is used.

## Output Filename
The JSON Package does not have a dedicated directive for the output filename. Instead, the filename is determined by the built-in [[Built-In Fields - File Data|fileTitle]] field (also aliased as `noteTitle` and `cardTitle`). You can set it like any other field:

```json
{
  "cmd": "new",
  "templatePath": "Templates/Meeting Notes.md",
  "fileTitle": "Team Standup 2024-01-15",
  "attendees": "Alice, Bob"
}
```

If `fileTitle` is not provided in the JSON Package:
- The template's `z2k_template_suggested_title` YAML property is used as a suggested value
- If `prompt` is not `"none"`, the user is prompted to enter a title
- If `prompt` is `"none"` and no suggestion exists, the plugin's default naming behavior applies
