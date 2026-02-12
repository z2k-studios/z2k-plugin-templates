---
sidebar_position: 160
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-trim}}"
---
# format-string-trim Helper
The `format-string-trim` helper removes leading and trailing whitespace from a field's value. This trims the data itself — not the whitespace surrounding the expression in the template (for that, see [[Whitespace Control]]).

```
{{format-string-trim fieldname}}
```

where:
- `format-string-trim` is the predefined name of the helper function for trimming whitespace at the beginning and end of provided data.
- `fieldname` is the name of the field whose value will be trimmed

## Example
If the field `userInput` contains `"  hello world  "`, then:

```handlebars
{{format-string-trim userInput}}
```

outputs `hello world` — with the leading and trailing spaces removed, but internal spacing preserved.

## See Also
- [[Whitespace Control]] — for controlling whitespace *around* expressions in the template (using tildes `~`)
- [[Formatting Text#Whitespace Handling]] — for a comparison of both approaches
