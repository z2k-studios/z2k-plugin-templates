---
sidebar_position: 25
aliases:
- handlebars formatting
- native formatting
---
# Native Handlebars Formatting
Before reaching for helper functions, consider what Handlebars itself provides. These formatting features are built into the template syntax and work without any additional helpers.

## Formatting Features at a Glance

| Feature | Syntax | Purpose | Details |
|---------|--------|---------|---------|
| Whitespace control | `{{~ ~}}` | Trim surrounding whitespace | [[Whitespace Control]] |
| Raw output | `{{{field}}}` | Bypass escaping | [[Unescaped Expressions]] |
| Conditional rendering | `{{#if}}` | Show content based on value | [[Conditionals]] |
| Iteration | `{{#each}}` | Loop over arrays/objects | [[Iterators]] |
| Comments | `{{! }}` | Notes that don't appear in output | [[Template Comments]] |
| Raw blocks | `{{{{raw}}}}` | Prevent template processing | [[Raw Blocks]] |

## Whitespace Control
Tildes inside expression delimiters trim whitespace on the corresponding side:

```handlebars
{{~field~}}
```

- `{{~field}}` – trims whitespace **before** the expression
- `{{field~}}` – trims whitespace **after** the expression
- `{{~field~}}` – trims **both** sides

"Whitespace" includes spaces, tabs, *==and newlines==* between the expression and the nearest non-whitespace content.

### Example
```handlebars
Header

{{~projectName~}}

Footer
```

Produces:

```md
HeaderMyProjectFooter
```

Without tildes, the blank lines would be preserved.

For complete details, see [[Whitespace Control]].

## Raw Output (Triple-Mustache)
Triple curly braces bypass Handlebars' escaping:

```handlebars
{{{htmlContent}}}
```

In Z2K Templates, this is largely redundant because HTML entities are [[Default Formatting Rules#Character Escaping and Raw Output|automatically unescaped]] for Markdown output. However, the syntax is fully supported.

Triple-mustache combines with whitespace control:

```handlebars
{{{~field~}}}
```

See [[Unescaped Expressions]] for complete details.

## Conditional Rendering
Show or hide content based on whether a field has a value:

```handlebars
{{#if dueDate}}
**Due:** {{dueDate}}
{{/if}}
```

The inverse:

```handlebars
{{#unless completed}}
Status: In Progress
{{/unless}}
```

### Example: Accounting-Style Numbers
Conditionals are useful for formatting decisions. Here, a transaction cost is displayed in accounting format – negative values wrapped in parentheses:

```handlebars
{{fieldInfo TransactionCost type="number" prompt="Transaction amount?"}}

{{#if (calc TransactionCost "<" 0)}}
({{formatNumber (calc TransactionCost "*" -1) "$0,0.00"}})
{{else}}
{{formatNumber TransactionCost "$0,0.00"}}
{{/if}}
```

If `TransactionCost` is `-1.23`, the output is `($1.23)`. If it's `42.50`, the output is `$42.50`.

Conditionals interact with Z2K's [[Deferred Field Resolution|deferred fields]] in specific ways – see [[Conditionals]] for details.

## Iteration
Loop over arrays or objects:

```handlebars
{{#each tags}}
- {{this}}
{{/each}}
```

For objects:

```handlebars
{{#each metadata}}
- {{@key}}: {{this}}
{{/each}}
```

See [[Iterators]] for complete documentation.

## Comments
Template comments don't appear in the output:

```handlebars
{{! This is a comment }}

{{!-- This is a long comment
     that spans multiple lines --}}
```

Please note that Z2K Templates removes the entire line when a comment is the only content on that line – no blank lines left behind (this is slightly different than Handlebars' design). See [[Template Comments]] for more details.

## Raw Blocks
Prevent template processing within a block:

```handlebars
{{{{raw}}}}
This {{field}} won't be processed
{{{{/raw}}}}
```

Useful for documenting template syntax within templates. See [[Raw Blocks]].

## Combining with Helper Functions
Native Handlebars features combine freely with Z2K helper functions:

```handlebars
{{~#if projectName~}}
**Project:** {{formatStringToUpper projectName}}
{{~/if~}}
```

This uses whitespace control, conditional rendering, and a string formatting helper together.

> [!DANGER] INTERNAL NOTES
> - All links point to the Handlebars Support section. Verify these pages exist and are current.
> - Consider whether context switching (`{{#with}}`) should be included here – it's listed as untested in the Handlebars docs.
