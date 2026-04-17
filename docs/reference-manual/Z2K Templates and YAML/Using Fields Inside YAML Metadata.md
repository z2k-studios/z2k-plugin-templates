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
- [[#Template Pollution]]
- [[#Restrictions]]

## Why Use Fields in YAML
YAML frontmatter is where Obsidian stores metadata – tags, aliases, dates, custom properties. Being able to template this metadata is powerful:
- Automatically tag notes based on user input (`tags: [{{Category}}]`)
- Set dates, authors, or status fields dynamically
- Build aliases from the same data used in the note body
- Create consistent metadata across all notes from a given template
- [[Storing Field Values in YAML|Store]] template fields away for later use by block templates

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
  - "project-manhattan"
  - meeting
created: "1942-08-13"
attendees: "Robert, Enrico, Edward, Leo"
z2k_template_type: wip-content-file
---
# Meeting: Manhattan Project Kickoff
```

## Quoting and Type Safety
YAML has its own type system. After Handlebars renders a field expression into a string, the YAML parser re-interprets that string according to YAML rules. This creates a class of problems you won't encounter in the template body.

### Problem: Valid YAML in Templates
Consider this frontmatter:
```yaml
---
card_creation_day_of_month: {{formatDate "D"}}
---
```

This seems innocuous enough. When the template gets instantiated, the built in helper will get resolved to a date string. The problem is the template file itself is technically invalid YAML code. Given that it has a space in the expression, its type will be ambiguous. And Obsidian will (rightly) complain that your template has an invalid YAML entry.

The first attempt at a solution is to quote the string:
```yaml
---
card_creation_day_of_month: "{{formatDate "D"}}"
---
```

This fails, however, because now you have multiple uses of the quote character. The final solution is to use single quotes:

```yaml
---
card_creation_day_of_month: '{{formatDate "D"}}'
---
```


### Problem: Type Coercion
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

### Problem: Special Characters
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

### Solution: Quote Your Expressions
The general best practice is to **wrap field expressions in quotes** unless you are certain the field will always resolve to a value that is safe for unquoted YAML. Use either double or single quotes depending on whether or not the potential values will have double or single quotes within them. 

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

… but be aware that Obsidian also watches properties and can get confused if it perceives different value types being used for the same property.

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

## Template Pollution
Using Handlebar fields inside your template's YAML code will also cause a form of [[Template Pollution]], where the template's field entry will be listed along side the actual values if you are performing database operations on the YAML properties (e.g. with Bases). This pollution can proliferate if the field persists into [[WIP Stage|WIP Content Files]]. See [[Template Pollution]] for more details. 

There are two recommended ways to solve this problem:
1. Use the fieldInfo directive "[[fieldInfo directives#required|required]]" to force any fields in YAML frontmatter to be provided during instantiation. This will prevent pollution in WIP Content Files. 
2. If you wish to remove the pollution from the template files as well, you will need to use [[Template File Extensions]] which will hide template files from Obsidian's processing rules. 


## Restrictions
There are several restrictions on what you can place inside YAML frontmatter.

### No Block Templates (Partials)
Block templates (`{{> blockName}}`) are **not allowed** in YAML frontmatter. The engine explicitly excludes block recursion during YAML processing. If you need to inject YAML from another source, use [[Intro to System Blocks|System Blocks]] or [[YAML and Block Templates|block template YAML merging]] instead.

### Handlebar Block Expressions - Discouraged
Handlebars block expressions like `{{#if}}`, `{{#each}}`, and `{{#with}}` are not explicitly prevented in YAML, but they are **strongly discouraged**. 

These expressions would need to produce syntactically valid YAML – including correct indentation, colons, and list markers – which is extremely fragile. A small change to the template data could break the YAML structure entirely. 

You could use the conditional inside a single string on a single and it "should" work. 

If you need conditional metadata, consider using [[fieldInfo fallback|fallback values]] or [[fieldInfo directives|directives]] instead.

### HTML Entity Handling
Handlebars normally escapes special characters as HTML entities (e.g., `'` becomes `&#x27;`). The engine automatically unescapes the standard entities (`&#x27;`, `&quot;`, `&lt;`, `&gt;`, `&amp;`) after rendering YAML. However, if you use triple-brace expressions (`{{{field}}}`) to bypass Handlebars escaping, be aware that raw output may contain characters that conflict with YAML syntax.
===I think that the way Z2K Templates handles [[Unescaped Expressions|escaping]] that this whole paragraph is incorrect and can be removed===


> [!DANGER] INTERNAL NOTES
> - The code comment at engine line 716 reads "DOCS: No blocks allowed in YAML frontmatter" – this is the explicit design intent.
> 	- But does it actually restrict it?
> - `preserveExpressionsPreprocess()` uses a `y` prefix for YAML placeholders vs `b` for body, confirming YAML is processed through a separate path.
> - Verify whether Handlebars helper functions (e.g., `{{uppercase Name}}`) work correctly inside YAML – the code suggests they should, but edge cases with quoting may exist.
> - The HTML entity unescaping only handles five standard entities. Non-standard entities in field values could produce unexpected YAML.
