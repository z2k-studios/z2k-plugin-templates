---
sidebar_position: 30
aliases:
- text formatting
- string formatting
- formatting text
- formatting strings
---
# Formatting Text
Z2K Templates provides a rich set of string formatting helpers for transforming text values. This page covers common patterns for case changes, whitespace handling, and text transformation.

## Available Helpers
![[Formatting Functions#String Formatting Helpers]]

## Contents
- [[#Case Transformations]]
- [[#Whitespace Handling]]
- [[#Embedding in Surrounding Text]]
- [[#Raw Output and Escaping]]
- [[#Reversing CamelCase]]

## Case Transformations

### To Uppercase
Convert all characters to uppercase:

```handlebars
{{formatStringToUpper projectName}}
```

`"my project"` → `"MY PROJECT"`

### To Lowercase
Convert all characters to lowercase:

```handlebars
{{formatStringToLower Status}}
```

`"IN PROGRESS"` → `"in progress"`

### Common Patterns for Case Transformations

```handlebars
{{!-- YAML tag (lowercase, no spaces) --}}
tags:
  - {{formatStringToLower (formatStringSlugify category)}}

{{!-- Shouting header --}}
# {{formatStringToUpper title}}
```

## Whitespace Handling
There are two types of whitespace to manage – whitespace *in the template* around expressions, and whitespace *inside field values*.

### Template Whitespace: Tildes
The `~` [[Whitespace Control|tilde]] character inside expression delimiters trims whitespace in the template text:

```handlebars
{{~fieldName~}}
```

- `{{~field}}` – trims whitespace **before** the expression
- `{{field~}}` – trims whitespace **after** the expression
- `{{~field~}}` – trims **both** sides

This affects the template source, not the field value. See [[Whitespace Control]] for complete details, including how whitespace is handled for [[Silent Helper Functions]].

### Value Whitespace: formatStringTrim
The [[formatStringTrim]] helper removes leading and trailing whitespace from the field value itself:

```handlebars
{{formatStringTrim userInput}}
```

`"  hello world  "` → `"hello world"`

### Understanding the Difference

```handlebars
Before
{{~formatStringTrim userInput~}}
After
```

In this example:
- The tildes collapse whitespace in the template (no blank lines around the field)
- The helper trims whitespace inside the field value

Both mechanisms can be combined as needed.

## Embedding in Surrounding Text
The [[formatString]] helper inserts a field value into a format string using `{{value}}` as a placeholder:

```handlebars
{{formatString fieldName "format string with {{value}} inside"}}
```

The key benefit: the surrounding text only appears when the field has a value. If the field is empty or missing, the entire expression produces nothing – no orphaned prefixes, suffixes, or units left behind.

### Why Not Just Type the Text Directly?
Consider a template that displays temperature data from an external source:

```handlebars
- Temperature:: {{Temperature}} degrees F
```

If no temperature is provided, the output is `- Temperature::  degrees F` – an empty value with orphaned units. Using `formatString` keeps it clean:

```handlebars
- Temperature:: {{formatString Temperature "{{value}} degrees F"}}
```

Now, if `Temperature` has no value, the entire expression is empty.

### Examples

```handlebars
{{!-- Bullet list item --}}
{{formatString PassingIdea "- {{value}}"}}

{{!-- Wrap in brackets --}}
{{formatString tagName "[{{value}}]"}}

{{!-- Create a wikilink --}}
{{formatString noteName "[[{{value}}]]"}}

{{!-- Add units --}}
{{formatString Distance "{{value}} km"}}
```

For creating Obsidian wikilinks specifically, consider the [[wikilink]] helper which handles edge cases like display text.

## Raw Output and Escaping
By default, Z2K Templates [[Default Formatting Rules#Character Escaping and Raw Output|reverses HTML entity escaping]] for Markdown compatibility. In practice, this means most text passes through unchanged.

### Explicit Raw Output
The [[formatStringRaw]] helper marks content as "safe" – it won't be processed by Handlebars' escaping:

```handlebars
{{formatStringRaw markdownContent}}
```

### When to Use It
Because Z2K Templates already handles unescaping, `formatStringRaw` is rarely needed. It's most useful when:

- Composing output inside other helpers where you want explicit control
- Working with content that might contain Handlebars-like syntax you want preserved

### Triple-Mustache Alternative
Handlebars' [[Unescaped Expressions|triple mustache]] syntax achieves the same result:

```handlebars
{{{markdownContent}}}
```

See [[Unescaped Expressions]] for complete details on escaping behavior.

## Reversing CamelCase
The [[formatStringSpacify]] helper converts collapsed or camelCase strings back to readable text:

```handlebars
{{formatStringSpacify fieldName}}
```

| Input | Output |
|-------|--------|
| `projectName` | `Project Name` |
| `lastName` | `Last Name` |
| `HTMLParser` | `HTML Parser` |
| `userID` | `User ID` |

This is particularly useful for:
- Converting field names to display labels
- Making programmatic identifiers human-readable
- Generating headings from variable names

## Common Patterns

### Conditional Text with Fallback
```handlebars
{{#if subtitle}}
## {{formatStringTrim subtitle}}
{{else}}
## Untitled Section
{{/if}}
```

### Clean User Input for Display
```handlebars
{{formatStringToUpper (formatStringTrim userInput)}}
```

### Normalized Tags
```handlebars
tags:
{{#each categories}}
  - {{formatStringToLower (formatStringTrim this)}}
{{/each}}
```

> [!DANGER] INTERNAL NOTES
> - Verify `formatStringSpacify` handles the edge cases listed (HTMLParser, userID).
> - The `formatString` examples use escaped quotes – test that these render correctly.
> - Consider adding examples for `formatStringEncodeBase64` if there are common use cases in templates.
