> The Z2K Templates Obsidian Plugin is a powerful extension to Obsidian's native templating, enabling easy, robust, and consistent file creation for your Digital Mind.

---
## Why Z2K Templates?

Core Templates is great for static snippets. Templater is great when you want full JavaScript. Z2K Templates is for when you want declarative structure — fields with types, prompts, and YAML inheritance — without writing code.

---
## Installation

- **Via [BRAT](https://github.com/TfTHacker/obsidian42-brat):** Add `z2k-studios/z2k-plugin-templates` as a beta plugin.
- **Manual install:** Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/z2k-studios/z2k-plugin-templates/releases) and place them in `<vault>/.obsidian/plugins/z2k-plugin-templates/`.

---
## Getting started

A three-step walkthrough to create your first templated note.

**1. Set your templates folder.** Open **Settings → Z2K Templates** and set "Templates root folder" (or leave blank to use the vault root). Inside that folder, create a subfolder called `Templates` — this is where the plugin looks for template files.

**2. Add a template file.** Create a markdown file in your `Templates` folder. Use `{{FieldName}}` to mark anywhere you want the user to be prompted — that's all you need for a basic template. Save the following as `Daily Log.md`:

````markdown
---
type: daily-log
date: {{date}}
---

# Daily Log — {{date}}

## Intention for today
{{Intention}}

## Notes
{{Notes}}
````

**3. Run the command.** Open the command palette (`Ctrl+P` / `Cmd+P`) and run **Z2K Templates: Create new file from template**, or click the file-plus icon in the left ribbon. Pick `Daily Log`, fill in the prompts for `Intention` and `Notes`, and the plugin creates your note with `{{date}}` replaced by today's date.

That's the minimum. To control prompt text, default values, field types, and dropdown options, add `{{fieldInfo}}` (or its short form `{{fi}}`) helpers — see the Core Features section below.

Once the basics work, explore [the docs](https://z2k-studios.github.io/z2k-plugin-templates-docs/) for the full feature set: block templates, hierarchical YAML, URI automation, and more.

---
## Purpose

The **Z2K Templates Plugin** supercharges Obsidian by providing an advanced templating language. Features include smart field replacement, prompting, formatting helpers, YAML integration, block templates, and URI automation.

---

## Core Features

### Template Fields (`{{FieldName}}`)
- Markdown-native placeholders for inserting data
- Two types:
  - **User Fields**: Prompted at creation
  - **Built-In Fields**: Auto-filled (e.g. `{{today}}`, `{{cardTitle}}`)

### Prompting & Input Control

The `{{fieldInfo}}` helper (short form: `{{fi}}`) attaches metadata to a field — prompt text, type, defaults, options, validation. It's silent (produces no output), so place it anywhere in the template. Use `{{fieldOutput}}` (`{{fo}}`) instead when you want the field's value rendered inline at the same spot.

```md
{{fi BookTitle "Title of the book?" directives="required"}}
{{fi Genre type="singleSelect" opts="Fiction, Non-Fiction, Reference" fallback="Fiction"}}
{{fi Rating "Rating out of 5?" type="number"}}
```

Features:

- A prompting UI driven by the `{{fi}}` declarations
- Default values, suggested values, fallback values
- Required fields
- Field types: `text`, `titleText`, `number`, `date`, `datetime`, `boolean`, `singleSelect`, `multiSelect`

### Built-In Fields and Functions
- **Built-in fields** are auto-populated values that require no user input — timestamps, dates, card titles, references to related files (e.g., today's journal or log).
	- `{{today}}`, `{{timestamp}}`, `{{cardTitle}}`
- **Helper functions** transform and format data during rendering: string casing, date formatting, whitespace control, bulletizing multiline text, and linking fields as wikilinks or URLs. Helpers follow Handlebars syntax and can be nested.
	- `formatDate`, `formatString`, `formatStringToUpper`, `wikilink`, `url`, `formatStringRaw`

### Block Templates
- Reusable template fragments
- Insert via `{{> blockName}}`
- Auto-merges YAML and resolves fields inline
- Directory-based resolution logic ensures the closest block is chosen

### YAML Field Integration

Fields and `{{fieldInfo}}` declarations work directly inside YAML frontmatter:

```yaml
---
title: "{{BookTitle}}"
author: "{{fo AuthorName 'Who is the author?' fallback='Unknown'}}"
date: "{{date}}"
genre: "{{fo Genre type='singleSelect' opts='Fiction, Non-Fiction, Reference'}}"
---
```

Also supports System YAML files (`.z2k-system.yaml`) to apply global or scoped template YAML across folders.

### URI + JSON API Support
- Notes can be created via Obsidian commands or via URI
- URI example:
    `obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates/Daily%20Log.md&fileTitle=My%20Daily%20Log`
- Supports embedded JSON data for automation and API use, plus a Command Queue for batch / offline ingestion

---
## Why It Matters
- **Consistency**: Enforces uniform structure across notes
- **Composable**: Modular design through blocks and YAML inheritance

---
## Use Cases
- Daily logs and journals
- Book and media summaries
- Meetings and interaction notes
- Health, habit, and emotion tracking
- Structured thinking and belief systems

