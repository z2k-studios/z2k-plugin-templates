---
sidebar_position: 140
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-spacify}}"
---
# format-string-spacify Helper
Converts a camelCase or PascalCase string into a space-separated expression. The first character is uppercased, then spaces are inserted at case boundaries. For instance, `ThisIsACollapsedSentence` becomes `This Is A Collapsed Sentence`.

The function handles acronyms intelligently – `XMLFile` becomes `XML File`, `HTTPServer` becomes `HTTP Server`.

```
{{format-string-spacify fieldname}}
```

where:
- `format-string-spacify` is the predefined name of the helper function for formatting back into an expression with spaces
- `fieldname` is the name of the field that will receive the data to be spacified

## Behavior Details
The function performs three steps:
1. Uppercases the first character
2. Inserts a space between a lowercase letter (or digit) followed by an uppercase letter – e.g., `parseXML` → `Parse XML`
3. Inserts a space between consecutive uppercase letters followed by an uppercase-then-lowercase sequence – e.g., `XMLFile` → `XML File`

> [!NOTE]
> The function does not handle underscores or dashes as word separators – it only uses uppercase letter boundaries to determine where to insert spaces.

## Examples
- `{{format-string-spacify "camelCase"}}` → `Camel Case`
- `{{format-string-spacify "HTTPServer"}}` → `HTTP Server`
- `{{format-string-spacify "parseXMLDocument"}}` → `Parse XML Document`

