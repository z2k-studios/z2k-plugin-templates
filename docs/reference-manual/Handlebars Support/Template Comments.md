---
sidebar_position: 20
aliases:
  - template comments
  - comment
  - comments
  - Handlebars comments
  - Handlebars Comments
---
# Template Comments
Template comments let you leave notes inside a template file that never appear in the [[Finalization|finalized]] content file. They use Handlebars comment syntax – anything inside the delimiters is invisible to the rendered result. 

> [!NOTE] Different than Markdown Comments
> Markdown has its own syntax for writing comments, e.g. `%% Comment %%` . We recommend exclusively using the Handlebars comments to communicate guidance from the template to the generated files. When a content file is then [[Finalization|finalized]], these guidance comments are removed. Markdown `%%` comments, however, will persist forever until the vault owner removes them directly.


Z2K supports two forms of comment syntax: short-form and long-form.

## Short-Form Comments
The short-form comment uses `{{!` and `}}` as delimiters:

```handlebars
{{! This is a short-form comment }}
```

Short-form comments cannot contain `}}` inside the comment body – the parser treats the first `}}` it encounters as the closing delimiter.

## Long-Form Comments
The long-form comment uses `{{!--` and `--}}` as delimiters:

```handlebars
{{!-- This is a long-form comment --}}
```

Because the closing delimiter is `--}}`, you can safely include `}}` inside the comment body:

```handlebars
{{!-- This comment mentions {{fieldName}} without triggering parsing --}}
```

Use long-form comments when your note references template syntax or curly braces.

## Behavior During the Template Lifecycle
Comments behave differently depending on where you are in the [[Lifecycle of a Template|template lifecycle]]:

- **During rendering** – comments are preserved in the output. They remain in the file so you can continue to see your notes while working with a template or a work-in-progress content file.
- **During [[Finalization]]** – comments are stripped from the final output.

## Difference from Default Handlebars Behavior
Standard Handlebars removes the comment text but leaves the line itself intact, which often results in stray blank lines. Z2K Templates handles this differently.

When a comment is the only content on its line – meaning nothing but whitespace surrounds it between the preceding and following newlines – Z2K Templates removes the entire line, including the trailing line break. No blank line is left behind.

For example, given this template:

```handlebars
# {{projectName}}
{{! Reminder: projectName is prompted with a text input }}
## Tasks
```

Standard Handlebars would produce:

```md
# My Research Project

## Tasks
```

Z2K instead produces:

```md
# My Research Project
## Tasks
```

If a comment shares a line with other content, only the comment itself is removed and the rest of the line is left untouched.

## Whitespace Control with Comments
Comments also support [[Whitespace Control|whitespace control]] using tildes:

```handlebars
{{~! This trims whitespace before the comment ~}}
```

- `{{~!` removes whitespace before the comment
- `~}}` removes whitespace after the comment
- Both can be combined: `{{~! comment ~}}`

This works identically for long-form comments:

```handlebars
{{~!-- trimmed on both sides --~}}
```

## Example
Consider a template with inline notes for the template author:

```handlebars
---
tags: {{tags}}
---
{{! Reminder: projectName is prompted with a text input }}
# {{projectName}}

{{!--
  This section uses a task block partial.
  The block prompts for a task name and due date.
  See [[Block Templates]] for details on {{> syntax}}.
--}}
## Tasks
{{> task-block}}
```

After [[Finalization]], the comments and their lines disappear entirely:

```md
---
tags: research
---
# My Research Project

## Tasks
- [ ] Write outline (due: 2025-01-15)
```

> [!DANGER] Notes for Review
> - Line-aware removal logic confirmed in `z2k-template-engine/src/main.ts` lines 1333-1338. The check is: if the character before the comment start is `\n` and the character after the comment end is `\n`, the trailing newline is also consumed.
> - This same line-aware removal also applies to `{{field-info}}` / `{{fi}}` expressions, not just comments (lines 1306-1312). Consider whether to cross-reference this on the [[field-info Helper]] page.
> - Verify whether comments inside YAML frontmatter are preserved or stripped differently – the engine has special YAML handling, but comment behavior in YAML was not explicitly tested.
