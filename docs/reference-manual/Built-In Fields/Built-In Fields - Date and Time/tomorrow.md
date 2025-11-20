---
sidebar_position: 60
sidebar_class_name: z2k-code
sidebar_label: "{{tomorrow}}"
---
# yesterday Built-In Field
The `{{tomorrow}}` built-in field returns the date for tomorrow.

## Default Format
The default format for the `{{tomorrow}}` built-in field is `YYYY-MM-DD`. 

## Customizing the Format of tomorrow
To adjust the format of the built-in `{{tomorrow}}` field, please use the [[format-date]] built-in Helper function. 

> [!TIP] Best to use the now built-in field for format-date
> When using `format-date` to alter the appearance of `{{tomorrow}}`, we recommend using the `{{now}}` built-in field instead. Please see the [[format-date#Using format-date with sourceTimes other than Now|comment in the format-date]] reference page.


## Example Output 
Given a template snippet of:
```md title="Tomorrow Example Template.md"
- Tomorrow's Date: {{tomorrow}}   {{~! This uses the default formatting. }}
- Tomorrow's Month: {{format-date "MMMM" tomorrow}}  {{~! Works, but with truncation for other format strings }}
- Tomorrow's Month - Preferred: {{format-date "MMMM" (date-add 1 now)}} {{~! Unambigious method}} 
- Link to Tomorrow's Daily Note: {{wikilink tomorrow "tomorrow"}}
```

If today was 2026-07-04, this would yield the following result:
```md title="Tomorrow Example Instantiated File.md"
- Tomorrow's Date: 2026-07-05
- Tomorrow's Month: July
- Tomorrow's Month - Preferred: July
- Link to Tomorrow's Daily Note: [[2026-07-05|tomorrow]]
```
