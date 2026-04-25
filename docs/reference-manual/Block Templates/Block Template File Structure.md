---
sidebar_position: 50
sidebar_label: "Block Template File Structure"
---
# Block Template File Structure

Block Templates follow a specific structure that allows them to integrate smoothly with target documents.

## Basic Structure
A block template file consists of two optional parts:

```markdown
---
# Optional YAML frontmatter
field: value
---
# Markdown content to be inserted
Your block content here...
```

## YAML Frontmatter Handling
When a block template contains YAML frontmatter, the plugin intelligently handles [[What Happens When You Insert A Block#YAML Merging]]. See the separate [[What Happens When You Insert A Block]] reference page for more details. 


## Field Prompts in Block Templates
Block Templates support the full range of field prompting features. When a block template contains fields, the user will be prompted for values just like with Document Templates.

```handlebars
---
z2k_template_type: block-template
---
## Task: {{taskName}}
- [ ] {{fieldInfo description placeholder="Describe the task..."}}
- Priority: {{fieldInfo priority type="select" options="low,medium,high"}}
- Due: {{fieldInfo dueDate type="date"}}
```

## Advanced Handlebars Features
Block Templates support all Handlebars syntax and built-in helpers available in Z2K Templates:

- **Built-in fields**: `{{date}}`, `{{time}}`, `{{clipboard}}`, etc.
- **Helper functions**: `{{formatDate}}`, `{{calc}}`, `{{#if}}`, etc.
- **Nested blocks**: `{{> another-block}}`

```handlebars
## Log Entry - {{formatDate "YYYY-MM-DD HH:mm"}}

{{#if priority}}
**Priority**: {{priority}}
{{/if}}

{{> common/tags-block}}
```

See [[Handlebars Support]] for full details on supported syntax.

## Naming Conventions
Consider using descriptive names that indicate:
- The block's purpose (`task-block`, `meeting-notes`)
- The block's scope (`common/`, `project-specific/`)

## See Also
- [[What is a Block Template]] for fundamentals
- [[Block Template Requirements]] for identification rules
- [[Handlebars Support]] for template syntax
- [[fieldInfo]] for field prompt configuration
