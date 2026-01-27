---
sidebar_position: 140
sidebar_class_name: z2k-code
sidebar_label: "{{yearQuarter}}"
---
# yearQuarter Built-In Field
The `{{yearQuarter}}` built-in field returns the current year and quarter in the format "`YYYY-[Q]Q`". 

## Default Format
The default format for the `{{yearQuarter}}` built-in field is "`YYYY-[Q]Q`". That is, if it is January 9th, 2026, then `{{yearQuarter}}` will output "`2026-Q1`". You can override this formatting using Obsidian style date formatting or with the [[format-date]] Built-In Helper Function. 

## Example Output 
Given a template snippet of:
```md title="yearQuarter Example Template.md"
- Quarter: **{{yearQuarter}}**
- Overview note for this Quarter: {{wikilink yearQuarter}}
```

If today was July 4th, 2012, then… 
```md title="yearQuarter Example File.md"
- Quarter: **2012-Q3**
- Overview note for this Quarter: [[2012-Q3]]

```

