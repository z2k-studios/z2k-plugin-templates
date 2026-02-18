---
sidebar_position: 190
sidebar_class_name: z2k-code
sidebar_label: "{{formatStringFileFriendly}}"
---
# formatStringFileFriendly Helper
The `formatStringFileFriendly` helper sanitizes a string so it can be safely used as a filename on any operating system. It removes or replaces characters that are illegal in Windows, macOS, and Linux file paths.

## Syntax

```
{{formatStringFileFriendly fieldname}}
```

where:
- `formatStringFileFriendly` is the predefined helper name for file-safe formatting
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
- `{{formatStringFileFriendly "My File: Draft #1"}}` → `My File Draft 1`
- `{{formatStringFileFriendly "What is AI?"}}` → `What is AI`
- `{{formatStringFileFriendly "CON"}}` → `_CON`
- `{{formatStringFileFriendly "..."}}` → `_`
- `{{formatStringFileFriendly "  ..leading dots  "}}` → `leading dots`

## Common Use Case
When using a user-provided title as a filename, wrap it with this helper to ensure it produces a valid file:
```handlebars
{{fieldInfo BookTitle prompt="Enter book title"}}
{{fieldInfo safeTitle value=(formatStringFileFriendly BookTitle) directives="no-prompt"}}
```

> [!TIP]
> You do **not** need to apply `formatStringFileFriendly` to the built-in [[fileTitle]] field. The plugin automatically sanitizes `fileTitle` when creating or renaming files — illegal characters are replaced and edge cases (trailing dots, reserved names, etc.) are handled for you.

## See Also
- [[formatStringSlugify]] for URL-safe slugs (lowercased, hyphenated)
- [[formatStringEncodeURI]] for percent-encoding strings in URLs
