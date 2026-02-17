---
sidebar_position: 20
aliases:
- default formatting
- default data formatting
---
# Default Formatting Rules
When template fields are replaced with data, Z2K Templates applies a small amount of formatting automatically. This page documents what happens by default – before any explicit helper functions are applied.

For a complete reference on all field types and their internal representations, see [[Field Types]].

## Contents
- [[#Text Fields]]
- [[#Date and Time Fields]]
- [[#Number Fields]]
- [[#Boolean Fields]]
- [[#Selection Fields]]
- [[#Filename Text Fields]]

## Text Fields

### Whitespace Preservation
All leading and trailing whitespace in text data is **preserved** by default. If you enter `"  hello world  "` into a text prompt, that's exactly what appears in the output.

To remove this whitespace, use the [[format-string-trim]] helper.

```handlebars
{{format-string-trim UserInput}}
```

> [!NOTE]
> This is different from [[Whitespace Control|Handlebars whitespace control]] with tildes (`~`), which affects whitespace in the *template text* around the `{{field}}` – not the whitespace *inside* the field value.

### Character Escaping
Standard Handlebars escapes HTML-sensitive characters (`<`, `>`, `&`, `"`, `'`, `` ` ``, `=`). Z2K Templates is designed for Markdown output, not HTML – so the plugin automatically **reverses all of this escaping** after every render pass.

The net result: **no character escaping occurs in the final output.** What goes in comes out unchanged. `{{field}}` and `{{{field}}}` produce identical results.

For the full technical details – including exactly what Handlebars escapes and how Z2K reverses it – see [[Unescaped Expressions]].

### No Markdown Escaping
Similarly, Z2K Templates does **not** escape Markdown-syntax characters. Characters like `*`, `_`, `[`, `]`, `#`, `>`, and `-` pass through unchanged. If incoming data contains Markdown formatting, that formatting will be active in the output.

For example, if a field value contains `*important*`, it will render as *important* (italic) in the final note – not as literal asterisks.

## Date and Time Fields

### Default Formats
Built-in date and time fields use these default formats:

| Field Type | Default Format | Example |
|------------|----------------|---------|
| Date fields | `YYYY-MM-DD` | 2025-01-14 |
| Time fields | `HH:mm` | 14:30 |

These defaults apply to [[Built-In Fields|automated fields]] like `{{date}}` and `{{time}}`. For user-provided date fields, the value is passed through as-is from the source data.

For more information on how to format dates, please see the [[Formatting Dates]] reference page.

## Number Fields
Numeric values are passed through without formatting by default. The number `1234.5678` renders as `1234.5678`.

To apply number formatting – thousands separators, fixed decimal places, currency symbols – use the [[format-number]] or [[format-number-to-fixed]] helpers. 

See [[Formatting Numbers]] for details.


## Boolean Fields
Boolean fields render as the literal strings `true` or `false`. No additional formatting is applied.

```handlebars
{{field-info isActive type="boolean" prompt="Is this active?"}}
Active: {{isActive}}
```

Output: `Active: true` or `Active: false`

To display something other than `true`/`false`, use a [[Conditionals|conditional]]:

```handlebars
{{#if isActive}}Active{{else}}Inactive{{/if}}
```

## Selection Fields
`singleSelect` fields render as the selected option's text value – no transformation applied.

```handlebars
{{field-info priority type="singleSelect" options="High,Medium,Low"}}
Priority: {{priority}}
```

Output: `Priority: Medium`

`multiSelect` fields produce an array. By default, the array renders as a comma-separated string without spaces:

```handlebars
{{field-info tags type="multiSelect" options="Work,Personal,Urgent,Later"}}
Tags: {{tags}}
```

Output: `Tags: Work,Urgent`

For more control over list rendering – bullets, spaced commas, iteration – see [[Formatting Lists]].

## Filename Text Fields
`filenameText` fields behave identically to `text` fields in terms of formatting. The type distinction only affects the [[Prompting Interface|prompting UI]], which restricts input to file-safe characters.

The value renders as-is with the same whitespace and escaping rules as [[#Text Fields|text fields]].


> [!DANGER] Notes for Review
> - The `format-string-escape-markdown` enhancement is tracked as GitHub issue #141 (milestone 2.0).
> - Verify that user-provided date fields truly pass through as-is vs. having any parsing applied.
