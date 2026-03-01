---
sidebar_position: 10
aliases:
- naming overview
- naming styles
- naming conventions overview
---
# Naming Conventions Overview
Z2K Templates has many moving parts – fields, helpers, template files, folders, and YAML properties – each with its own naming rules. Some are enforced by the Handlebars language (e.g. spaces in a field name will break it), others are conventions that keep your templates readable and predictable.

This page defines the naming styles used throughout the plugin and maps each context to its convention.

## Contents
- [[#Naming Styles]]
- [[#Convention Summary]]
- [[#Why Multiple Conventions?]]
- [[#User YAML Properties]]

## Naming Styles
Z2K Templates uses four naming styles. Each one has a specific purpose.

### camelCase
Starts with a lowercase letter. Each subsequent word begins with an uppercase letter. No separators. If there is only one word, then it is all lowercase.
- Examples: `sourceText`, `weekNum`, `dayOfWeek`, `formatDate`
- Used for: [[Built-In Fields]], [[Built-In Helper Functions]] 
- Origin: JavaScript function and variable naming – the native language of Handlebars. Handlebars uses single word names, all lowercase, for their built-in Helpers and Fields - thus we are maintaining consistency with Handlebars.

### PascalCase
Every word starts with an uppercase letter. No separators.
- Examples: `BookAuthor`, `ProjectName`, `CharacterAge`
- Used for: user-defined [[Template Fields Overview|template fields]] (by convention, not enforced)
- Origin: common in class names and proper-noun identifiers – here it visually distinguishes user fields from built-ins

### snake_case
All lowercase. Words separated by underscores.
- Examples: `z2k_template_type`, `z2k_template_name`, `z2k_template_version`
- Used for: Z2K YAML properties in frontmatter
- Origin: `snake_case` is widely used in configuration files – underscores avoid the quoting issues that hyphens can cause in some YAML parsers. 

## Convention Summary
The following table maps each naming context to its convention, with examples.

| What You're Naming   | Convention                                                       | Example                                                                   | Enforced?              |
| -------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------- |
| Built-in field       | camelCase                                                        | `{{date}}`, `{{time}}`, `{{sourceText}}`,  `{{weekNum}}`, `{{dayOfWeek}}` | By definition          |
| Built-in helper      | camelCase                                                        | `{{wikilink today}}`, `{{add 1 2}}`, `{{formatDate today "YYYY"}}`        | By definition          |
| User-defined field   | PascalCase                                                       | `{{BookAuthor}}`, `{{ProjectName}}`                                       | Convention only        |
| User-defined helper  | camelCase                                                        | `registerHelper('shout', ...)`                                            | Convention only        |
| Z2K YAML property    | snake_case with `z2k_` prefix                                    | `z2k_template_type`                                                       | By definition          |
| User YAML property   | snake_case or Pascal Case (See [[#User YAML Properties\|below]]) | `BookAuthor`, `project_status`                                            | Convention only        |
| Template file name   | Human-readable                                                   | `Meeting Notes.md`, `Book Review.template`                                | No restriction on case |
| Template folder name | Human-readable                                                   | `Templates`, `Project Templates`                                          | No restriction on case |

## Why Multiple Conventions?
Each convention is chosen to match the expectations of the context it appears in:
- **Fields and helpers** live inside `{{ }}` expressions – Handlebars territory. The Handlebars ecosystem uses camelCase for identifiers, so Z2K follows suit.
- **YAML properties** live in frontmatter – a configuration context. The `z2k_` prefix namespaces them away from Obsidian's own properties (`aliases`, `tags`, `cssclasses`), and snake_case avoids quoting issues that hyphens introduce in some parsers.
- **PascalCase for user fields** is a Z2K-specific convention. It creates an instant visual signal: `{{date}}` is built-in, `{{BookAuthor}}` is yours. The parser doesn't enforce this – `{{bookauthor}}` works fine – but the convention makes templates self-documenting.
- **File and folder names** are your own. No convention is enforced because these appear in Obsidian's file explorer, not inside template syntax.

## User YAML Properties
User-defined YAML properties fall into two distinct scenarios, and the right naming convention depends on which one applies.

> [!NOTE]
> Neither convention is enforced – Obsidian imposes no standard on property naming, and its own built-in properties (`aliases`, `tags`, `cssclasses`) use flat lowercase. These recommendations exist for consistency within your vault and compatibility with the Z2K plugin's field resolution mechanism.

### Standalone YAML Properties
If a property exists purely as document metadata – not tied to any template field – use **snake_case**, consistent with the Z2K YAML property convention and common YAML practice.

```yaml
---
book_status: reading
date_added: 2025-03-01
page_count: 271
---
```

### Field-Linked YAML Properties
When using the [[Storing Field Values in YAML]] pattern, a YAML property stores the value of a template field so it can be reused by [[Block Templates|block templates]] inserted later. In this case, the YAML property name **must exactly match the field name** – the plugin uses name equality to resolve the field from stored YAML.

Since user-defined fields use PascalCase, their paired YAML properties must also be PascalCase:

```yaml
---
BookTitle: "{{BookTitle}}"
BookAuthor: "{{BookAuthor}}"
Genre: "{{Genre}}"
---
```

After instantiation, `BookAuthor` in YAML and `{{BookAuthor}}` in a block template are treated as the same field. A mismatch in case – `book_author` vs. `{{BookAuthor}}` – would break the connection and cause the block to prompt the user again.


> [!DANGER] INTERNAL NOTES
> - Verify the user YAML field-linked scenario stays accurate if the field-from-YAML mechanism changes (see `addYamlFieldValues()` in the plugin source).
