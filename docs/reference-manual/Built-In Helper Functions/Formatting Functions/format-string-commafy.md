---
sidebar_position: 150
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-commafy}}"
---
# format-string-commafy Helper
The `format-string-commafy` helper joins an array into a comma-separated string with spaces after each comma.

```handlebars
{{format-string-commafy fieldName}}
```

where:
- `format-string-commafy` is the predefined name of the helper function
- `fieldName` is a field containing an array value (typically from a `multiSelect` field)

## How It Works
When a `multiSelect` field is rendered directly, JavaScript's default array-to-string conversion joins items with a comma and **no space**:

```handlebars
{{tags}}
```

Output: `Work,Urgent,Later`

The `format-string-commafy` helper joins items with a comma **followed by a space**, producing more readable output:

```handlebars
{{format-string-commafy tags}}
```

Output: `Work, Urgent, Later`

## Parameters
The helper takes a single parameter – the array to join. There is no option to specify a custom delimiter; the separator is always `, ` (comma + space).

For non-array values, the helper returns the value converted to a string. For null or undefined values, it returns nothing.

## When to Use It
Use `format-string-commafy` when you want a readable inline list. For other list formats – bullets, custom delimiters, or iteration – see [[Formatting Lists]].

> [!DANGER]
> - Consider adding a separator parameter? Add to github and list here and encourage people to "vote" for the feature if they want to see it written.



