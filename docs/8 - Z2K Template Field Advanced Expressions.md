Z2K includes a number of special commands to highly adapt the field names to allow for greater functionality. They are:

- [[7 - Z2K Template Field Helper Functions|Helper Functions]]
- [[8a - Z2K Template Fields and Prompting|User Prompts]]
- [[8b - Z2K Template Fields and Passed JSON Data|JSON Fields]]
- [[8c - Z2K Fields and Partial Templates|Partials]] 

# Cheat Sheet on Advanced Expression Formatting
Using advanced expressions can result in complicated field entries. The following is a quick guide on what type of advanced expression is being used:

| Field Sample Format                               | Special Character  | Advanced Feature Being Used                                                                                      |
| ------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `{{helperFunction fieldname}}`                    | ` ` (space)        | [[7b - Built-In Helper Functions\|Helper Functions]]                                                             |
| `{{! this is a comment}}`                         | `!` (bang)         | Comment Fields                                                                                                   |
| `{{BookTitle\|Enter a book title\|Zarathustra`    | `\|` (pipe)        | [[8a - Z2K Template Fields and Prompting\|User Prompts]]                                                         |
| `{{Book.Title}}`                                  | `.` (period)       | [[8b - Z2K Template Fields and Passed JSON Data\|JSON hierarchical data]]                                        |
| `{{helperFunction1 (helperfunction2 fieldname)}}` | `()` (parenthesis) | [[7b - Built-In Helper Functions#Usage - Nested Helper Functions\|Nested Helper Functions]]                      |
| `{{~Foo}}`                                        | `~` (tilde)        | [[5b - Z2K Template Field Custom Formatting#Handlebars Whitespace Formatting\|Handlebars Whitespace Formatting]] |
|                                                   |                    |                                                                                                                  |
|                                                   |                    |                                                                                                                  |

