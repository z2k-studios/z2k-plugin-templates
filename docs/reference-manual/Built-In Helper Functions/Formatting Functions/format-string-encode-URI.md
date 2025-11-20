---
sidebar_position: 134
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-encode-URI}}"
---
# format-string-encode-URI Helper

==needs updating. Rough check scratch below ==

uses encodeURIComponent

**Purpose:** Make an arbitrary string safe to embed inside a URI **without changing its meaning**.

It does this by percent-encoding reserved characters:

- `:` → `%3A`
    
- `{` → `%7B`
    
- `"` → `%22`
    
- space → `%20`  
    …etc.
    

Key properties:

- Reversible.
    
- Lossless.
    
- The string **decodes back to the original** with absolute fidelity.
    
- Used for query parameters, JSON payloads, Base64 strings, etc.
    

Example:

`encodeURIComponent("Hello world?") → "Hello%20world%3F"`