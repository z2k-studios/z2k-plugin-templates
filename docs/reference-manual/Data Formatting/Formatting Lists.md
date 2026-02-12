---
sidebar_position: 60
aliases:
- list formatting
- formatting lists
- multi-select formatting
- array formatting
---
# Formatting Lists
When working with multi-select fields or arrays from external data, you'll often need to convert the list into readable text. Z2K Templates provides helpers for common list rendering patterns.

## Contents
- [[#Multi-Select Field Values]]
- [[#Comma-Separated Output]]
- [[#Bulleted Lists]]
- [[#Using Iterators]]

## Multi-Select Field Values
Multi-select fields (configured with `type="multi-select"`) store an array of selected options. By default, this array renders as a comma-separated string.

```handlebars
{{field-info tags type="multi-select" options="Work,Personal,Urgent,Later"}}
Selected: {{tags}}
```

If the user selects "Work" and "Urgent", the default output is:

```md
Selected: Work,Urgent
```

## Comma-Separated Output
The [[format-string-commafy]] helper provides more control over comma-separated rendering:

```handlebars
{{format-string-commafy tags}}
```

This produces a properly formatted comma-separated list with spaces:

```md
Work, Urgent
```

### With Custom Separator
For other separators, use the [[Iterators|`{{#each}}`]] block with explicit formatting:

```handlebars
{{#each tags}}{{this}}{{#unless @last}} | {{/unless}}{{/each}}
```

Output: `Work | Urgent`

## Bulleted Lists
The [[format-string-bulletize]] helper converts array elements or multiline text into a Markdown bullet list:

```handlebars
{{format-string-bulletize tags}}
```

Output:

```md
- Work
- Urgent
```

### With Multiline Input
`format-string-bulletize` also works with multiline text strings, treating each line as a list item:

```handlebars
{{field-info notes type="textarea" prompt="Enter items (one per line)"}}
{{format-string-bulletize notes}}
```

If the user enters:

```
Item one
Item two
Item three
```

The output is:

```md
- Item one
- Item two
- Item three
```

## Using Iterators
For more control over list rendering, use the [[Iterators|`{{#each}}`]] block:

### Basic Iteration
```handlebars
{{#each tags}}
- {{this}}
{{/each}}
```

### With Index
```handlebars
{{#each priorities}}
{{@index}}. {{this}}
{{/each}}
```

Output:

```md
0. High
1. Medium
2. Low
```

### Conditional Formatting
```handlebars
{{#each tags}}
- {{#if (eq this "Urgent")}}**{{this}}**{{else}}{{this}}{{/if}}
{{/each}}
```

### Wikilinks from List Items
```handlebars
{{#each relatedNotes}}
- [[{{this}}]]
{{/each}}
```

## YAML Array Output
For frontmatter arrays, format differs from body text:

```handlebars
---
tags:
{{#each tags}}
  - {{this}}
{{/each}}
---
```

Or as an inline YAML array:

```handlebars
---
tags: [{{format-string-commafy tags}}]
---
```

## Empty List Handling
When a multi-select has no selections, or an array is empty:

```handlebars
{{#if tags}}
## Tags
{{format-string-bulletize tags}}
{{else}}
*No tags selected*
{{/if}}
```

> [!DANGER] Notes for Review
> - Verify `format-string-bulletize` handles both arrays and multiline strings as described.
> - The `eq` helper in conditional formatting may not exist – check if this is a built-in or needs documentation.
> - Test YAML inline array format with values containing commas or special characters.
