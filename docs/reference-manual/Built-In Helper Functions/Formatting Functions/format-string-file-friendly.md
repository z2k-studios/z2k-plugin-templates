---
sidebar_position: 190
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-file-friendly}}"
---
# format-string-file-friendly Helper
The `format-string-file-friendly` helper sanitizes a string so it can be safely used as a filename on any operating system. It removes or replaces characters that are illegal in Windows, macOS, and Linux file paths.

## Syntax

```
{{format-string-file-friendly fieldname}}
```

where:
- `format-string-file-friendly` is the predefined helper name for file-safe formatting
- `fieldname` is the name of the field containing the string to sanitize

## What It Does
The helper applies the following transformations in order:

1. **Replaces illegal filesystem characters** with a space – including `< > : " / \ | ? *` and control characters (U+0000–U+001F)
2. **Collapses multiple spaces** into a single space
3. **Removes leading dots and spaces** – prevents hidden files on Unix systems
4. **Removes trailing dots and spaces** – prevents issues on Windows
5. **Returns `_`** if the result is empty (e.g., the input was `"..."` or `"***"`)
6. **Prefixes Windows reserved names** with `_` – handles `CON`, `PRN`, `AUX`, `NUL`, `COM0`–`COM9`, `LPT0`–`LPT9`

## Null Handling
If the value is null or undefined, the helper returns nothing.

## Examples
- `{{format-string-file-friendly "My File: Draft #1"}}` → `My File Draft 1`
- `{{format-string-file-friendly "What is AI?"}}` → `What is AI`
- `{{format-string-file-friendly "CON"}}` → `_CON`
- `{{format-string-file-friendly "..."}}` → `_`
- `{{format-string-file-friendly "  ..leading dots  "}}` → `leading dots`

## Common Use Case
When using a user-provided title as a filename, wrap it with this helper to ensure it produces a valid file:
```handlebars
{{field-info BookTitle prompt="Enter book title"}}
{{field-info safeTitle value=(format-string-file-friendly BookTitle) directives="no-prompt"}}
```

> [!TIP]
> You do **not** need to apply `format-string-file-friendly` to the built-in [[fileTitle]] field. The plugin automatically sanitizes `fileTitle` when creating or renaming files — illegal characters are replaced and edge cases (trailing dots, reserved names, etc.) are handled for you.

## See Also
- [[format-string-slugify]] for URL-safe slugs (lowercased, hyphenated)
- [[format-string-encode-URI]] for percent-encoding strings in URLs
