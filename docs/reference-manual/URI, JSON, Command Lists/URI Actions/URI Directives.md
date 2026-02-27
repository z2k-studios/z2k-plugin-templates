---
sidebar_position: 30
aliases:
- URI Directives
- URI Directive
---
# URI Directives
URI Directives are parameters that control the plugin's behavior when processing [[URI Actions]] – which template to use, where to put the output, whether to prompt the user. They are distinct from field data, which supplies values for template fields.

The plugin recognizes a fixed set of directive keys. Any parameter not in this set is treated as field data. Directive keys are case-insensitive and ignore non-alphanumeric characters – `templatePath`, `template_path`, and `TemplatePath` all resolve to the same directive.

## Directive Reference
The table below lists all recognized directives. Not all directives apply to every command – see the individual [[URI Commands|command pages]] for which directives each command uses.

| Directive | Applies To | Description |
|-----------|-----------|-------------|
| `cmd` | All | The command to execute: `new`, `continue`, `upsert`, `insertblock`, or `fromJson`. Always required. |
| `templatePath` | `new`, `upsert`, `insertblock` | Vault-relative path to the template or block template file. Mutually exclusive with `templateContents`. |
| `blockPath` | `insertblock` | Alias for `templatePath` when used with `insertblock`. Mutually exclusive with `blockContents`. |
| `templateContents` | `new`, `upsert`, `insertblock` | Inline template text — used instead of `templatePath`. No file on disk is needed. See [[JSON Directives#Template Source]]. |
| `blockContents` | `insertblock` | Alias for `templateContents` when inserting inline block content. Mutually exclusive with `blockPath`. |
| `existingFilePath` | `continue`, `upsert`, `insertblock` | Vault-relative path to the target file. For `upsert`, also used as the output path when creating. |
| `destDir` | `new` | Override the default output folder for the new file. |
| `destHeader` | `insertblock` | The header under which to insert the block. Required when `location` is `header-top` or `header-bottom`. See [[JSON Directives#destHeader Matching]]. |
| `prompt` | All | Controls the interactive prompt UI: `none` (suppress all prompts), `remaining` (prompt only for fields not already supplied), or `all` (prompt for every field, pre-filling supplied values). |
| `finalize` | All | `true` or `false`. When `true`, all remaining unresolved fields are resolved to their fallback values and the note is finalized. |
| `location` | `insertblock` | Where to insert the block: `file-top`, `file-bottom`, `header-top`, `header-bottom`, or a line number. See [[JSON Directives#Location Values]]. |
| `fileTitle` | `new` | Set the output filename (without extension). |
| `fieldData` | All | A JSON string or vault-relative file path containing field data. See [[URIs with JSON Data#fieldData]]. |
| `fieldData64` | All | Base64-encoded version of `fieldData`. See [[URIs with JSON Data#Base64 Encoding]]. |
| `jsonData` | `fromJson` | A JSON string containing a complete command package. See [[URI Command - fromJson]]. |
| `jsonData64` | `fromJson` | Base64-encoded version of `jsonData`. See [[URIs with JSON Data#Base64 Encoding]]. |
| `maxRetries` | All | Maximum retry attempts for batch/queue processing. Use `-1` for unlimited. |
| `retryDelay` | All | Duration to wait between retries (e.g., `"5s"`, `"1m"`). |

## Directives vs Field Data
Every parameter on a URI is either a directive or field data. The distinction:
- **Directives** control the operation itself – they tell the plugin *what to do* and *how to do it*
- **Field data** provides values for the template – they fill in `{{fields}}`

If a parameter key matches a recognized directive (case-insensitive), it is treated as a directive. Otherwise, it is treated as field data and its key must match a field name in the template exactly (case-sensitive).

> [!WARNING]
> Field data keys are case-sensitive. `meetingType` and `meetingtype` are different keys. Make sure your URI parameter keys match your template field names exactly.

## The vault Parameter
The `vault` parameter is handled by Obsidian itself, not by the Z2K Templates plugin. It tells Obsidian which vault to switch to before executing the command. It is not listed in the directive table above because the plugin never sees it – Obsidian processes it before routing the URI to the plugin. See [[URI Syntax#Vault]] for details.

> [!DANGER] Internal Notes
> - The recognized directive keys are defined in `knownKeys` at line 1331 of main.tsx: `cmd`, `templatePath`, `blockPath`, `templateContents`, `blockContents`, `existingFilePath`, `destDir`, `destHeader`, `prompt`, `finalize`, `location`, `fieldData`, `fieldData64`, `jsonData`, `jsonData64`, `maxRetries`, `retryDelay`.
> - Directive key normalization (line 1249): `k.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()`. This means `template-path`, `template_path`, `templatePath`, and `TEMPLATEPATH` all match. Field data keys are NOT normalized – they preserve original casing.
> - Consider whether `vault` should be added to `knownKeys` and silently discarded, in case Obsidian passes it through to the handler rather than stripping it. Without this, a `vault` parameter would be treated as field data.
