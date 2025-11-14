---
sidebar_position: 24
---

==Move this to a separate section (or at least part of it) so that all naming conventions are stored together==

# Template Field Naming Conventions
When using Z2K Template Fields, there are some important considerations for how to name a field
- **A Field Name must not contain any spaces**. Thus, `{{Book Title}}` will be interpreted as a field name `Title` with a [[Helper Functions Overview|Helper Function]] named `Book`, which will likely result in an error. Instead, the field should be `{{BookTitle}}`
- A general convention for field names is that [[Built-In Fields|automated fields]] begin with lowercase (e.g. `{{weekNum}}`) whereas user specified fields begin with an Uppercase letter (e.g. `{{BookAuthor}}`).
- Field names are case sensitive. Fields that only differ by case will still be treated as separate fields. So a field like `{{BookTitle}}` is a different field than `{{Booktitle}}`.

## Special Field Characters
In addition to spaces, a Z2K Template Field name cannot use any of the following characters as they represent other advanced field processing features:

| Character         | Example                                | Implied Feature                                                                                                                   |
| ----------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ` ` (space)       | `{{wikilink today}}`                   | Helper functions (see [[Built-In Helper Functions]])                                                                              |
| `:` (colon)       | `{{today:YYYY-MM-DD}}`                 | Date formatting (see [[Custom Field Formatting]])                                                                                 |
| `\|` (pipe)       | `{{Author\|text\|Who is the Author?}}` | User querying prompts (see [[Prompting]])                                                                                         |
| ! (bang)          | `{{! this is a comment}}`              | Comment Fields                                                                                                                    |
| `.` (periods)     | `{{Meals.Dinner}}`                     | JSON hierarchical data (see [[Z2K Templates, URI, and JSON]])                                                                     |
| `<` (less than)   | `{{< PartialTemplate.md}}`             | Partial templates (see [[Block Templates]])                                                                                       |
| ( ) (parenthesis) | `{{wikilink (formatdate today)}}}`     | Nested Helper Functions (see [[Built-In Helper Functions]])                                                                       |
| `~` (tilde)       | `{{~FilenameText}}`                    | External Whitespace Trimming (see [[Custom Field Formatting#Handlebars Whitespace Formatting\|Handlebars Whitespace Formatting]]) |
|                   |                                        |                                                                                                                                   |
