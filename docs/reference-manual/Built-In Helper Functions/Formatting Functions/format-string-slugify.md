---
sidebar_position: 130
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-slugify}}"
---
# format-string-slugify Helper

==needs updating rough chicken scratch below==

calls slugify


**Purpose:** Convert human-readable text into a **URL slug** optimized for readability and SEO—not for perfect fidelity.

It:

- Lowercases
    
- Replaces spaces with `-`
    
- Strips or transliterates punctuation
    
- Removes symbols or accents
    
- Simplifies text to a web-safe format
    

It is **not reversible**.

Example:

`slugify("Hello world?") → "hello-world"`

This actually _changes_ the text to a canonical, friendly identifier.