---
sidebar_position: 12 
doc_state: revised_ai_draft_1
---

# Core Concepts

Z2K Templates builds on a few foundational ideas that make templating in Obsidian structured, predictable, and human-readable. These concepts explain how data flows through the system — from how templates are defined, to where their data originates, to how they can be modular and context-aware.

---

## 1. Template Files

A **[[Template Files|template file]]** is a Markdown document (just like any other Obsidian file) that may contain both YAML frontmatter and Markdown body content. Within either section, you can include placeholders called `{{fields}}`. Each field represents a data point — text, date, number, or list — that gets resolved when you create a new file from the template, or later when you [[Lifecyle of a Template|finalize]] the file. 

Example:

```yaml title="Template - Project.md"
---
Title: {{ProjectName}}
Date: {{date}}
Status: {{Status|select:Planned,In Progress,Complete}}
---
```
```md
# {{ProjectName}}

{{! Comment: You can document your templates with comments like this directly inside them without affecting the final output. }}

Current project status: **{{Status}}**
```

> [!NOTE] 
> Every template must follow standard Markdown and YAML conventions. Invalid YAML or mismatched braces (`{{` / `}}`) will stop rendering until corrected.

---

## 2. Template Fields

A **[[Template Fields|field]]** is the heart of a template — a placeholder enclosed in double curly braces like `{{ExampleField}}`. Fields can:

- Pull in values from [[Built-In Template Fields|built-in sources]] such as `date`, `time`, `filename`, or `vault`.
- Prompt you for new data interactively via the [[Prompting|prompt dialog]].
- Receive specific input types using directives like `|text`, `|number`, or `|select`.

You can also nest fields using dot notation for structured data:

```md title="Partial Template - Person.md"
{{person.firstname}} {{person.lastname}}
```

This allows referencing subfields in JSON or YAML inputs — useful when working with external packages or [[URI and JSON Support|imported data sources]].

---

## 3. Built-In Fields and Helper Functions

Z2K Templates uses [[Handlebars Support|Handlebars.js]] internally to evaluate logic and helpers. Helpers act like small, inline functions that manipulate or format field data.

Examples:

```md title="Partial Template - Status Update.md"
Date::{{format-date date 'MMMM D, YYYY'}}
Status:: {{#if Completed}}✅{{else}}❌{{/if}}
```

You can use the plugin’s [[Built-In Helper Functions|built-in helper functions]] for formatting, linking, and raw content preservation.

> [!INFO] You don’t need to know JavaScript to use helpers — they let you apply logical behavior directly in Markdown, such as conditional visibility or formatted strings.

---

## 4. Prompting, Deferred Resolution and Miss Handling

When a field’s value can’t be resolved (for example, it isn’t provided via JSON, YAML, or a built-in), the plugin **prompts** you for input.

Example:

```md title="Template - Prompting.md"
My Location :: {{Location|text}}
My Mood     :: {{Mood|select:Happy,Neutral,Stressed}}
```

If a field remains blank, Z2K Templates follows its [[Prompting#Miss Handling|miss handling rules]] — such as clearing it, keeping the placeholder, or applying a default value.

The plugin also supports **deferred field resolution**, allowing you to create files with fields that will be filled in over time. In this state, unresolved `{{fields}}` remain visible in the note and remain being fully functional placeholders.  You can reopen the file later and use the command **[[Lifecycle of a Template|Continue filling file]]** to supply additional data when it becomes available.  

Then, when you eventually explicitly **[[Lifecycle of a Template#Finalize|finalize]]** the file, Z2K Templates will handle the remaining unresolved fields according to the configured [[Prompting#Miss Handling|miss handling rules]].

For example, consider a daily log template that includes:
```md title="Template - Daily Log.md"
Steps  :: {{StepsTaken}} 
Weight :: {{Weight}} 
Mood   :: {{Mood}}
Meals  ::
- {{Breakfast}} 
- {{Dinner}} 
```

Not all information is known at once. Deferred fields let you start your note in the morning, update it throughout the day, and finalize it only when complete. This approach keeps your workflow flexible without breaking the template’s structure or losing metadata consistency.

---

## 5. YAML Integration

Fields can also appear in YAML frontmatter. YAML allows dynamic metadata such as titles, tags, or statuses to update automatically.

Example:

```yaml title:"Template - Book Review.md"
---
Title: {{BookTitle}}
Tags: 
    - Books/{{Genre}}
StartDate: {{date}}
---
```

Z2K Templates merges YAML from multiple sources — including partials and parent templates — according to its [[YAML Integration|merge rules]]. This keeps configuration data synchronized across nested templates. Storing field data into YAML frontmatter allows you to make use of powerful tools like Obsidian Bases to organize your files and empower smart searching. 

---

## 6. Data Sources

Templates can pull data from multiple origins. Potential data sources include::

1. **User input via [[Prompting|prompting dialogs]]** — entered interactively at runtime.
2. **[[Built-In Template Fields|Built-in fields]] and [[Helper Functions|helper functions]]** — values like date, filename, or vault path, plus computed values from helper functions.
3. **Default values stored directly in the template** — specified in field syntax.
4. **Existing files** — other vault files can be read through built-in fields such as `{{SystemData}}`
5. **External URI calls** — incoming data provided through [[URI and JSON Support|URI triggers]].
6. **External JSON command lists** — batches of key/value pairs queued for import into your vault.
7. **Miss handling directives** — fallback behavior applied when all other sources fail.

---

## 7. Modular Template Organization

Large templates can be broken into smaller, reusable “partial” templates. These modular blocks let you maintain consistency across your vault without repeating code.

Example:

```md "Partials - Example.md"
{{> ContactBlock}}
```

If you edit the `ContactBlock` partial file, every template that includes it will reflect those changes instantly.

This design allows you to:

- Maintain consistent formatting across related templates.
- Create reusable “snippet libraries” for common structures.
- Reduce duplication and simplify updates.

Learn more under [[Partial Templates]].

---

## 8. Hierarchical Templates

Template availability is context-sensitive — determined by the destination file’s location within your vault. When creating a new file, Z2K Templates only lists templates found in `Templates` subfolders located along the path leading up to your vault root.

For example, creating a note under `/Projects/Work/2025/` will include templates from:

```text
/Templates/
/Projects/Templates/
/Projects/Work/Templates/
/Projects/Work/2025/Templates/
```

This **hierarchical structure** ensures that templates remain relevant to their folder context.

Additionally, by using the [[Z2K System YAML Files|System YAML feature]], you can attach YAML entries at each folder level in your vault. When a new file is created in that path, these YAML entries automatically merge into the file — providing inherited context and consistent metadata throughout your hierarchy.

---

> [!DANGER] INTERNAL NOTE
>
> - Verify directive syntax (`|select:` vs `|select=`).
> - Confirm merge precedence for YAML inheritance (child overrides parent).
> - Add visuals for data flow and hierarchical template discovery.
> - Add screenshot examples of modular and partial template use.

