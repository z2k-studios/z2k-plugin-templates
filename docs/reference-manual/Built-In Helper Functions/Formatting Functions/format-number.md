---
sidebar_position: 10
---

## format-number Helper
The formatNumber helper formats a number using the [Numeral.js ↗](http://numeraljs.com/) library. Note that the value must be a number and the format must be a string

The nomenclature for the `format-number` is:

```
{{format-number fieldname quoted-format-string}}
```

where:
	- `format-number` is the predefined name of the helper function for formatting numbers
	- `fieldname` is the name of the field that will receive the data to be formatted
	- `quoted-format-string` is a hard coded string of how the number should be formatted.

Examples:
- `{{format-number MinutesWalked '0,0'}}` -- If the number 1400 is passed in for the `MinutesWalked` field, then it will output `1,400`

