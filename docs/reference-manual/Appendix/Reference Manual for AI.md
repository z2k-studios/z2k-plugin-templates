---
sidebar_position: 30
title: Reference Manual for AI
sidebar_label: Reference Manual for AI
aliases:
- Reference Manual for AI
- AI Reference
---
# Reference Manual for AI
Z2K Templates is an Obsidian plugin for structured note creation using a Handlebars-based `{{field}}` syntax. This page is a self-contained technical reference for AI agents writing templates or constructing automation calls. For full detail on any topic, follow the wikilinks to the relevant section of the reference manual.

## Contents
- [[#Template Syntax]]
- [[#fieldInfo Helper]]
- [[#Built-In Fields]]
- [[#Built-In Helper Functions]]
- [[#YAML Configuration]]
- [[#Template Lifecycle]]
- [[#Automation — URI, JSON, and Command Queues]]
- [[#Naming Conventions]]

---

## Template Syntax

### Fields
A **field** is a `{{FieldName}}` placeholder replaced with data at instantiation or finalization.
- User-defined fields start uppercase: `{{BookTitle}}`
- Built-in fields start lowercase: `{{date}}`, `{{creator}}`
- Dot notation for nested JSON/YAML data: `{{person.firstname}}`

### Helper Functions
A **helper function** is a `{{helperName param1 param2}}` expression that transforms data. Parameters are space-separated.

```md
{{wikilink today}}
{{formatDate 'MMMM D, YYYY' now}}
{{formatStringToUpper Title}}
```

Nest helpers with parentheses (subexpressions):

```md
{{wikilink (formatDate 'YYYY-MM-DD' now)}}
```

### Block Templates
Insert a reusable template fragment with `{{> BlockName}}`. Block templates are stored in Templates folders and identified by `z2k_template_type: block-template` in YAML or a `.block` file extension. See [[Block Templates]].

### Comments
```md
{{! This comment is removed at finalization and produces no output }}
```

### Whitespace Control
Tilde strips whitespace on either side of an expression:
```md
{{~fieldName~}}
```

### Handlebars Block Helpers
Standard Handlebars block helpers work in the template body and in YAML frontmatter:
```md
{{#if Status}}Status: **{{Status}}**{{/if}}
{{#each Tags}}- {{this}}
{{/each}}
```
See [[Handlebars Support]] for the full list of supported built-in block helpers.

---

## fieldInfo Helper
`{{fieldInfo}}` (abbreviated: `{{fi}}`) is a **silent helper** that declares metadata about a field — it produces no output. Place it anywhere in the template body. See [[fieldInfo Helper]] for full documentation.

**Syntax:**
```
{{fieldInfo FieldName "prompt text" "suggest value" type=<type> fallback=<value> directives=<directive> opts=<options>}}
```

**Parameters:**

| Parameter | Position | Description |
|-----------|----------|-------------|
| `FieldName` | 1st | The field this declaration applies to |
| `"prompt"` | 2nd | Text shown to the user in the prompt dialog |
| `"suggest"` | 3rd | Pre-filled suggested value |
| `type=` | named | Field type — see below |
| `fallback=` | named | Value used when the field is unfilled at finalization |
| `directives=` | named | Behavioral flags — see below |
| `opts=` | named | Options list for `singleSelect` / `multiSelect` |
| `value=` | named | Pre-assigns a value, bypassing prompting |

**Field types (`type=`):** `text`, `titleText`, `number`, `date`, `boolean`, `singleSelect`, `multiSelect`

**Directives (`directives=`):**
- `required` — user must fill this field at instantiation
- `no-prompt` — never prompt; use `value` or `fallback` silently
- `finalize-preserve` — keep the `{{field}}` placeholder even after finalization
- `finalize-clear` — clear the field at finalization if unfilled

**Examples:**
```md
{{fieldInfo BookTitle "Title of the book?" "Untitled" type="text" directives="required"}}
{{fieldInfo Genre type="singleSelect" opts="Fiction, Non-Fiction, Reference"}}
{{fieldInfo date directives="no-prompt"}}
{{fieldInfo Status "Current status?" type="singleSelect" opts="Draft, Review, Done" fallback="Draft"}}
```

`{{fieldOutput}}` (abbreviated: `{{fo}}`) is identical to `{{fieldInfo}}` but also outputs the field's value inline — useful when you want both the declaration and the rendered value in one expression. See [[fieldOutput Helper Variation]].

---

## Built-In Fields

### Date & Time

| Field | Output |
|-------|--------|
| `{{date}}` / `{{today}}` | Today (`YYYY-MM-DD`) |
| `{{yesterday}}` / `{{tomorrow}}` | Relative dates |
| `{{time}}` | Current time (`HH:mm`) |
| `{{now}}` | Full date and time (long format) |
| `{{utcTime}}` | Current time in UTC |
| `{{timestamp}}` | Zettelkasten timestamp (`YYYYMMDDHHmmss`) |
| `{{year}}` | Current year |
| `{{yearMonth}}` | `YYYY-MM` |
| `{{yearMonthName}}` | `YYYY-MM MMMM` |
| `{{yearWeek}}` | `YYYY-[w]WW` |
| `{{yearQuarter}}` | `YYYY-[Q]Q` |
| `{{dayOfWeek}}` | Day name (e.g. `Friday`) |
| `{{weekNum}}` | ISO week number |

See [[Built-In Fields - Date and Time]].

### File & Template Data

| Field | Output |
|-------|--------|
| `{{fileTitle}}` / `{{cardTitle}}` / `{{noteTitle}}` | Name of the content file being created |
| `{{creator}}` | Creator name from plugin settings |
| `{{fileCreationDate}}` | File creation date (`YYYY-MM-DD`) |
| `{{templateName}}` | Filename of the template used |
| `{{templateVersion}}` | Template version (from YAML, if defined) |
| `{{templateAuthor}}` | Template author (from YAML, if defined) |
| `{{clipboard}}` | Current system clipboard contents |
| `{{sourceText}}` | Bulk text passed in at creation time |

See [[Built-In Fields - File Data]], [[Built-In Fields - Template Data]].

---

## Built-In Helper Functions

### Formatting

| Helper | Description |
|--------|-------------|
| `{{formatDate 'FORMAT' field}}` | Formats a date with a Moment.js format string |
| `{{formatNumber 'FORMAT' field}}` | Formats a number with a Numeral.js format string |
| `{{formatNumberToFixed N field}}` | Formats a number to N decimal places |
| `{{formatString 'PREFIX{0}SUFFIX' field}}` | Wraps a field value with surrounding text |
| `{{formatStringToUpper field}}` | Converts to all caps |
| `{{formatStringToLower field}}` | Converts to all lowercase |
| `{{formatStringSlugify field}}` | Converts to a URL-friendly slug |
| `{{formatStringEncodeURI field}}` | URI-encodes a string |
| `{{formatStringEncodeBase64 field}}` | Base64-encodes a string |
| `{{formatStringSpacify field}}` | CamelCase → spaced text |
| `{{formatStringCommafy field}}` | Multi-select → comma-separated string |
| `{{formatStringTrim field}}` | Strips leading and trailing whitespace |
| `{{formatStringRaw field}}` | Outputs string without markdown character escaping |
| `{{formatStringBulletize field}}` | Converts multi-line text into a `- ` bulleted list |
| `{{formatStringFileFriendly field}}` | Strips characters invalid in filenames |

### Linking

| Helper | Description |
|--------|-------------|
| `{{wikilink field}}` | Wraps value in `[[double brackets]]` |
| `{{wikilink field 'Display Text'}}` | Wikilink with custom display name |
| `{{url field}}` | Formats value as a URL |
| `{{hashtag field}}` | Formats value as an Obsidian `#hashtag` |
| `{{google field}}` | Generates a Google search link |
| `{{wikipedia field}}` | Generates a Wikipedia search link |
| `{{chatGPT field}}` | Generates a ChatGPT link |

### Math

| Helper | Description |
|--------|-------------|
| `{{add a b}}` `{{subtract a b}}` `{{multiply a b}}` `{{divide a b}}` | Basic arithmetic |
| `{{calc 'expression'}}` | Evaluates a math expression string |
| `{{dateAdd field amount unit}}` | Adds a duration to a date field |
| `{{random arr}}` | Returns a random item from an array |

### Misc

| Helper | Description |
|--------|-------------|
| `{{eq a b}}` `{{ne a b}}` `{{lt a b}}` `{{lte a b}}` `{{gt a b}}` `{{gte a b}}` | Comparison operators for use in `{{#if}}` |
| `{{arr a b c}}` | Creates an array from arguments |
| `{{obj key=val key2=val2}}` | Creates an object from named parameters |
| `{{toNumber field}}` `{{toBool field}}` `{{toString field}}` | Type conversion |

See [[Built-In Helper Functions]] for full documentation on all helpers.

---

## YAML Configuration
Fields work inside YAML frontmatter — they are rendered through the full template pipeline:

```yaml
---
title: "{{BookTitle}}"
tags:
  - Books/{{Genre}}
created: "{{date}}"
z2k_template_type: document-template
z2k_template_suggested_title: "{{BookTitle}} - {{Author}}"
z2k_template_default_fallback_handling: finalize-clear
---
```

**Z2K-specific YAML properties:**

| Property | Description |
|----------|-------------|
| `z2k_template_type` | `document-template`, `block-template`, `wip-content-file`, `finalized-content-file` |
| `z2k_template_suggested_title` | Handlebars expression evaluated as the suggested output filename |
| `z2k_template_default_fallback_handling` | `finalize-preserve` (default) or `finalize-clear` |
| `z2k_template_version` | Version string for the template |
| `z2k_template_author` | Author of the template |

Note: Block templates (`{{> BlockName}}`) are not available inside YAML. All other helpers and fields work normally in frontmatter. See [[Z2K Templates and YAML]].

---

## Template Lifecycle
Document templates move through three stages:

1. **Template Stage** — the `.md` (or `.template`) file in a Templates folder, with unresolved `{{fields}}`
2. **WIP Stage** — a content file created from the template that still has unresolved fields ([[Deferred Field Resolution]])
3. **Finalized Stage** — all fields resolved, all template markup removed

Two transitions connect the stages:
- **[[Instantiation]]** — copies the template to a content file, runs the prompting interface, resolves available fields
- **[[Finalization]]** — resolves remaining fields via fallback rules, strips all helpers and comments

A file can skip the WIP stage by clicking **Finalize** at instantiation time, or by including `"finalize": true` in an automation call.

---

## Automation — URI, JSON, and Command Queues
All three automation systems share the same command set and data format. The difference is the transport. See [[URI, JSON, Command Queues|URI, JSON, and Command Queues]] for full documentation.

### JSON Package Format
A Z2K Templates JSON Package is a flat JSON object with two kinds of keys:
- **Directive keys** — recognized by name (case-insensitive, non-alphanumeric chars ignored); control the operation
- **Field data keys** — everything else; mapped directly to template fields (case-sensitive; must match exactly)

```json
{
  "cmd": "new",
  "templatePath": "Templates/Meeting Notes.md",
  "prompt": "none",
  "finalize": true,
  "fileTitle": "Team Standup 2024-01-15",
  "attendees": "Alice, Bob",
  "topic": "Q4 Review"
}
```

### Commands

| Command | Description |
|---------|-------------|
| `new` | Create a new note from a template |
| `continue` | Fill remaining fields in an existing WIP note |
| `upsert` | Create the note if absent; update it if present |
| `insertblock` | Insert a block template into an existing note |
| `fromJson` | Execute a full command packaged as a JSON string (URI transport only) |

### Directive Keys

| Key | Type | Commands | Description |
|-----|------|----------|-------------|
| `cmd` | string | all | **Required.** The command to execute. |
| `templatePath` | string | `new`, `upsert`, `insertblock` | Vault-relative path to the template file. |
| `templateContents` | string | `new`, `upsert`, `insertblock` | Inline template text — no file on disk needed. |
| `blockPath` | string | `insertblock` | Alias for `templatePath` for block insertion. |
| `blockContents` | string | `insertblock` | Alias for `templateContents` for block insertion. |
| `existingFilePath` | string | `continue`, `upsert`, `insertblock` | Vault-relative path to the target file. |
| `destDir` | string | `new` | Destination folder for the new file. Auto-created if absent. |
| `destHeader` | string | `insertblock` | Header to insert under. See matching rules below. |
| `fileTitle` | string | `new`, `upsert` | Output filename (without extension). Also accepted as `cardTitle`, `noteTitle`. |
| `prompt` | string | all | `"none"` — suppress all prompts; `"remaining"` — prompt only for unfilled fields; `"all"` — prompt for all, supplied values become defaults. |
| `finalize` | boolean | all | `true` resolves all remaining fields via fallback rules and marks the file finalized. |
| `location` | string or number | `insertblock` | Insert position: `"file-top"`, `"file-bottom"`, `"header-top"`, `"header-bottom"`, or a 1-based line number. |
| `fieldData` | object/string/path | all | Extra field data as an inline JSON object, inline JSON string, or vault-relative `.json` file path. |
| `fieldData64` | string | all | Base64-encoded version of `fieldData`. |
| `maxRetries` | number | all | Max retry attempts on failure. `-1` = unlimited. Queue use only. |
| `retryDelay` | string | all | Delay between retries (e.g. `"5s"`, `"1m"`). Queue use only. |

**`location` details (for `insertblock`):**
- `"header-top"` / `"header-bottom"` require `destHeader`.
- `destHeader` matches case-insensitively. Include `#` marks to match by heading level: `"## Tasks"` matches only H2; `"Tasks"` matches any level. First match wins.
- Line numbers are 1-based insertion-point positions: `1` = before line 1; `N+1` = after last line. Negative numbers count from the end (`-1` = before last line). `0` is invalid.
- If both `location` and `destHeader` are omitted, the plugin inserts at the cursor in the active editor — only meaningful for interactive use; always specify one for batch commands.

**Inline templates (`templateContents`):** Pass template text directly without a file on disk. System blocks are not applied; the Global Block still is. All field features (`{{fi}}`, helpers, prompting) work normally.

**Output filename:** Set via `fileTitle` (also `cardTitle`, `noteTitle`). If absent and `prompt` is `"none"`, the plugin falls back to `z2k_template_suggested_title` YAML, then to plugin default naming.

### JSON Package Examples

**Create a note:**
```json
{
  "cmd": "new",
  "templatePath": "Templates/Reading Note.md",
  "prompt": "none",
  "finalize": true,
  "fileTitle": "Gödel, Escher, Bach",
  "author": "Douglas Hofstadter",
  "genre": "Cognitive Science"
}
```

**Continue filling a WIP note:**
```json
{
  "cmd": "continue",
  "existingFilePath": "Notes/Meeting 2024-01-15.md",
  "prompt": "remaining",
  "actionItems": "Review Q4 metrics, assign owners"
}
```

**Insert a block template:**
```json
{
  "cmd": "insertblock",
  "blockPath": "Templates/Blocks/Task List.block",
  "existingFilePath": "Notes/Project Plan.md",
  "destHeader": "Tasks",
  "location": "header-bottom",
  "taskName": "Write tests",
  "priority": "High"
}
```

**Inline template (no file needed):**
```json
{
  "cmd": "new",
  "templateContents": "# {{Title}}\nCreated: {{date}}\n\n{{Summary}}",
  "prompt": "none",
  "finalize": true,
  "fileTitle": "Quick Note",
  "Title": "Quick Note",
  "Summary": "An inline template needs no file on disk."
}
```

**Nested field data object:**
```json
{
  "cmd": "new",
  "templatePath": "Templates/Contact Card.md",
  "prompt": "none",
  "finalize": true,
  "fileTitle": "Jane Smith",
  "fieldData": {
    "FirstName": "Jane",
    "LastName": "Smith",
    "Email": "jane@example.com"
  }
}
```

### URI Actions
Triggers commands from outside Obsidian — browser links, Apple Shortcuts, shell scripts.

**Base format:**
```
obsidian://z2k-templates?vault=<VaultName>&cmd=<command>&<directive>=<value>&<field>=<value>
```

- `vault` is processed by Obsidian before the plugin sees it — always include it for external calls.
- All directive/field pairs are URI query parameters (`&key=value`).
- Directive keys: case-insensitive. Field data keys: case-sensitive — must match template field names exactly.
- Spaces → `%20`; forward slashes in paths → `%2F`.

**Simple example:**
```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FMeeting%20Notes.md&prompt=remaining&topic=Budget
```

**Passing a full JSON Package via URI** — use `fromJson` for complex payloads:
```
obsidian://z2k-templates?vault=MyVault&cmd=fromJson&jsonData=<URL-encoded-JSON>
```
Use `jsonData64` (Base64) to avoid encoding issues with special characters:
```
obsidian://z2k-templates?vault=MyVault&cmd=fromJson&jsonData64=<base64-string>
```
Use `fieldData` / `fieldData64` to pass field data separately within any command:
```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FNote.md&prompt=none&finalize=true&fieldData64=<base64-JSON>
```

See [[URI Actions]] and [[URI Encoding]] for encoding rules and full examples.

### Command Queues
Command Queues process JSON Packages from files dropped into a watched folder. Obsidian does not need to be running when files are deposited — commands are picked up on the next scan cycle.

**How it works:**
1. Write a `.json` (single command) or `.jsonl` (one command per line) file to the queue folder
2. The plugin scans on a configurable interval (default: 60 seconds) and processes files oldest-first
3. Successful commands: file moved to `done/` subfolder
4. Failed commands: retried per `maxRetries` / `retryDelay`, then moved to `failed/`
5. Trigger an immediate scan with the **Process Command Queue Now** command

**Single command (`.json`):**
```json
{
  "cmd": "new",
  "templatePath": "Templates/Reading Note.md",
  "prompt": "none",
  "finalize": true,
  "fileTitle": "Book Title Here",
  "author": "Author Name"
}
```

**Batch commands (`.jsonl` — one JSON object per line):**
```jsonl
{"cmd": "new", "templatePath": "Templates/Reading Note.md", "prompt": "none", "finalize": true, "fileTitle": "Book One", "author": "Author One"}
{"cmd": "new", "templatePath": "Templates/Reading Note.md", "prompt": "none", "finalize": true, "fileTitle": "Book Two", "author": "Author Two"}
```

**Retry configuration:**
```json
{
  "cmd": "new",
  "templatePath": "Templates/Note.md",
  "maxRetries": 3,
  "retryDelay": "10s",
  "fileTitle": "Retryable Note"
}
```

> [!NOTE] Command Queues are disabled by default. Enable in Settings → Z2K Templates → Command Queue Settings.

**When to use Command Queues vs. URIs:**
- Use **URIs** for one-shot triggers from interactive tools (bookmarks, shortcuts, scripts that run synchronously).
- Use **Command Queues** for batch creation, scheduled jobs, NAS/cloud sync ingestion, or any scenario where Obsidian may not be running at the moment data is produced. Queues provide retry logic, ordering guarantees, and audit trails (`done/` and `failed/` folders).

See [[Command Queues Overview]] for full configuration details.

---

## Naming Conventions

| Entity | Convention | Example |
|--------|------------|---------|
| User fields | PascalCase | `{{BookTitle}}` |
| Built-in fields | camelCase | `{{dateAdd}}`, `{{yearMonth}}` |
| Helper functions | camelCase | `{{formatStringToUpper}}` |
| Document template files | `Template - <Name>.md` or `<Name>.template` | `Template - Book Review.md` |
| Block template files | `Block - <Name>.md` or `<Name>.block` | `Block - Citation.block` |
| Template folders | `Templates` (configurable) | `/Research/Templates/` |
| System block files | `.system-block.md` (hidden, dot-prefixed) | `.system-block.md` |

See [[Naming Conventions]] for full naming rules.

> [!DANGER] INTERNAL NOTES
> - Observations:
>   - This page replaces the original "Reference Manual for AI" which was an early design spec (outdated syntax, architecture notes, implementation roadmap) — none of that content is retained.
>   - The old pipe-based prompt syntax (`{{BookTitle|text|prompt|default|miss}}`) documented in the original page is no longer the current interface — `{{fieldInfo}}` replaced it. Ensure this is not referenced anywhere else in the manual.
> - Action Items:
>   - #AR/User: Review the automation section for completeness — in particular, confirm the `upsert` command behavior and any edge cases not captured here.
>   - #AR/User: Confirm whether the `fromJson` command is available via Command Queues (not just URIs). The source docs suggest it may be URI-only.
>   - #AR/AI: Verify that `\n` in JSON string values is automatically converted to newlines (as stated in the JSON Structure page). This would be important to document explicitly for AI agents constructing multi-line field values.
>   - #AR/User: Z2K System built-in fields are intentionally omitted here as they are system-specific. Add them back if this manual is used in Z2K System vaults.
> - Testing Items:
>   - #TEST/User: Verify the `templateContents` inline template behavior — specifically confirm that the Global Block is applied and System Blocks are not.
>   - #TEST/User: Verify `fieldData` as an inline JSON object (not just a file path) works via both URI and Command Queue transports.
