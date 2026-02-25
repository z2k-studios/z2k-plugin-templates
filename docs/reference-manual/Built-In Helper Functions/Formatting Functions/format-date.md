---
sidebar_position: 10
sidebar_class_name: z2k-code
sidebar_label: "{{format-date}}"
---
# format-date Helper
The `{{format-date}}` built-in helper function is used to format your date and time fields. To use the helper function, use the following syntax:

```
{{format-date quoted-format-string sourceTime}}
```

where:
- `format-date` is the predefined name of the helper function for formatting dates
- `quoted-format-string` is a string specifying how the date or time should be formatted. If omitted, defaults to `"YYYY-MM-DD"`.
- (optional) `sourceTime` is the moment in time that is to be formatted. By default, it uses the current date and time (see [[now]], and discussion [[#Using format-date with sourceTimes other than Now|below]] for using `sourceTimes` other than the current time). If the provided value cannot be parsed as a valid date, the raw value is returned unchanged.

Also supports named hash parameters: `{{format-date format="YYYY-MM-DD" value=yesterday}}`

## Format String Specification
The `{{format-date}}` Helper function uses [moment.js](https://momentjs.com/docs/#/displaying/format/) syntax for formatting dates. 


> [!TIP] Format String Details
> Here is a [second source for moment.js](https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/) format strings that may be more useful. 

## Examples
Assuming today was 2025-01-09
- `{{format-date "YYYY-MM-DD"}}` -- This would output `2025-01-09`
- `{{format-date "YYYY-[Q]QQ" now}}` -- This would output `2025-Q01`
- `{{format-date "YYYY" yesterday}}` -- This would output `2025` (see warning note [[#Using format-date with sourceTimes other than Now|below]])
- `{{format-date "LLLL"}}` -- This would output `Friday, January 9th, 2025 8:30 AM`

## Obsidian Style Data Formatting
Please note that this helper function is the only way to format dates with Z2K Templates. The template does *not* support the Obsidian Date Formatting syntax. See [[Custom Field Formatting#Obsidian Date-Time Formatting|Obsidian Date-Time Formatting]] for more details. 

## Using formatDate with sourceTimes other than Now
By default, the `{{formatDate}}` helper uses the current date and time for the `sourceTime` parameter. 

Because time strings can be truncated or ambiguous, we highly recommend using the built-in field `{{now}}` ([[now]] is the default value) as the `sourceTime` parameter to format. This will insure that there is no chance of information loss or ambiguity, as `{{now}}` is a fully explicit and unambiguous representation of the current moment in time. This is a consequence of Z2K Templates' [[Field Types#Dates Are Strings — Handle with Care|loose typing]] — `date` and `datetime` fields are stored as strings, and parsing them back into date objects can lose time-of-day information.

If you need to format a date other than the current moment, we encourage you to use a `{{date-add}}` function to adjust `{{now}}` to the correct date. 

For instance:
```md title="Time Template.md"
{{fieldInfo myYesterday type="datetime" value=(dateAdd -1) directives="no-prompt"}}
{{fieldInfo myYesterdayFormatted type="datetime" value=(formatDate "YYYY-MM-DD" (date-add -1)) directives="no-prompt"}}


## Proper Formatting for Dates other than Now
- Yesterday (direct version) :: {{formatDate "YYYY-MM-DD" (dateAdd -1)}}
- Yesterday (custom field) :: {{formatDate "YYYY-MM-DD" myYesterday}}
- Yesterday (custom field with formatting) :: {{myYesterdayFormatted}}
  
## Problematic Formatting
- yesterday (time of day has been truncation) :: {{formatDate "YYYY-MM-DD" yesterday}}
- yesterday (fail) :: {{format-date "HH:mm" yesterday}}
  

```


