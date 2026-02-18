---
sidebar_position: 134
sidebar_class_name: z2k-code
sidebar_label: "{{formatStringEncodeURI}}"
---
# formatStringEncodeURI Helper
The `formatStringEncodeURI` helper percent-encodes a string so it can be safely embedded inside a URI. It uses JavaScript's `encodeURIComponent()` function, which preserves the original text with full fidelity – the encoded string can be decoded back to the exact original.

## Syntax

```
{{formatStringEncodeURI fieldname}}
```

where:
- `formatStringEncodeURI` is the predefined helper name for URI encoding
- `fieldname` is the name of the field containing the string to encode

## What It Does
Replaces reserved and unsafe URI characters with their percent-encoded equivalents:
- space → `%20`
- `:` → `%3A`
- `?` → `%3F`
- `"` → `%22`
- `{` → `%7B`
- ...and all other characters not in the unreserved set (`A-Z a-z 0-9 - _ . ~`)

Key properties:
- **Reversible** – the string decodes back to the original with full fidelity
- **Lossless** – no information is removed
- Use for query parameters, JSON payloads, or any value embedded in a URL

## Null Handling
If the value is null or undefined, the helper returns nothing.

## Examples
- `{{formatStringEncodeURI "Hello world?"}}` → `Hello%20world%3F`
- `{{formatStringEncodeURI "price=100&tax=8%"}}` → `price%3D100%26tax%3D8%25`

## Common Use Case
Building URLs with dynamic query parameters:
```handlebars
{{fieldInfo searchQuery prompt="Enter search term"}}
[Search](https://example.com/search?q={{formatStringEncodeURI searchQuery}})
```

## Slugify vs. Encode-URI
| | [[formatStringSlugify]] | `formatStringEncodeURI` |
|--|--|--|
| **Reversible** | No | Yes |
| **Changes case** | Yes (lowercases) | No |
| **Spaces** | Converted to hyphens | Converted to `%20` |
| **Use for** | Clean URL paths, identifiers | Query parameters, data in URLs |

## See Also
- [[formatStringSlugify]] for URL-safe slugs (lossy, human-readable)
- [[formatStringEncodeBase64]] for Base64 encoding
