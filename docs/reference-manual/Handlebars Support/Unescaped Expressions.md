---
sidebar_position: 30
aliases:
- unescaped expressions
- escaping
- raw expressions
- triple mustache
---
# Unescaped Expressions
Handlebars was designed for HTML output, so it escapes characters like `<`, `>`, `&`, `"`, and `'` by default. Z2K Templates outputs Markdown, not HTML – so this default behavior would corrupt your content. This page explains how Z2K Templates handles escaping differently and what that means for your templates.

## Contents
- [[#How Standard Handlebars Escaping Works]]
- [[#How Z2K Templates Handles Escaping]]
- [[#Triple-Mustache Syntax]]
- [[#The format-string-raw Helper]]
- [[#When Escaping Still Matters]]

## How Standard Handlebars Escaping Works
In standard Handlebars, double-mustache expressions escape HTML-sensitive characters:

| Character | Escaped To |
|-----------|-----------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#x27;` |

This is useful when generating HTML, where these characters have syntactic meaning. In Markdown, these characters are just text – escaping them produces visible garbage like `&amp;` in your notes.

## How Z2K Templates Handles Escaping
Z2K Templates automatically reverses Handlebars' HTML entity escaping after every render pass. All HTML entities – including hex (`&#x27;`), decimal (`&#39;`), and named (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`) – are converted back to their original characters.

This means that in practice, `{{variable}}` and `{{{variable}}}` produce the same output for most content. A field value containing `Tom & Jerry's "Adventure"` renders as exactly that, without entity encoding.

> [!INFO]
> This unescaping is applied to all rendered output – template body, YAML frontmatter, and single-expression evaluations. It is not selective.

## Triple-Mustache Syntax
Handlebars' triple-mustache syntax `{{{variable}}}` tells the engine to skip escaping entirely:

```handlebars
{{{htmlContent}}}
```

In Z2K Templates, because HTML entities are unescaped automatically anyway, triple-mustache is rarely necessary. However, it remains available and functions correctly – it simply skips the escaping step that Z2K Templates would reverse regardless.

Triple-mustache is compatible with [[Whitespace Control|whitespace control]]:

```handlebars
{{{~variable~}}}
```

## The format-string-raw Helper
The `format-string-raw` [[Helper Functions|helper]] provides an alternative way to output a value without escaping:

```handlebars
{{format-string-raw fieldName}}
```

This wraps the value in a `SafeString`, which tells Handlebars to leave it untouched. Like triple-mustache, this is largely redundant in Z2K Templates due to the automatic unescaping – but it can be useful when composing output inside other helpers where you want to be explicit about intent.

## When Escaping Still Matters
Because Z2K Templates reverses all HTML entity escaping, there is currently no built-in way to preserve HTML entities in your output. If you genuinely need `&amp;` to appear as literal text in a rendered note, it will be converted back to `&`.

> [!WARNING]
> If your template output is later processed by an HTML renderer (for example, through Docusaurus or a publish pipeline), be aware that raw `<` and `>` characters in your Markdown may be interpreted as HTML tags. In these cases, you may need to handle escaping at the publishing layer rather than in the template.

> [!DANGER] Notes for Review
> - The `unescapeMostHtmlEntities` function (line 1473 in `z2k-template-engine/src/main.ts`) handles hex entities, decimal entities, and the five named entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`). This covers all standard Handlebars escaping.
> - Triple-mustache is listed as "untested" on the [[Handlebars and Z2K Templates]] overview page. If this page is confirmed accurate, that entry should be moved to the supported list.
> - Consider whether `format-string-raw` deserves a mention on the [[Formatting Functions]] page as well, or whether a cross-reference is sufficient.
> - There may be edge cases where the order of operations matters – e.g., if a helper intentionally produces HTML entities that should survive rendering. No such case was found in the built-in helpers.
