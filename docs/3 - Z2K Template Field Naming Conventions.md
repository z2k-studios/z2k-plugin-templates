
# Template Field Naming Conventions
When using Z2K Template Fields, there are some important considerations for how to name a field
- **A Field Name must not contain any spaces**. Thus, `{{Book Title}}` will be interpreted as a field name `Title` with a "helper" function named `Book`, which will likely result in an error. Instead, the field should be `{{BookTitle}}`
- A general convention for field names is that [[4 - Z2K Built-In Template Fields|automated fields]] begin with lowercase (e.g. `{{weekNum}}`) whereas user specified fields begin with an Uppercase letter (e.g. `{{BookAuthor}}`)
- Field names are case sensitive. Fields that only differ by case will still be treated as separate fields. So a field like `{{BookTitle}}` is a different field than `{{Booktitle}}`.

## Special Field Characters
In addition to spaces, a Z2K Template Field name cannot use any of the following characters as they represent other [[8 - Z2K Template Field Advanced Expressions|advanced field processing features]]:

| Character         | Example                | Implied Feature                                                                                                                                     |
| ----------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| ` ` (space)       | {{Book Title}}         | Helper functions (see [[7b - Built-In Helper Functions]])                                                                                           |
| `:` (colon)       | {{Mission:Impossible}} | Date formatting (see [[5b - Z2K Template Field Custom Formatting]])                                                                                 |
| `\|` (pipe)       | {{Author\|Artist}}     | User querying prompts (see [[8a - Z2K Template Fields and Prompting]])                                                                              |
| `.` (periods)     | {{Mr.Bean}}            | JSON hierarchical data (see [[8b - Z2K Template Fields and Passed JSON Data]])                                                                      |
| `<` (less than)   | {{Book<Title}}         | Partial templates (see [[8c - Z2K Fields and Partial Templates]])                                                                                   |
| ( ) (parenthesis) | {{Message(s)}}}        | Nested Helper Functions (see [[7b - Built-In Helper Functions]])                                                                                    |
| `~` (tilde)       | {{Tilde~}}             | External Whitespace Trimming (see [[5b - Z2K Template Field Custom Formatting#Handlebars Whitespace Formatting\|Handlebars Whitespace Formatting]]) |
