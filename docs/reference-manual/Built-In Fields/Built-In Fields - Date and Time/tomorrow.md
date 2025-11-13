---
sidebar_position: 60
sidebar_class_name: z2k-code
sidebar_label: "{{tomorrow}}"
---
# yesterday Built-In Field
The `{{tomorrow}}` built-in field returns the date for tomorrow.

## Default Format
The default format for the `{{tomorrow}}` built-in field is `YYYY-MM-DD`. You can override that using Obsidian style date formatting or with the [[format-date]] Built-In Helper Function. 

## Customizing the Format of tomorrow
![[date#Customizing the Format of date]]

## Example Output 
Given a template snippet of:
```md title="Today Example Template.md"
- Tomorrow's Date: {{tomorrow}}   {{~! This uses the default formatting. }}
- Tomorrow's Month: {{tomorrow:YYYY-MM}}  {{~! Obsidian Style formatting. }}
- Tomorrow's Year: {{format-date tomorrow "YYYY"}} {{~! Handlebars style. }}
- Link to Tomorrow's Daily Note: {{wikilink tomorrow "tomorrow"}}
```

If today was 2026-07-04, this would yield the following result:
```md title="Today Example Instantiated File.md"
- Tomorrow's Date: 2026-07-05
- Tomorrow's Month: 2026-07
- Tomorrow's Year: 2026
- Link to Tomorrow's Daily Note: [[2026-07-05|tomorrow]]
```
