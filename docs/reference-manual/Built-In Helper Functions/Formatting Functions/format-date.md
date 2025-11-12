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

## Examples
- `{{format-date yesterday "YYYY-MM-DD"}}` -- This would output `2025-01-08`
- `{{format-date yearQuarter "YYYY-[Q]QQ"}}` -- This would output `2025-Q01`

