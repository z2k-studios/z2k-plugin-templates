---
sidebar_position: 30
aliases:
- unescaped expressions
- escaping
- raw expressions
- triple mustache
---
# Unescaped Expressions
Handlebars was designed for HTML output, so it escapes characters that have syntactic meaning in HTML. Z2K Templates outputs Markdown, not HTML – so this default behavior would corrupt your content. This page explains how Z2K Templates handles escaping differently and what that means for your templates.

## Contents
- [[#How Standard Handlebars Escaping Works]]
- [[#How Z2K Templates Handles Escaping]]
- [[#Triple-Mustache Syntax]]
- [[#The formatStringRaw Helper]]
- [[#No Markdown Escaping]]
- [[#When Escaping Still Matters]]

## How Standard Handlebars Escaping Works
In standard Handlebars, double-mustache expressions (`{{field}}`) escape seven HTML-sensitive characters:

| Character | Escaped To | HTML Purpose |
|-----------|-----------|--------------|
| `&` | `&amp;` | Entity prefix |
| `<` | `&lt;` | Tag open |
| `>` | `&gt;` | Tag close |
| `"` | `&quot;` | Attribute delimiter |
| `'` | `&#x27;` | Attribute delimiter |
| `` ` `` | `&#x60;` | Template literal (XSS vector) |
| `=` | `&#x3D;` | Attribute assignment |

This is standard XSS prevention for web applications. In Markdown, these characters are just text – escaping them produces visible garbage like `&amp;` in your notes.

## How Z2K Templates Handles Escaping
Z2K Templates automatically reverses Handlebars' HTML entity escaping after every render pass. The unescaping covers three categories:
- **Hex entities** – `&#xNN;` (catches `&#x27;` for `'`, `&#x60;` for `` ` ``, `&#x3D;` for `=`, and any others)
- **Decimal entities** – `&#NN;` (e.g., `&#39;` for `'`)
- **Named entities** – `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`

All seven of Handlebars' escapes are fully reversed. The net result: **no character escaping occurs in the final output.** `{{variable}}` and `{{{variable}}}` produce identical results.

A field value containing `Tom & Jerry's "Adventure"` renders as exactly that, without entity encoding.

> [!INFO]
> This unescaping is applied to all rendered output – template body, YAML frontmatter, and single-expression evaluations. It is not selective.

## Triple-Mustache Syntax
Handlebars' triple-mustache syntax `{{{variable}}}` tells the engine to skip escaping entirely:

```handlebars
{{{htmlContent}}}
```

In Z2K Templates, because HTML entities are unescaped automatically anyway, triple-mustache is rarely necessary. However, it remains available and functions correctly – it simply skips the escaping step that Z2K Templates would reverse regardless.

## The formatStringRaw Helper
The `formatStringRaw` [[Helper Functions|helper]] provides an alternative way to output a value without escaping:

```handlebars
{{formatStringRaw fieldName}}
```

This wraps the value in a Handlebars `SafeString`, which tells Handlebars to leave it untouched. Like triple-mustache, this is redundant in Z2K Templates due to the automatic unescaping – but it can be useful when composing output inside other helpers where you want to be explicit about intent.

## No Markdown Escaping
Z2K Templates reverses Handlebars' HTML escaping, but it does **not** perform any Markdown-specific escaping. Characters that have syntactic meaning in Markdown pass through unchanged:

| Character | Markdown Meaning |
|-----------|-----------------|
| `*` / `_` | Bold / italic |
| `[` / `]` | Links |
| `#` | Headings |
| `>` | Blockquotes |
| `` ` `` | Inline code |
| `-` | List items |
| `~` | Strikethrough |
| `\|` | Tables |

If a field value contains `*important*`, it will render as *important* (italic) in the final note – not as literal asterisks. This is usually the desired behavior, since data flowing into Markdown notes should participate in Markdown formatting.

==There is currently no built-in helper to escape Markdown syntax.== If you need to prevent Markdown interpretation of incoming data, you can [[Writing Custom Formatting Functions|write a custom helper]] to backslash-escape these characters.

## When Escaping Still Matters
Because Z2K Templates reverses all HTML entity escaping, there is currently no built-in way to preserve HTML entities in your output. If you genuinely need `&amp;` to appear as literal text in a rendered note, it will be converted back to `&`.

> [!WARNING]
> If your template output is later processed by an HTML renderer (for example, through Docusaurus or a publish pipeline), be aware that raw `<` and `>` characters in your Markdown may be interpreted as HTML tags. In these cases, you may need to handle escaping at the publishing layer rather than in the template.




> [!DANGER] Notes for Review
> - ==Needs testing==: Confirm that all 7 Handlebars escapes are fully reversed in actual template output. Code analysis of `unescapeMostHtmlEntities()` (in `z2k-template-engine/src/main.ts`) shows they should be.
> - ==Needs testing==: Verify that `{{field}}` and `{{{field}}}` produce truly identical output in all cases.
> - Triple-mustache is listed as "untested" on the [[Handlebars and Z2K Templates]] overview page. If confirmed accurate here, that entry should be moved to the supported list.
> - There may be edge cases where the order of operations matters – e.g., if a helper intentionally produces HTML entities that should survive rendering. No such case was found in the built-in helpers.
> - A `formatString-escape-markdown` helper has been requested as an enhancement (GitHub issue #141, milestone 2.0).
