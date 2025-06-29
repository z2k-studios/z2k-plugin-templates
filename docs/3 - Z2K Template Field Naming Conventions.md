
# Template Field Naming Conventions
When using Z2K Template Fields, there are some important considerations for how to name a field
- **A Field Name must not contain any spaces**. Thus, `{{Book Title}}` will be interpreted as a field name `Title` with a "helper" function named `Book`, which will likely result in an error. Instead, the field should be `{{BookTitle}}`
- A general convention for field names is that [[4 - Z2K Built-In Template Fields|automated fields]] begin with lowercase (e.g. `{{weekNum}}`) whereas user specified fields begin with an Uppercase letter (e.g. `{{BookAuthor}}`)
- Field names are case sensitive. Fields that only differ by case will still be treated as separate fields. So a field like `{{BookTitle}}` is a different field than `{{Booktitle}}`.

## Special Field Characters
In addition to spaces, a Z2K Template Field name cannot use any of the following characters as they represent other advanced field processing features:

| Character         | Example                                | Implied Feature                                                                                                                                     |
| ----------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| ` ` (space)       | `{{wikilink today}}`                   | Helper functions (see [[7b - Built-In Helper Functions]])                                                                                           |
| @ (at sign)       | `{{@preserve Field}}`                  | Prompting Directives (see [[5c - Z2K Template Fields and Prompting#Built-in Prompting Directives]])                                                 |
| `:` (colon)       | `{{today:YYYY-MM-DD}}`                 | Date formatting (see [[5b - Z2K Template Field Custom Formatting]])                                                                                 |
| `\|` (pipe)       | `{{Author\|text\|Who is the Author?}}` | User querying prompts (see [[5c - Z2K Template Fields and Prompting]])                                                                              |
| ! (bang)          | `{{! this is a comment}}`              | Comment Fields                                                                                                                                      |
| `.` (periods)     | `{{Meals.Dinner}}`                     | JSON hierarchical data (see [[11 - Z2K Templates, URI, and JSON]])                                                                                  |
| `<` (less than)   | `{{< PartialTemplate.md}}`             | Partial templates (see [[8 - Z2K Partial Templates]])                                                                                               |
| ( ) (parenthesis) | `{{wikilink (formatdate today)}}}`     | Nested Helper Functions (see [[7b - Built-In Helper Functions]])                                                                                    |
| `~` (tilde)       | `{{~FilenameText}}`                    | External Whitespace Trimming (see [[5b - Z2K Template Field Custom Formatting#Handlebars Whitespace Formatting\|Handlebars Whitespace Formatting]]) |
