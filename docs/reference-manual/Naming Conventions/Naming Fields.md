---
sidebar_position: 20
aliases:
- naming fields
- field naming conventions
- field naming
---
# Field Naming Conventions
Every [[Template Fields Overview|template field]] has a name – the identifier between the `{{ }}` braces. That name determines how the field is resolved, how it appears in the [[Prompting Interface|prompting UI]], and whether it collides with a [[Built-In Helper Functions|helper function]]. Choosing names carefully avoids all three problems.

## Contents
- [[#Naming Requirements]]
- [[#Built-In vs. User-Defined Fields]]
- [[#Special Field Characters]]
- [[#Display Labels in the Prompting UI]]

## Naming Requirements
Two hard rules govern field names:
- **No spaces.** A space inside `{{ }}` tells the parser that a [[Helper Functions Overview|helper function]] is being called. `{{Book Title}}` does not create a field called "Book Title" – it calls a helper named `Book` with parameter `Title`, which almost certainly produces an error. Use `{{BookTitle}}` instead.
- **Case-sensitive.** Fields that differ only in case are treated as separate fields. `{{BookTitle}}` and `{{Booktitle}}` will prompt the user twice for two different values.

Beyond these two rules, any Unicode characters are valid in a field name – with the exceptions listed in [[#Special Field Characters]] below.

## Built-In vs. User-Defined Fields
Z2K Templates defines two categories of fields, each with a recommended naming style:

| Category | Convention | Examples |
|---|---|---|
| [[Built-In Fields]] | camelCase (lowercase start) | `{{date}}`, `{{sourceText}}`, `{{weekNum}}`, `{{fileTitle}}` |
| User-defined fields | PascalCase (uppercase start) | `{{BookAuthor}}`, `{{ProjectName}}`, `{{MeetingDate}}` |

**Why the distinction matters.** When you scan a template, the case of the first letter tells you immediately whether a field is auto-populated by the plugin or will require user input:

```md
---
author: {{creator}}
title: {{BookTitle}}
date: {{date}}
---
# {{BookTitle}} — Review by {{creator}}
Rating: {{Rating}}
```

In this template, `creator` and `date` resolve automatically. `BookTitle` and `Rating` will prompt the user. The casing makes this visible at a glance.

> [!NOTE]
> PascalCase for user fields is a **convention, not a requirement**. The parser does not enforce it – `{{booktitle}}` works identically to `{{BookTitle}}`. But mixing styles makes templates harder to read, and a lowercase user field risks colliding with a current or future built-in field name.

## Special Field Characters
Certain characters inside `{{ }}` trigger special parsing behavior. Using them in a field name will not produce the field you expect – the parser will interpret them as syntax.

| Character | Example | What It Triggers |
|---|---|---|
| ` ` (space) | `{{wikilink today}}` | [[Helper Functions Overview\|Helper function]] call |
| `\|` (pipe) | `{{Author\|text\|Who is the Author?}}` | Inline [[Prompting\|prompting syntax]] |
| `!` (bang) | `{{! this is a comment}}` | [[Template Comments\|Comment]] – entire expression is ignored |
| `.` (period) | `{{Meals.Dinner}}` | Hierarchical JSON data path |
| `<` (less than) | `{{< BlockTemplate.md}}` | [[Block Templates\|Block template]] insertion |
| `( )` (parentheses) | `{{wikilink (formatdate today)}}` | [[Using Nested Helper Functions\|Nested helper]] evaluation |
| `~` (tilde) | `{{~FilenameText}}` | [[Whitespace Control\|Whitespace trimming]] |

If you need a field name that resembles any of these patterns, restructure the name. For example, use `{{DinnerMeal}}` instead of attempting `{{Dinner.Meal}}`.

## Display Labels in the Prompting UI
When Z2K Templates prompts a user for a field value, it converts the field name into a human-readable label (unless a specific [[fieldInfo prompt|prompt]] has been specified). The conversion logic splits camelCase and PascalCase into separate words with spaces:

| Field Name   | Display Label |
| ------------ | ------------- |
| `BookTitle`  | Book Title    |
| `parseXML`   | Parse XML     |
| `fieldName`  | Field Name    |
| `HTTPServer` | HTTP Server   |
| `sourceText` | Source Text   |

The algorithm:
- Capitalizes the first letter
- Inserts a space before each uppercase letter that follows a lowercase letter or digit (`parseXML` → `Parse XML`)
- Inserts a space between consecutive uppercase letters when followed by a lowercase letter (`HTTPServer` → `HTTP Server`)

This means well-formed camelCase and PascalCase names produce clean, readable prompts with no extra configuration. Irregular casing (e.g., `BOOKTITLE`) produces less readable labels (`BOOKTITLE` stays as-is) thus, another reason to follow the convention.

> [!INFO]
> You can override the display label entirely using the [[fieldInfo prompt|prompt]] parameter of `{{fieldInfo}}`. For example, `{{fieldInfo BookTitle prompt="What is the book's title?"}}` replaces the auto-generated label with your custom text.

> [!DANGER] INTERNAL NOTES
> - The `formatFieldName` function is defined in `main.tsx` (~line 3895). Verify the algorithm description stays accurate if the implementation changes.
> - The Special Field Characters table should stay synchronized with [[Field Syntax]] and any future parser changes.
> - The Naming Fields page in section 5 ([[Template Fields]]) links here via `[[Naming Fields]]`. Ensure both pages stay consistent – this page is the canonical reference for field naming; the section 5 page covers field syntax more broadly.
