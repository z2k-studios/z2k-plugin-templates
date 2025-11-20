---
sidebar_position: 80
sidebar_class_name: z2k-code
sidebar_label: "{{dayOfWeek}}"
---
# dayOfWeek Built-In Field
The `{{dayOfWeek}}` built-in field returns the name of the current day of the week. 
## Default Format
The default format for the `{{dayOfWeek}}` built-in field is `dddd`. You can override that using Obsidian style date formatting or with the [[format-date]] Built-In Helper Function. 

## Customizing the Format of dayOfWeek
To adjust the format of the built-in `{{dayOfWeek}}` field, please use the [[format-date]] built-in Helper function. 

> [!TIP] Best to use the now built-in field for format-date
> When using `format-date` to alter the appearance of `{{dayOfWeek}}`, we recommend using the `{{now}}` built-in field instead. Please see the [[format-date#Using format-date with sourceTimes other than Now|comment in the format-date]] reference page.

## Example Output 
Given a template snippet of:
```md title="dayOfWeek Example Template.md"
- Day of the week: **{{dayOfWeek}}**
- Abbreviated day of the week: {{format-date "ddd" now}} 
```

If today was Friday, this would yield the following result:
```md title="dayOfWeek Example File.md"
- Day of the week: **Friday**
- Abbreviated day of the week: Fri

```

