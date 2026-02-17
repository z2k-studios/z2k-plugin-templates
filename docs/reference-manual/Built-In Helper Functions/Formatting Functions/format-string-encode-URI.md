---
sidebar_position: 134
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-encode-URI}}"
---
# format-string-encode-URI Helper
The `format-string-encode-URI` helper percent-encodes a string so it can be safely embedded inside a URI. It uses JavaScript's `encodeURIComponent()` function, which preserves the original text with full fidelity – the encoded string can be decoded back to the exact original.

## Syntax

```
{{format-string-encode-URI fieldname}}
```

where:
- `format-string-encode-URI` is the predefined helper name for URI encoding
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
- `{{format-string-encode-URI "Hello world?"}}` → `Hello%20world%3F`
- `{{format-string-encode-URI "price=100&tax=8%"}}` → `price%3D100%26tax%3D8%25`

## Common Use Case
Building URLs with dynamic query parameters:
```handlebars
{{field-info searchQuery prompt="Enter search term"}}
[Search](https://example.com/search?q={{format-string-encode-URI searchQuery}})
```

## Slugify vs. Encode-URI
| | [[format-string-slugify]] | `format-string-encode-URI` |
|--|--|--|
| **Reversible** | No | Yes |
| **Changes case** | Yes (lowercases) | No |
| **Spaces** | Converted to hyphens | Converted to `%20` |
| **Use for** | Clean URL paths, identifiers | Query parameters, data in URLs |

## See Also
- [[format-string-slugify]] for URL-safe slugs (lossy, human-readable)
- [[format-string-encode-base64]] for Base64 encoding
