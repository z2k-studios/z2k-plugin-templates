---
sidebar_position: 100
sidebar_class_name: z2k-code
sidebar_label: "{{year}}"
---
# year Built-In Field
The `{{year}}` built-in field returns the current year in the format "`YYYY`". 

## Default Format
The default format for the `{{year}}` built-in field is "`YYYY`". That is, if it is January 9th, 2026, then `{{year}}` will output "`2026`". You can override this formatting using Obsidian style date formatting or with the [[format-date]] Built-In Helper Function. 

## Example Output 
Given a template snippet of:
```md title="year Example Template.md"
- Year: **{{year}}**
- Overview note for this year: {{wikilink year}}
```

If today was May 5th, 1789, then… 
```md title="year Example File.md"
- Year: **1789**
- Overview note for this year: [[1789]]

```

