---
sidebar_position: 120
sidebar_class_name: z2k-code
sidebar_label: "{{yearMonth}}"
---
# yearMonth Built-In Field
The `{{yearMonth}}` built-in field returns the current year and month in the format "`YYYY-MM`". 

## Default Format
The default format for the `{{yearMonth}}` built-in field is "`YYYY-MM`". That is, if it is January 9th, 2026, then `{{yearMonth}}` will output "`2026-01`". 

## Example Output 
Given a template snippet of:
```md title="yearMonth Example Template.md"
- Month: **{{yearMonth}}**
- Overview note for this month: {{wikilink yearMonth}}
```

If today was July 20th, 1969, then… 
```md title="yearMonth Example File.md"
- Month: **1969-07**
- Overview note for this month: [[1969-07]]

```

