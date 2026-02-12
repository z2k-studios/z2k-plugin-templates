---
sidebar_position: 136
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-encode-base64}}"
---
# format-string-encode-base64 Helper
The `format-string-encode-base64` helper encodes a string value into Base64 format using JavaScript's `btoa()` function.

## Syntax

```
{{format-string-encode-base64 fieldname}}
```

where:
- `format-string-encode-base64` is the predefined helper name for Base64 encoding
- `fieldname` is the name of the field containing the string to encode

## Null Handling
If the value is null or undefined, the helper returns nothing.

## Examples
- `{{format-string-encode-base64 "Hello World"}}` → `SGVsbG8gV29ybGQ=`
- `{{format-string-encode-base64 "Z2K Templates"}}` → `WjJLIFRlbXBsYXRlcw==`

> [!WARNING]
> The underlying `btoa()` function works with ASCII strings. If the input contains non-ASCII characters (e.g., accented letters, emoji), the encoding may throw an error. For text with Unicode characters, consider using [[format-string-encode-URI]] instead.

## See Also
- [[format-string-encode-URI]] for percent-encoding strings in URLs
- [[format-string-slugify]] for URL-safe slugs
