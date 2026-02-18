---
sidebar_position: 136
sidebar_class_name: z2k-code
sidebar_label: "{{formatStringEncodeBase64}}"
---
# formatStringEncodeBase64 Helper
The `formatStringEncodeBase64` helper encodes a string value into Base64 format using JavaScript's `btoa()` function.

## Syntax

```
{{formatStringEncodeBase64 fieldname}}
```

where:
- `formatStringEncodeBase64` is the predefined helper name for Base64 encoding
- `fieldname` is the name of the field containing the string to encode

## Null Handling
If the value is null or undefined, the helper returns nothing.

## Examples
- `{{formatStringEncodeBase64 "Hello World"}}` → `SGVsbG8gV29ybGQ=`
- `{{formatStringEncodeBase64 "Z2K Templates"}}` → `WjJLIFRlbXBsYXRlcw==`

> [!WARNING]
> The underlying `btoa()` function works with ASCII strings. If the input contains non-ASCII characters (e.g., accented letters, emoji), the encoding may throw an error. For text with Unicode characters, consider using [[formatStringEncodeURI]] instead.

## See Also
- [[formatStringEncodeURI]] for percent-encoding strings in URLs
- [[formatStringSlugify]] for URL-safe slugs
