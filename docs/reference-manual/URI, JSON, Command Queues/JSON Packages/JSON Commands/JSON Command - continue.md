---
sidebar_position: 20
sidebar_class_name: z2k-code
aliases:
- JSON Command - continue
- cmd continue
---
# JSON Command: continue
The `continue` command picks up where a previous instantiation left off — it fills in remaining [[Template Fields]] in an existing note that still has unresolved `{{fields}}`. This is the programmatic equivalent of the [[Continue filling note]] command palette action.

## Directive Summary
The following [[JSON Directives]] are relevant to the [[JSON Commands|JSON Command]] "`continue`":

| Directive          | Required | Description                                                                                    |
| ------------------ | -------- | ---------------------------------------------------------------------------------------------- |
| `cmd`              | Yes      | Must be `"continue"` for this command.                                                         |
| `existingFilePath` | Yes      | Vault-relative path to the existing note to continue filling.                                  |
| `prompt`           | No       | [[JSON Directives#Prompt Modes\|Prompt mode]]: `"none"`, `"remaining"`, or `"all"`.            |
| `finalize`         | No       | Whether to [[Finalization\|finalize]] the note after filling. Default: template's own setting. |
| `fieldData` | No       | Bundled field data. See [[JSON Field Data]] for how to specify field data.                     |

### Ignored Directives
The directives `templatePath`, `blockPath`, `destDir`, `destHeader`, `location` are all ignored. The template is determined from the existing file's metadata — you don't need to specify it again.

## When to Use
The `continue` command is designed for [[Deferred Field Resolution]] — the workflow where a note is created with some fields left unresolved, and additional data is supplied later. Common scenarios:
- An automation creates a note with partial data, and the user fills in the rest manually
- A batch process creates notes in stages, each pass supplying different fields
- A note was created interactively but the user skipped some fields and wants to fill them programmatically later

## Examples

### Supply Missing Fields
```json
{
  "cmd": "continue",
  "existingFilePath": "Notes/Meeting 2024-01-15.md",
  "prompt": "none",
  "actionItems": "Review Q4 metrics, Schedule follow-up",
  "summary": "Discussed roadmap priorities"
}
```

The fields `actionItems` and `summary` are filled in without any prompting.

### Prompt for Remaining Fields
```json
{
  "cmd": "continue",
  "existingFilePath": "Projects/Z2K v2.md",
  "prompt": "remaining",
  "status": "active"
}
```

`status` is pre-filled. Any other unresolved fields in the note will be prompted interactively.

### Finalize a Note
```json
{
  "cmd": "continue",
  "existingFilePath": "Notes/Draft Note.md",
  "prompt": "none",
  "finalize": true
}
```

No new field data is supplied — this just finalizes the note, resolving all remaining fields using their fallback values.

> [!DANGER] INTERNAL NOTES
> - Confirm how the plugin determines the original template for a continued file. It likely reads the `z2k_template_name` or `z2k_template_type` YAML property from the file's frontmatter.
> - What happens if `existingFilePath` points to a file that was never created from a template (i.e., has no template metadata)? Does it fail gracefully or throw?
