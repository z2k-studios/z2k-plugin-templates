---
sidebar_position: 11
doc_state: revised_ai_draft_2
---

# What the Plugin Does

The **Z2K Templates Plugin** automates the process of creating structured, reusable notes in Obsidian. Instead of typing boilerplate content each time, you define *templates* that contain placeholders — known as `{{fields}}` — which the plugin resolves into complete notes when executed.

Whether you’re logging a meeting, journaling, or organizing fictional characters, the plugin standardizes your structure so that every note follows the same consistent format.

When you create a new note from a template, the plugin:

1. **Parses** the template file, identifying placeholders and metadata.
2. **Prompts** you for any missing data using contextual dialogs for each [[Template Fields|field]].
3. **Resolves** your input along with [[Built-In Template Fields|built-in values]].
4. **Renders** a new file, merging YAML metadata and Markdown content into a finished document.
5. **Iterates** with the new file to continue to allow new data to be placed into fields as data becomes available.
6. **Finalize** the new document to process any unresolved fields.

This [[Lifecycle of a Template|process]] gives you automation and consistency — no scripting required.

---

## Example: From Template to Note

Below is an example showing both the source template and the rendered note.

```md
---
# YAML Text 
Title: {{BookTitle}}
Date: {{date}}
Author: {{AuthorName|text}}
Genre: {{Genre|select:Fiction,Nonfiction,Poetry}}
---

# {{BookTitle}}

{{! Handlebars comment: This is a Handlebars-style comment. It won’t appear in the final note. }}
{{! Below we use three different types of fields: }}
{{! - BookTitle is a user defined field that will be prompted to the user}}
{{! - AuthorName will also be prompted to the user and then formatted into a wikilink}}
{{! - date is a built-in field that will be automatically filled in by the plugin}}
I started reading *{{BookTitle}}* by {{wikilink AuthorName}} on {{date}}.

{{! Another comment: Below, we insert a conditional section that only renders if a review exists. }}
{{#if OneSentenceReview}}
## Review Summary
{{OneSentenceReview}}
{{/if}}
```

When executed, the plugin performs the following:

- Prompts for each missing field (e.g., **Book Title**, **Author Name**, **Genre**) using its interactive [[Prompting|prompt dialog]].
- Fills in `{{date}}` automatically from the system clock.
- Ignores all `{{! Handlebars comments}}` since they are internal documentation, not part of the rendered note.
- Resolves conditional blocks such as `{{#if Review}}...{{/if}}` only when data for that field exists.

The resulting note might look like:

```md
---
Title: The Great Gatsby
Date: 2025-10-07
Author: F. Scott Fitzgerald
Genre: Fiction
---

# The Great Gatsby

I started reading *The Great Gatsby* by [[F. Scott Fitzgerald]] on 2025-10-07.
```

---

## Why It Matters

Z2K Templates replaces repetitive typing with structured automation. Each template becomes a reusable pattern — not just for writing notes, but for thinking systematically about your data. When your notes are consistently formatted, they are more consummable and searchable. You can use it for anything that benefits from repeatable structure: book logs, project trackers, research summaries, or even chapter summaries.

Because the plugin uses [[Handlebars Support|Handlebars.js]] under the hood, you can combine readable placeholders with logic, conditionals, and loops — all while staying within Markdown.

To learn how data flows through templates and how fields are defined, continue to [[Core Concepts]] and [[Template Fields]].

---

> [!DANGER] INTERNAL NOTE
>
> - Confirm `select:` syntax is consistent with the implemented prompting directive parser.
> - Verify the conditional rendering example (`{{#if Review}}`) matches plugin’s supported subset of Handlebars.
> - Similarly, I reference "loops" and "conditionals" - make sure they actually work.
> - Review whether date format should be localized (`YYYY-MM-DD` vs user preference).
> - Consider adding a visual flow diagram later to illustrate parse → prompt → resolve → render steps.
> - Review the `|` formatting for field prompt info

