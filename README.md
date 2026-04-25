> The Z2K Templates Obsidian Plugin is a powerful extension to Obsidian's native templating, enabling easy, robust, and consistent file creation for your Digital Mind.

---
## Why Z2K Templates?

Z2K Templates sits between Obsidian's Core Templates (too simple for structured workflows) and Templater (requires JavaScript). It's for users who want declarative structure and automation without code execution in their notes.

---
## Installation

- **From the Obsidian Community Plugins gallery:** *Coming soon.*
- **Via [BRAT](https://github.com/TfTHacker/obsidian42-brat):** Add `z2k-studios/z2k-plugin-templates` as a beta plugin.
- **Manual install:** Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/z2k-studios/z2k-plugin-templates/releases) and place them in `<vault>/.obsidian/plugins/z2k-plugin-templates/`.

---
## Purpose

The **Z2K Templates Plugin** supercharges Obsidian by providing an advanced templating language. Features including smart field replacement, prompting, formatting helpers, YAML integration, block templates, and URI automation.

---

## Core Features

### Template Fields (`{{FieldName}}`)
- Markdown-native placeholders for inserting data
- Two types:
  - **User Fields**: Prompted at creation
  - **Built-In Fields**: Auto-filled (e.g. `{{today}}`, `{{cardTitle}}`)

### Prompting & Input Control
- Rich inline prompt format to control typing, prompting and default answers for a field.
```md
  {{BookTitle|text|What is the book's title?|Untitled|N/A}}
```
-  Features include:
	- A User Interface that prompts the user for field entries when the template is used.
    - Default values, Prompt Expressions
    - Required fields
    - Data types: text, titleText, number, date, boolean, singleSelect, multiSelect

## Built-In Fields and Functions
- The Z2K Template Plugin provides a rich set of built-in fields and helper functions that enable automation, consistency, and semantic structure in your notes.
	- **Built-in fields** include automatically generated values such as timestamps, dates, card titles, and references to related files (e.g., today's journal or log). These fields are available out of the box and require no user input, making template-driven note creation fast and consistent.
		- `{{today}}`, `{{timestamp}}`, `{{cardTitle}}`

	- **Helper functions** transform and format data during template rendering. They support operations like string casing, date formatting, whitespace control, bulletizing multiline text, and linking fields as Obsidian wikilinks or URLs. These functions follow a Handlebars-inspired syntax and can be nested for advanced logic.
	    - `formatDate`, `formatString`, `formatStringToUpper`, `wikilink`, `url`, `formatStringRaw`

### Formatting & Helper Functions
- Built-in helpers for formatting and linking:
- Supports nested helper functions

### Block Templates
- Reusable template fragments
- Insert via `{{> blockName}}`
- Auto-merges YAML and resolves fields inline
- Directory-based resolution logic ensures the closest block is chosen

### YAML Field Integration
- Fields can be embedded directly inside YAML frontmatter:
    `card_author: "{{CardAuthor|text|Who is the author?|Unknown}}"`
- Supports System YAML files (`.z2k-system.yaml`) to apply global or scoped template yaml fields across folders

### URI + JSON API Support
- Cards can be created via Obsidian commands or via URI
- URI Example:
    `obsidian://z2k-templates?action=New&templatepath=MyTemplate&filepath=MyCard`
- Supports embedded JSON data for automation and API use

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

