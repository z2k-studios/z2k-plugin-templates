---
sidebar_position: 70
aliases:
- file formatting
- url formatting
- slug formatting
- uri encoding
---
# Formatting for Files and URLs
When generating filenames, URLs, or identifiers from user input, text often needs to be sanitized or encoded. Z2K Templates provides helpers for common file and URL formatting patterns.

## Contents
- [[#Overview of Helpers]]
- [[#Creating URL Slugs]]
- [[#Safe Filenames]]
- [[#URL Encoding]]
- [[#Base64 Encoding]]
- [[#Choosing the Right Helper]]

## Overview of Helpers

| Helper | Purpose | Reversible? |
|--------|---------|-------------|
| `format-string-slugify` | URL-friendly identifiers | No |
| `format-string-file-friendly` | Safe filenames | No |
| `format-string-encode-URI` | URL parameter encoding | Yes |
| `format-string-encode-base64` | Base64 encoding | Yes |

## Creating URL Slugs
The [[format-string-slugify]] helper converts human-readable text into URL-safe slugs:

```handlebars
{{format-string-slugify title}}
```

The transformation:
- Converts to lowercase
- Replaces spaces with hyphens
- Removes or transliterates special characters and accents
- Strips punctuation

| Input | Output |
|-------|--------|
| `Hello World!` | `hello-world` |
| `What's New in 2025?` | `whats-new-in-2025` |
| `Café & Résumé` | `cafe-resume` |
| `The "Quick" Brown Fox` | `the-quick-brown-fox` |

### Use Cases
```handlebars
{{!-- Blog post URL --}}
[Read more](/posts/{{format-string-slugify title}})

{{!-- Anchor link --}}
See [[#{{format-string-slugify sectionName}}|{{sectionName}}]]

{{!-- CSS class name --}}
<div class="card-{{format-string-slugify category}}">
```

> [!WARNING]
> Slugification is **not reversible**. `"Hello World!"` and `"hello-world"` both produce the same slug. Don't use slugs as unique identifiers if the original text might vary.

## Safe Filenames
The [[format-string-file-friendly]] helper removes characters that are invalid or problematic in filenames:

```handlebars
{{format-string-file-friendly noteName}}
```

Characters removed or replaced:
- Wildcard characters (`*`, `?`)
- Path separators (`/`, `\`)
- Special characters (`:`, `|`, `<`, `>`, `"`)
- Leading/trailing spaces and dots

| Input | Output |
|-------|--------|
| `Meeting: Q1 Review` | `Meeting Q1 Review` |
| `File<1>/Test` | `File1Test` |
| `"Important" Notes` | `Important Notes` |
| `...hidden` | `hidden` |

### Use Cases
```handlebars
{{!-- Generated filename --}}
{{field-info fileName type="text" value=(format-string-file-friendly projectName)}}

{{!-- Wikilink with clean target --}}
[[{{format-string-file-friendly linkTarget}}]]
```

### Difference from Slugify
`format-string-file-friendly` preserves more of the original text:
- Keeps original case
- Keeps spaces
- Only removes truly unsafe characters

Use `slugify` for URLs, `file-friendly` for filenames.

## URL Encoding
The [[format-string-encode-URI]] helper encodes text for safe inclusion in URLs:

```handlebars
{{format-string-encode-URI searchQuery}}
```

This uses standard [percent-encoding](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding):

| Input | Output |
|-------|--------|
| `hello world` | `hello%20world` |
| `name=value` | `name%3Dvalue` |
| `café` | `caf%C3%A9` |

### Use Cases
```handlebars
{{!-- Search URL --}}
[Search Google](https://www.google.com/search?q={{format-string-encode-URI query}})

{{!-- Obsidian URI with parameters --}}
[Open note](obsidian://open?vault={{format-string-encode-URI vaultName}}&file={{format-string-encode-URI fileName}})

{{!-- API endpoint --}}
{{format-string-encode-URI apiEndpoint}}?filter={{format-string-encode-URI filterValue}}
```

> [!NOTE]
> URI encoding is **reversible**. The original text can be recovered by decoding the percent-encoded values.

## Base64 Encoding
The [[format-string-encode-base64]] helper converts text to Base64:

```handlebars
{{format-string-encode-base64 content}}
```

| Input | Output |
|-------|--------|
| `Hello` | `SGVsbG8=` |
| `user:pass` | `dXNlcjpwYXNz` |

### Use Cases
Base64 encoding is less common in templates, but useful for:
- HTTP Basic Authentication headers
- Data URIs
- Encoding binary-like content in text

```handlebars
{{!-- Basic auth header value --}}
Authorization: Basic {{format-string-encode-base64 (format-string credentials ":" "")}}
```

## Choosing the Right Helper

| Scenario | Helper | Why |
|----------|--------|-----|
| URL path segment | `format-string-slugify` | Clean, readable URLs |
| URL query parameter | `format-string-encode-URI` | Preserves exact value |
| Filename | `format-string-file-friendly` | Removes unsafe chars only |
| Anchor/ID | `format-string-slugify` | Valid HTML identifiers |
| API data | `format-string-encode-URI` or `base64` | Depends on API requirements |

### Example: Dynamic Link Generation
```handlebars
{{field-info projectName type="text" prompt="Project name?"}}
{{field-info projectSlug type="text" value=(format-string-slugify projectName) directives="no-prompt"}}
{{field-info projectFile type="text" value=(format-string-file-friendly projectName) directives="no-prompt"}}

## {{projectName}}
- File: [[Projects/{{projectFile}}]]
- URL: [View online](https://projects.example.com/{{projectSlug}})
```

> [!DANGER] Notes for Review
> - Verify the exact characters removed by `format-string-file-friendly` – the list may be incomplete.
> - Test `format-string-slugify` with non-ASCII characters (accents, CJK, emoji).
> - The Basic auth example assumes a `format-string` with empty suffix – verify this syntax works.
