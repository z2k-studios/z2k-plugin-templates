---
sidebar_position: 10
sidebar_class_name: z2k-code
sidebar_label: "{{format-date}}"
---
# format-date Helper
Z2K has a template field helper function called `format-date` for formatting date-time. It is one of the built-in formatting helpers implemented by Z2K. To use the helper function, use the following nomenclature:

```
{{format-date fieldname quoted-format-string sourceTime}}
```


==Should fieldname receive the time or is it the sourcetime? and if it receives, is this a silent function? And we may want to make sure all of the referenced backlinks to this doc are clear on Now being the default. Also need to file a bug on the implementation change.==

where:
- `format-date` is the predefined name of the helper function for formatting dates
- `fieldname` is the name of the field that will receive the data to be formatted (usually `{{now}}`)
- `quoted-format-string` is a hard coded string of how the date or time should be formatted
- (optional) `sourceTime` is the sourceTime to use for the time to be formatted. By default, it is `now`.

## Format String Specification
The `{{format-date}}` Helper function uses [moment.js](https://momentjs.com/docs/#/displaying/format/) syntax for formatting dates. 

Tip: here is a [second source for moment.js](https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/) format strings that may be more useful. 

## Examples
- `{{format-date today "YYYY-MM-DD"}}` -- This would output `2025-01-09`
- `{{format-date yearQuarter "YYYY-[Q]QQ"}}` -- This would output `2025-Q01`

## Obsidian Style Data Formatting
Please note that this helper function is the only way to format dates with Z2K Templates. It does not support the Obsidian Date Formatting syntax. See [[Custom Field Formatting#Obsidian Date-Time Formatting|Obsidian Date-Time Formatting]] for more details. 

## Preferred Source Time
Because time strings can be truncated or ambiguous, we highly recommend using the built-in field `{{now}}` ([[now|documentation link]]) as the `sourceTime` parameter to format. The use of `{{now}}` is the default value. This will insure that there is no chance of information loss, as `{{now}}` is a fully explicit and unambiguous representation of the current moment in time. 

If you need to format a date other than the current moment, we encourage you to use a `{{date-add}}` function to adjust `{{now}}` to the correct date. 

For instance:
```md title="Time Template.md"
- yesterday (good version) :: {{format-date myYesterday1 "YYYY-MM-DD" (date-add now -1)}}
- yesterday (better if not version) :: {{format-date myYesterdayPoorVersion "YYYY-MM-DD" yesterday}}
- yesterday (fail) :: {{format-date myYesterdayFail "hh:mm" yesterday}}
```


