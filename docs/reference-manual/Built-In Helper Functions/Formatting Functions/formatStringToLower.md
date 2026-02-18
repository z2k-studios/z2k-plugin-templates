---
sidebar_position: 120
sidebar_class_name: z2k-code
sidebar_label: "{{formatStringToLower}}"
---
# formatStringToLower Helper
Use the `formatStringToLower` Helper function to format a Template Field into all lowercase letters.

```
{{formatStringToLower fieldname}}
```

where:
- `formatStringToLower` is the predefined name of the helper function for formatting text to all lowercase
- `fieldname` is the name of the field that will receive the data to be converted to lowercase

## Example

```handlebars
{{formatStringToLower Greeting}}
```

If `Greeting` contains `"STOP YELLING AT ME"`, outputs `stop yelling at me`. Much calmer.

