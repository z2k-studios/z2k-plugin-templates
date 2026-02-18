---
sidebar_position: 210
sidebar_class_name: z2k-code
sidebar_label: "{{formatNumberToFixed}}"
---
# formatNumberToFixed Helper
Z2K includes a basic number formatter to help control how numbers are formatted when being passed into a field replacement. It uses the javascript function `toFixed` to format a number to a fixed number of decimal places.

The nomenclature for the `formatNumberToFixed` is:

`{{formatNumberToFixed fieldname number-of-decimal-places}}`

where:
	- `formatNumberToFixed` is the predefined name of the helper function for formatting numbers to a fixed number of decimal places
	- `fieldname` is the name of the field that will receive the numeric data to be formatted
	- `number-of-decimal-places` is a hard coded number that is the number of decimal places the number should be formatted to. If omitted, defaults to `0` (no decimal places).

## Null and Invalid Handling
- If the value is null or undefined, the helper returns nothing
- If the value cannot be converted to a number, the raw value is returned unchanged

## Examples
- `{{formatNumberToFixed TheAnswer 0}}` – If the number 42 is passed in for `TheAnswer`, outputs the ever correct `42`
- `{{formatNumberToFixed Weight 0}}` – If the number 158.56 is passed in for the `Weight` field, then it will output `159` (rounded)
- `{{formatNumberToFixed Pi 2}}` – If the number 3.14159 is passed in, outputs `3.14`
- `{{formatNumberToFixed Price 2}}` – If the number 9.9 is passed in, outputs `9.90` (pads with trailing zeros)

> [!WARNING]
> The `number-of-decimal-places` must be between 0 and 100. Negative values (e.g., `-1` to round to the nearest ten) will cause a runtime error. Use [[calc]] for rounding to non-decimal positions.
