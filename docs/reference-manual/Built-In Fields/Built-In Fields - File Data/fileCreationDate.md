---
sidebar_position: 40
sidebar_label: "{{fileCreationDate}}"
sidebar_class_name: z2k-code
aliases:
- fileCreationDate
- File Creation Date
---
# fileCreationDate Built-In Field
The `{{fileCreationDate}}` built-in field returns the creation date of the file being operated on. It is not the same as `{{date}}` or `{{today}}` — those return the current date. `{{fileCreationDate}}` returns when the *file itself* was created, which may be in the past.

## Default Format
The default format is `YYYY-MM-DD`.

## Behavior by Context
The value returned depends on which command triggered the template:

| Command | Value Returned |
|---|---|
| **Create new note** | Today's date — the file is new, so its creation date is now |
| **Apply template to existing file** | The original file's creation date from the filesystem |
| **Continue filling note** | The current file's creation date |
| **Insert block template** | The current file's creation date |

A key use case is **[[Apply template to file]]**: a user creates a note on one date and structures it with a template later. `{{fileCreationDate}}` captures the original date, not the date the template was applied.

## Example - Apply Template to File
A user jots down quick meeting notes on July 6th. Two weeks later, they run **Apply template to file** using a Meeting Notes template. The template contains:

```handlebars title="Meeting Notes.md"
---
date: {{fileCreationDate}}
---
# {{fileTitle}} – {{fileCreationDate}}
{{sourceText}}
```

The resulting file will show `2026-07-06` for the date — not July 20th when the template was applied.

## Related Fields
- [[date]] — returns today's date (current date, not file creation date)
- [[today]] — the recommended equivalent to `{{date}}`
- [[fileTitle and Variations|fileTitle]] — the name of the file being operated on

> [!DANGER]
> - The creation date comes from the filesystem via `TFile.stat.ctime`. On some systems or after certain file operations (e.g., copying a file), `ctime` may reflect the copy date rather than the true original creation date.
> - The value is stored as a pre-formatted `YYYY-MM-DD` string. Unlike `{{now}}`, there is no raw-moment equivalent for the file creation timestamp. Custom date formatting via `{{formatDate}}` may not work as expected — verify against the [[formatDate]] reference if a different format is needed.
