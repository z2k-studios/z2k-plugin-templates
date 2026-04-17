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
- [[#Template Source]]
- [[#Location Values]]
- [[#Line Number Semantics]]

## Directive Keys
These keys are recognized as command directives and are separated from field data during processing:

| Key                  | Type                         | Description                                                                                                                                                                                                   |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cmd`                | string                       | **Required.** The command to execute. See [[JSON Commands]] for more details.                                                                                                                                 |
| `templatePath`       | string                       | Vault-relative path to the template file. Mutually exclusive with `templateContents`. See [[#Template Source]].                                                                                               |
| `blockPath`          | string                       | Alias for `templatePath` — used when inserting block templates. Mutually exclusive with `blockContents`.                                                                                                      |
| `templateContents`   | string                       | Inline template text, used instead of `templatePath`. No file on disk is needed. See [[#Template Source]].                                                                                                    |
| `blockContents`      | string                       | Alias for `templateContents` — used when inserting inline block content. Mutually exclusive with `blockPath`.                                                                                                 |
| `existingFilePath`   | string                       | Vault-relative path to the target file. Used by `continue` and `insertblock` to locate the file. Used by `upsert` to both check for the file's existence and determine the output path when creating.        |
| `destDir`            | string                       | Vault-relative path to the destination folder for the output file. If omitted, the template's configured card type folder is used. The folder is created automatically if it doesn't exist.                   |
| `destHeader`         | string                       | Target header name within the existing file. See [[#destHeader Matching]] for matching rules.                                                                                                                 |
| `prompt`             | string                       | Controls whether the user is prompted for field values. See [[#Prompt Modes]].                                                                                                                                |
| `finalize`           | boolean or string            | Whether to finalize the output file (resolve all remaining fields). Accepts `true`, `false`, `"true"`, `"false"`, `"1"`, `"0"`, `"yes"`, `"no"`.                                                              |
| `location`           | string or number             | Where to insert content (for `insertblock`). See [[#Location Values]].                                                                                                                                        |
| `fieldData`   | object, string, or file path | Field data, provided as an inline JSON object, an inline JSON string, or a vault-relative path to a `.json` file containing field data. See [[fieldData]] for all three input forms and merging rules. |
| `fieldData64` | string                       | Base64-encoded field data. See [[JSON64 Format]].                                                                                                                                                             |
| `json`               | string                       | A JSON-encoded command string — the payload for the `json` command. Not used with other commands. See [[URI Command - fromJson|fromJson command]].                                                                                       |
| `jsonData64`             | string                       | Base64-encoded equivalent of `json`. See [[JSON64 Format]].                                                                                                                                                   |
| `maxRetries`         | number                       | Maximum retry attempts on failure (default: 0). Use `-1` for unlimited retries. Used by the [[Command Queue]].                                                                                                |
| `retryDelay`         | string                       | Duration to wait between retry attempts (e.g., `"5s"`, `"1m"`). Default: `"0s"`. Used by the [[Command Queue]].                                                                                               |

## Template Source
Every command that creates or inserts content requires a template source. There are two ways to supply one:

- **`templatePath` / `blockPath`** — a vault-relative path to a template file on disk. This is the standard approach.
- **`templateContents` / `blockContents`** — the raw template text, supplied inline. No file on disk is needed.

Exactly one of the two must be provided. Supplying both is an error.

When using inline content (`templateContents` or `blockContents`):
- The destination folder defaults to the vault root. Override it with `destDir`.
- System blocks are not applied — no folder-level YAML is injected.
- The global block YAML is still applied.
- All field features work normally: `{{fi}}` declarations, field overrides, helpers, and prompting.

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
| `<number>`        | Insert at a specific line number. See [[#Line Number Semantics]].              |

### Line Number Semantics
Line numbers follow a **1-based insertion-point model** – the number indicates the gap *before* a line, not the line itself.

**Positive numbers** (valid range: `1` to `N+1`, where N is the total line count in the file):
- `1` – insert before the first line
- `N` – insert before the last line
- `N+1` – insert after the last line (append)

**Negative numbers** (valid range: `-1` to `-N`):
- `-1` – insert before the last line
- `-2` – insert before the second-to-last line
- `-N` – insert before the first line (equivalent to `1`)

**`0` is not valid** – it throws an error. Use `1` or `"file-top"` to insert at the top of the file.

Values outside the valid range throw an error that includes the file's actual line count and the valid range.

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

> [!DANGER] INTERNAL NOTES
> - Notes:
>   - The command processor normalizes casing and delimiter variants of `templatePath` (`TemplatePath`, `template-path`, `template_path`, etc.) for robustness. This is intentional but should not be documented as a feature — the canonical form is `templatePath` only. Documenting the variants would imply they are equally supported by design.
