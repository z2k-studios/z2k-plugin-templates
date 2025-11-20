---
sidebar_position: 40
sidebar_class_name: z2k-code
sidebar_label: "{{today}}"
---
# today Built-In Field
The `{{today}}` built-in field returns the current date. 

## Default Format
The default format for the `{{today}}` built-in field is `YYYY-MM-DD`.

## Similarity to date Built-In Field
The `{{today}}` built-in field is functionally identical to `{{date}}`, which is supported to maintain consistency with [Obsidian's implementation](https://help.obsidian.md/plugins/templates#Template+variables). By using `{{today}}` instead of `{{date}}`, your templates will be more logically consistent with the other [[Built-In Fields - Date and Time|Date and Time]] built-in fields.

## Customizing the Format of today
To adjust the format of the built-in `{{today}}` field, please use the [[format-date]] built-in Helper function. 

> [!TIP] Best to use the now built-in field for format-date
> When using `format-date` to alter the appearance of `{{today}}`, we recommend using the `{{now}}` built-in field instead. Please see the [[format-date#Using format-date with sourceTimes other than Now|comment in the format-date]] reference page.


## Example Output 
Given a template snippet of:
```md title="Today Example Template.md"
- Today's Date: {{today}}           {{~! This uses the default formatting.    }}
- Today's Month: {{format-date "YYYY-MM" now}} {{~! use "now", not "today"    }}
- Today's Year: {{format-date "YYYY" now}}     {{~! use "now", not "today"    }}
- Link to Today's Daily Note: {{wikilink today}}
```

If today was 2026-07-04, this would yield the following result:
```md title="Today Example Instantiated File.md"
- Today's Date: 2026-07-04
- Today's Month: 2026-07
- Today's Year: 2026
- Link to Today's Daily Note: [[2026-07-04]]
```
