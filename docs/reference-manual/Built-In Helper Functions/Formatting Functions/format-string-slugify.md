---
sidebar_position: 130
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-slugify}}"
---
# format-string-slugify Helper
The `format-string-slugify` helper converts human-readable text into a URL-friendly slug – lowercased, hyphenated, and stripped of special characters. This is useful for building clean URLs, search query parameters, and identifiers.

## Syntax

```
{{format-string-slugify fieldname}}
```

where:
- `format-string-slugify` is the predefined helper name for slug conversion
- `fieldname` is the name of the field containing the string to slugify

## What It Does
The helper applies the following transformations in order:

1. **Lowercases** the entire string
2. **Normalizes accented characters** to their base form (NFD normalization) – e.g., `café` → `cafe`
3. **Removes non-alphanumeric characters** except spaces and hyphens
4. **Converts spaces to hyphens**
5. **Collapses multiple hyphens** into a single hyphen
6. **Trims leading and trailing hyphens**

The transformation is **not reversible** – information is lost (case, punctuation, accents).

## Null Handling
If the value is null or undefined, the helper returns nothing.

## Examples
- `{{format-string-slugify "Hello World?"}}` → `hello-world`
- `{{format-string-slugify "Café au Lait"}}` → `cafe-au-lait`
- `{{format-string-slugify "AI & Machine Learning: A Guide"}}` → `ai--machine-learning-a-guide`
- `{{format-string-slugify "The 100 Best Books"}}` → `the-100-best-books`

## Common Use Case
Building search links or URL parameters:
```handlebars
{{field-info ArticleTitle prompt="Article title"}}
Research link: [Search](https://scholar.google.com/scholar?q={{format-string-slugify ArticleTitle}})
```

> [!NOTE]
> The [[google]], [[chatGPT]], and [[wikipedia]] helpers handle encoding automatically – you do not need to manually slugify their inputs.

## See Also
- [[format-string-encode-URI]] for percent-encoding (lossless, reversible)
- [[format-string-file-friendly]] for filesystem-safe strings
- [[google]], [[chatGPT]], [[wikipedia]] – link helpers that slugify/encode automatically
