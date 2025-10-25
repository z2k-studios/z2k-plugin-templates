---
sidebar_position: 31
---


## format-number-toFixed Helper
Z2K includes a basic number formatter to help control how numbers are formatted when being passed into a field replacement. It uses the javascript function `toFixed` to format a number to a fixed number of decimal places.

The nomenclature for the `format-number-toFixed` is:

`{{format-number-toFixed fieldname number-of-decimal-places}}`

where:
	- `format-number-toFixed` is the predefined name of the helper function for formatting numbers to a fixed number of decimal places
	- `fieldname` is the name of the field that will receive the numeric data to be formatted
	- `number-of-decimal-places` is a hard coded number that is the number of decimal places the number should be formatted to. 

Examples:
- `{{format-number-toFixed Weight 0}}` -- If the number 158.56 is passed in for the `Weight` field, then it will output `158`
