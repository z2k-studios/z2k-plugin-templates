---
sidebar_position: 10
sidebar_label: "What is a Block Template?"
---
# What is a Block Template?
A **Block Template** is a reusable fragment of markdown. Unlike [[Types of Template Files#Document Templates|Document Templates]] which create new files, Block Templates are:

- Inserted into an existing document (content files or other template files)
- Collections of new content to be inserted, including new fields and helper functions to resolve
- Used to build modular, composable templates

Block Templates are typically small, structured units such as:

- A checklist block
- A project metadata block
- A quote or highlight block
- A standard header/footer snippet

## Example Block Template

Here's a simple block template for adding a task:

```md
## Task
- [ ] {{taskName}}
- Priority: {{priority}}
```

This block can be inserted into any document, and the user will be prompted for `taskName` and `priority` values.

## Block Templates vs Document Templates

| Aspect | Document Template | Block Template |
| ------ | ----------------- | -------------- |
| Creates new file | Yes | No |
| Inserted into existing file | No | Yes |
| Can include YAML frontmatter | Yes | Yes (merged into target) |
| Supports field prompts | Yes | Yes |
| Supports Handlebars syntax | Yes | Yes |

## Interoperability Note
Block Templates are synonymous with what Handlebars refer to as "Partials". Z2K Templates uses the "Blocks" terminology as it is more consistent and commonly understood.

## See Also
- [[Why Use Block Templates]] for use cases
- [[How Do You Use Block Templates]] for insertion methods
- [[Block Template Requirements]] for identification rules
