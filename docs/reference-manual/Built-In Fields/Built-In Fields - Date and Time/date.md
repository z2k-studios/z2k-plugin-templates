---
sidebar_position: 10
sidebar_class_name: z2k-code
sidebar_label: "{{date}}"
---
# date Built-In Field
The `{{date}}` built-in field returns the current date. 

## Default Format
The default format for the `{{date}}` built-in field is `YYYY-MM-DD`. You can override that using Obsidian style date formatting or with the [[format-date]] Built-In Helper Function. 

## Customizing the Format of date
To adjust the format of this built-in date-time field, please use the [[format-date]] built-in Helper function. Please note that Obsidian's formatting style is not supported (see [[Custom Field Formatting#Obsidian Date-Time Formatting|Obsidian Date-Time Formatting]]). If using `{{format-date}}`, we recommend using the `{{now}}` built-in field for the current time.

## Example Output 
Given a template snippet of:
```md title="Date Example Template.md"
- Today's Date: {{date}}           {{~! This uses the default formatting.    }}
- Today's Month: {{date:YYYY-MM}}  {{~! This uses Obsidian Style formatting. }}
- Today's Year: {{format-date date "YYYY"}} {{~! This uses Handlebars style. }}
- Link to Today's Daily Note: {{wikilink date}}
```

If today was 2026-07-04, this would yield the following result:
```md title="Date Example Instantiated File.md"
- Today's Date: 2026-07-04
- Today's Month: 2026-07
- Today's Year: 2026
- Link to Today's Daily Note: [[2026-07-04]]
```

## Obsidian Compatibility
Note: we have included the `{{date}}` built-in field to offer compatibility with Obsidian's own templating ability. We do recommend, however, using the Z2K Templates equivalent field `{{today}}` instead to minimize the chance for confusion. See the [[today]] built-in field. 