---
sidebar_position: 10
sidebar_class_name: z2k-code
sidebar_label: "{{format-date}}"
---
# format-date Helper
Z2K has a template field helper function called `format-date` for formatting date-time. It is one of the built-in formatting helpers implemented by Z2K. To use the helper function, use the following nomenclature:

```
{{format-date fieldname quoted-format-string}}
```

where:
- `format-date` is the predefined name of the helper function for formatting dates
- `fieldname` is the name of the field that will receive the data to be formatted
- `quoted-format-string` is a hard coded string of how the date or time should be formatted


## Format String Specification
Just like the [[Custom Field Formatting#Obsidian Date-Time Formatting|Obsidian Date-Time Formatting]] format, the `{{format-date}}` Helper function uses [moment.js](https://momentjs.com/docs/#/displaying/format/) syntax for formatting dates. Tip: here is a [second source for moment.js](https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/) format strings that may be more useful. 

## Examples
- `{{format-date yesterday "YYYY-MM-DD"}}` -- This would output `2025-01-08`
- `{{format-date yearQuarter "YYYY-[Q]QQ"}}` -- This would output `2025-Q01`

