---
sidebar_position: 27
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-bulletize}}"
---
# format-string-bulletize Helper
The `format-string-bulletize` Helper function will take a text and bulletize it (i.e. insert a `- ` at the beginning of each line.) This is particularly useful for multi-line text.

The nomenclature for the `format-string-bulletize` is:
`{{format-string-bulletize fieldname indentation-level bullet-char}}`

where:
- `format-string-bulletize` is the predefined name of the helper function for bulletizing
- `fieldname` is the name of the field that will receive the data to be bulletized
- `indentation-level` is a numeric value for the number of spaces to insert before the bullet character
- `bullet-char` is a string that specifies what type of bullet should be used (typically `"*"` or `"-"` )
