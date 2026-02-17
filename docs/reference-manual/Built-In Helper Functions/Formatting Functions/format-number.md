---
sidebar_position: 200
sidebar_class_name: z2k-code
sidebar_label: "{{format-number}}"
---
# format-number Helper
The formatNumber helper formats a number using the [Numeral.js ↗](http://numeraljs.com/) library. Note that the value must be a number and the format must be a string

The nomenclature for the `format-number` is:

```
{{format-number fieldname quoted-format-string}}
```

where:
	- `format-number` is the predefined name of the helper function for formatting numbers
	- `fieldname` is the name of the field that will receive the data to be formatted
	- `quoted-format-string` is a hard coded string of how the number should be formatted. If omitted, defaults to `'0,0'` (thousands-separated).

## Null and Invalid Handling
- If the value is null or undefined, the helper returns nothing
- If the value cannot be converted to a number, the raw value is returned unchanged

## Examples
- `{{format-number MinutesWalked '0,0'}}` – If the number 1400 is passed in for the `MinutesWalked` field, then it will output `1,400`
- `{{format-number Pi '0.000'}}` – If 3.14159 is passed in, outputs `3.142`
- `{{format-number Revenue '$0,0.00'}}` – If 42500 is passed in, outputs `$42,500.00`

## String Values and Automatic Conversion
The `format-number` helper automatically converts string values to numbers before formatting. You do **not** need to wrap the field in `{{toNumber ...}}` first — the helper handles this internally using JavaScript's `Number()` conversion.

This matters because field values often arrive as strings, even when they look like numbers. Common scenarios:
- **Text fields** — a `type="text"` field always produces a string, even if the user types `"42"`
- **Data sources** — values from CSV imports, API responses, or YAML frontmatter may be strings
- **Computed values** — some helper chains produce string results

If the value cannot be converted to a valid number (e.g., `"hello"` or `"12px"`), the raw value is returned unchanged — no error is thrown.

```handlebars
{{!-- All of these produce the same output: 1,400 --}}
{{format-number numericField '0,0'}}     {{!-- numericField = 1400 (number) --}}
{{format-number textField '0,0'}}        {{!-- textField = "1400" (string) --}}

{{!-- Non-numeric strings pass through unchanged --}}
{{format-number badField '0,0'}}         {{!-- badField = "N/A" → outputs "N/A" --}}
```

