---
sidebar_position: 10
aliases:
- Using Fields in YAML
- Fields Inside YAML
- Fields in YAML Metadata
---
# Using Fields Inside YAML Metadata
Z2K Templates lets you place `{{field}}` expressions directly inside your YAML frontmatter. When a template is instantiated, those expressions resolve to their values – just like fields in the body. This means your metadata isn't static boilerplate; it's built dynamically from the same data the user provides for the rest of the note.

## Contents
- [[#Why Use Fields in YAML]]
- [[#How It Works]]
- [[#Quoting and Type Safety]]
- [[#Restrictions]]

## Why Use Fields in YAML
YAML frontmatter is where Obsidian stores metadata – tags, aliases, dates, custom properties. Being able to template this metadata is powerful:
- Automatically tag notes based on user input (`tags: [{{Category}}]`)
- Set dates, authors, or status fields dynamically
- Build aliases from the same data used in the note body
- Create consistent metadata across all notes from a given template

Without this feature, your YAML frontmatter would be identical in every note created from a template. With it, every note gets metadata tailored to its content.

## How It Works
The engine processes YAML frontmatter through the same Handlebars rendering pipeline as the template body. After all field values are collected (from prompting, YAML properties, built-ins, and other [[Field Data Sources|data sources]]), the engine compiles the YAML as a Handlebars template and renders it with the resolved values.

Any `{{field}}` expression that cannot be resolved is preserved as-is in the output – the same behavior as unresolved fields in the body (see [[Deferred Field Resolution]]).

### Basic Example
A template with this frontmatter:

```yaml
---
tags:
  - "{{Category}}"
  - meeting
created: "{{date}}"
attendees: "{{Attendees}}"
z2k_template_type: document-template
---
# Meeting: {{Title}}
```

After the user provides values for `Category`, `Attendees`, and `Title`, the instantiated file might look like:

```yaml
---
tags:
  - "project-alpha"
  - meeting
created: "2025-06-15"
attendees: "Alice, Bob, Charlie"
z2k_template_type: wip-content-file
---
# Meeting: Project Alpha Kickoff
```

## Quoting and Type Safety
YAML has its own type system. After Handlebars renders a field expression into a string, the YAML parser re-interprets that string according to YAML rules. This creates a class of problems you won't encounter in the template body.

### The Problem: Type Coercion
Consider this frontmatter:

```yaml
---
published: {{isPublished}}
count: {{numItems}}
status: {{currentStatus}}
---
```

If `isPublished` resolves to `true`, the YAML parser sees `published: true` and interprets it as **boolean** `true` – not the string `"true"`. Similarly, `numItems` resolving to `42` becomes **number** `42`, and `currentStatus` resolving to `null` becomes **YAML null**.

This may be exactly what you want – or it may cause unexpected behavior downstream if a plugin or query expects a string.

### The Problem: Special Characters
YAML assigns special meaning to characters like `:`, `#`, `&`, `*`, `|`, `>`, and `!`. If a field value contains these characters in an unquoted context, the YAML parser may misinterpret or reject the result.

For example:

```yaml
---
title: {{BookTitle}}
---
```

If `BookTitle` resolves to `The Best: A Story`, the output is:

```yaml
---
title: The Best: A Story
---
```

The YAML parser sees the second colon as a key-value separator and the parse fails.

### The Solution: Quote Your Expressions
The general best practice is to **wrap field expressions in double quotes** unless you are certain the field will always resolve to a value that is safe for unquoted YAML:

```yaml
---
title: "{{BookTitle}}"
published: "{{isPublished}}"
count: "{{numItems}}"
---
```

With quotes, the YAML parser always treats the result as a string – no type coercion, no special-character conflicts.

### When Unquoted Is Safe
You can safely omit quotes when:
- The field resolves to a simple alphanumeric value with no special characters (e.g., a single word like `draft` or `active`)
- You *want* YAML type coercion – for example, you intentionally want `true` to be boolean because a Dataview query expects it

### Summary

| Scenario | Quoted | Unquoted |
| -------- | ------ | -------- |
| Value is `The Best: A Story` | `"The Best: A Story"` (safe) | `The Best: A Story` (YAML parse error) |
| Value is `true` | `"true"` (string) | `true` (boolean) |
| Value is `42` | `"42"` (string) | `42` (number) |
| Value is `null` | `"null"` (string) | (YAML null – property removed) |
| Value is `simple-word` | `"simple-word"` (string) | `simple-word` (string – safe either way) |

> [!WARNING] When In Doubt, Use Quotes
> Unless you have a specific reason to leave a field expression unquoted, wrap it in double quotes. The cost is minimal (values become strings), and it prevents an entire category of hard-to-debug YAML parsing failures.

## Restrictions
There are several restrictions on what you can place inside YAML frontmatter.

### No Block Template Partials
Block template partials (`{{> blockName}}`) are **not allowed** in YAML frontmatter. The engine explicitly excludes block recursion during YAML processing. If you need to inject YAML from another source, use [[Intro to System Blocks|System Blocks]] or [[YAML and Block Templates|block template YAML merging]] instead.

> [!WARNING] Block Expressions Are Strongly Discouraged
> Handlebars block expressions like `{{#if}}`, `{{#each}}`, and `{{#with}}` are not explicitly prevented in YAML, but they are **strongly discouraged**. These expressions would need to produce syntactically valid YAML – including correct indentation, colons, and list markers – which is extremely fragile. A small change to the template data could break the YAML structure entirely. If you need conditional metadata, consider using [[field-info fallback|fallback values]] or [[field-info directives|directives]] instead.

### HTML Entity Handling
Handlebars normally escapes special characters as HTML entities (e.g., `'` becomes `&#x27;`). The engine automatically unescapes the standard entities (`&#x27;`, `&quot;`, `&lt;`, `&gt;`, `&amp;`) after rendering YAML. However, if you use triple-brace expressions (`{{{field}}}`) to bypass Handlebars escaping, be aware that raw output may contain characters that conflict with YAML syntax.

### Undefined Fields Are Preserved
If a field in your YAML has no resolved value, the expression is preserved as literal text. For example, `title: "{{ProjectName}}"` stays as `title: "{{ProjectName}}"` if `ProjectName` is not provided. This allows [[Deferred Field Resolution]] – the field can be filled in later via [[Continue filling note]].

> [!DANGER] Notes
> - The code comment at engine line 716 reads "DOCS: No blocks allowed in YAML frontmatter" – this is the explicit design intent.
> - `preserveExpressionsPreprocess()` uses a `y` prefix for YAML placeholders vs `b` for body, confirming YAML is processed through a separate path.
> - Verify whether Handlebars helper functions (e.g., `{{uppercase Name}}`) work correctly inside YAML – the code suggests they should, but edge cases with quoting may exist.
> - The HTML entity unescaping only handles five standard entities. Non-standard entities in field values could produce unexpected YAML.
