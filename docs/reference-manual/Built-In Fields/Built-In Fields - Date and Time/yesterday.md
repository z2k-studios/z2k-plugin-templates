---
sidebar_position: 50
sidebar_class_name: z2k-code
sidebar_label: "{{yesterday}}"
---
# yesterday Built-In Field
The `{{yesterday}}` built-in field returns the date for yesterday.

## Default Format
The default format for the `{{yesterday}}` built-in field is `YYYY-MM-DD`. You can override that using Obsidian style date formatting or with the [[format-date]] Built-In Helper Function. 

## Customizing the Format of yesterday
![[date#Customizing the Format of date]]

## Example Output 
Given a template snippet of:
```md title="Today Example Template.md"
- Yesterday's Date: {{yesterday}}   {{~! This uses the default formatting. }}
- Yesterday's Month: {{yesterday:YYYY-MM}}  {{~! Obsidian Style formatting. }}
- Yesterday's Year: {{format-date yesterday "YYYY"}} {{~! Handlebars style. }}
- Link to Today's Daily Note: {{wikilink yesterday}}
```

If today was 2026-07-04, this would yield the following result:
```md title="Today Example Instantiated File.md"
- Yesterday's Date: 2026-07-03
- Yesterday's Month: 2026-07
- Yesterday's Year: 2026
- Link to Yesterday's Daily Note: [[2026-07-03]]
```
