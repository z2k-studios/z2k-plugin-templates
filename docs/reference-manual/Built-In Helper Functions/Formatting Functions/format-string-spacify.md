---
sidebar_position: 140
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-spacify}}"
---
# format-string-spacify Helper
If you want to convert a collapsed string of words back into an expression with spaces, use this helper function. For instance, this will convert an expression `ThisIsACollapsedSentence` back into `This is a Collapsed Sentence`.

```
{{format-string-spacify fieldname}}
```

where:
- `format-string-spacify` is the predefined name of the helper function for formatting back into an expression with spaces.
- `fieldname` is the name of the field that will receive the data to be capitalized

