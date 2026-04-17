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
| `formatStringSlugify` | URL-friendly identifiers | No |
| `formatStringFileFriendly` | Safe filenames | No |
| `formatStringEncodeURI` | URL parameter encoding | Yes |
| `formatStringEncodeBase64` | Base64 encoding | Yes |

## Creating URL Slugs
The [[formatStringSlugify]] helper converts human-readable text into URL-safe slugs:

```handlebars
{{formatStringSlugify title}}
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
[Read more](/posts/{{formatStringSlugify title}})

{{!-- Anchor link --}}
See [[#{{formatStringSlugify sectionName}}|{{sectionName}}]]

{{!-- CSS class name --}}
<div class="card-{{formatStringSlugify category}}">
```

> [!WARNING]
> Slugification is **not reversible**. `"Hello World!"` and `"hello-world"` both produce the same slug. Don't use slugs as unique identifiers if the original text might vary.

## Safe Filenames
The [[formatStringFileFriendly]] helper removes characters that are invalid or problematic in filenames:

```handlebars
{{formatStringFileFriendly noteName}}
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
{{fieldInfo fileName type="text" value=(formatStringFileFriendly projectName)}}

{{!-- Wikilink with clean target --}}
[[{{formatStringFileFriendly linkTarget}}]]
```

### Difference from Slugify
`formatStringFileFriendly` preserves more of the original text:
- Keeps original case
- Keeps spaces
- Only removes truly unsafe characters

Use `slugify` for URLs, `file-friendly` for filenames.

## URL Encoding
The [[formatStringEncodeURI]] helper encodes text for safe inclusion in URLs:

```handlebars
{{formatStringEncodeURI searchQuery}}
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
[Search Google](https://www.google.com/search?q={{formatStringEncodeURI query}})

{{!-- Obsidian URI with parameters --}}
[Open note](obsidian://open?vault={{formatStringEncodeURI vaultName}}&file={{formatStringEncodeURI fileName}})

{{!-- API endpoint --}}
{{formatStringEncodeURI apiEndpoint}}?filter={{formatStringEncodeURI filterValue}}
```

> [!NOTE]
> URI encoding is **reversible**. The original text can be recovered by decoding the percent-encoded values.

## Base64 Encoding
The [[formatStringEncodeBase64]] helper converts text to Base64:

```handlebars
{{formatStringEncodeBase64 content}}
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
Authorization: Basic {{formatStringEncodeBase64 (formatString credentials ":" "")}}
```

## Choosing the Right Helper

| Scenario | Helper | Why |
|----------|--------|-----|
| URL path segment | `formatStringSlugify` | Clean, readable URLs |
| URL query parameter | `formatStringEncodeURI` | Preserves exact value |
| Filename | `formatStringFileFriendly` | Removes unsafe chars only |
| Anchor/ID | `formatStringSlugify` | Valid HTML identifiers |
| API data | `formatStringEncodeURI` or `base64` | Depends on API requirements |

### Example: Dynamic Link Generation
```handlebars
{{fieldInfo projectName type="text" prompt="Project name?"}}
{{fieldInfo projectSlug type="text" value=(formatStringSlugify projectName) directives="no-prompt"}}
{{fieldInfo projectFile type="text" value=(formatStringFileFriendly projectName) directives="no-prompt"}}

## {{projectName}}
- File: [[Projects/{{projectFile}}]]
- URL: [View online](https://projects.example.com/{{projectSlug}})
```

> [!DANGER] INTERNAL NOTES
> - Verify the exact characters removed by `formatStringFileFriendly` – the list may be incomplete.
> - Test `formatStringSlugify` with non-ASCII characters (accents, CJK, emoji).
> - The Basic auth example assumes a `formatString` with empty suffix – verify this syntax works.
