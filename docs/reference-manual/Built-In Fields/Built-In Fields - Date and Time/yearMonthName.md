---
sidebar_position: 120
sidebar_class_name: z2k-code
sidebar_label: "{{yearMonthName}}"
---
# yearMonthName Built-In Field
The `{{yearMonthName}}` built-in field returns the current year and month in the format "`YYYY-MM MMMM`". 

## Default Format
The default format for the `{{yearMonthName}}` built-in field is "`YYYY-MM MMMM`". That is, if it is January 9th, 2026, then `{{yearMonthName}}` will output "`2026-01 January`". 

## Example Output 
Given a template snippet of:
```md title="yearMonthName Example Template.md"
- Month: **{{yearMonthName}}**
- Overview note for this month: {{wikilink yearMonthName}}
```

If today was July 20th, 1969, then… 
```md title="yearMonthName Example File.md"
- Month: **1969-07 July**
- Overview note for this month: [[1969-07 July]]

```

