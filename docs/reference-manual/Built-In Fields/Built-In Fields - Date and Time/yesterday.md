---
sidebar_position: 50
sidebar_class_name: z2k-code
sidebar_label: "{{yesterday}}"
---
# yesterday Built-In Field
The `{{yesterday}}` built-in field returns the date for yesterday.

## Default Format
The default format for the `{{yesterday}}` built-in field is `YYYY-MM-DD`. 

## Customizing the Format of yesterday
To adjust the format of the built-in `{{yesterday}}` field, please use the [[format-date]] built-in Helper function. 

> [!TIP] Best to use the now built-in field for format-date
> When using `format-date` to alter the appearance of `{{yesterday}}`, we recommend using the `{{now}}` built-in field instead. Please see the [[format-date#Using format-date with sourceTimes other than Now|comment in the format-date]] reference page.


## Example Output 
Given a template snippet of:
```md title="Yesterday Example Template.md"
- Yesterday's Date: {{yesterday}}   {{~! This uses the default formatting. }}
- Yesterday's Month: {{format-date "MMMM" yesterday}}  {{~! Works, but with truncation for other format strings }}
- Yesterday's Month - Preferred: {{format-date "MMMM" (date-add -1 now)}} {{~! Unambigious method}} 
- Link to Yesterday's Daily Note: {{wikilink yesterday "yesterday"}}
```

If today was 2026-07-04, this would yield the following result:
```md title="Yesterday Example Instantiated File.md"
- Yesterday's Date: 2026-07-03
- Yesterday's Month: 2026-07
- Yesterday's Year: 2026
- Link to Yesterday's Daily Note: [[2026-07-03|yesterday]]
```
