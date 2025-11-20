---
sidebar_position: 90
sidebar_class_name: z2k-code
sidebar_label: "{{weekNum}}"
---
# weekNum Built-In Field
The `{{weekNum}}` built-in field returns the current year and week number, in the format "`YYYY-[w]ww`". This is useful for assigning items to a specific week of the year in a manner that is sortable. Businesses frequently refer to this style as the "work week number".

## Default Format
The default format for the `{{weekNum}}` built-in field is "`YYYY-[w]ww`". That is, if it is January 9th, 2026, then `{{weekNum}}` will output "`2026-w02`". You can override this formatting using Obsidian style date formatting or with the [[format-date]] Built-In Helper Function. 


> [!TIP] Best to use the now built-in field for format-date
> When using `format-date` to alter the appearance of `{{weekNum}}`, we recommend using the `{{now}}` built-in field instead. Please see the [[format-date#Using format-date with sourceTimes other than Now|comment in the format-date]] reference page.


## Example Output 
Given a template snippet of:
```md title="weekNum Example Template.md"
- Work Week: **{{weekNum}}**
- Corresponding Project WorkWeek Log: {{wikilink weekNum}}
```

If today was Friday, this would yield the following result:
```md title="weekNum Example File.md"
- Work Week: **2026-w02**
- Corresponding Project WorkWeek Log: [[2026-w02]]

```

