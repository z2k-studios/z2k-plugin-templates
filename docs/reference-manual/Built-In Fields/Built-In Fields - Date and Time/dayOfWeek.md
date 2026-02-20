---
sidebar_position: 80
sidebar_class_name: z2k-code
sidebar_label: "{{dayOfWeek}}"
---
# dayOfWeek Built-In Field
The `{{dayOfWeek}}` built-in field returns the name of the current day of the week. 
## Default Format
The default format for the `{{dayOfWeek}}` built-in field is `dddd`. You can override that using Obsidian style date formatting or with the [[formatDate]] Built-In Helper Function. 

## Customizing the Format of dayOfWeek
To adjust the format of the built-in `{{dayOfWeek}}` field, please use the [[formatDate]] built-in Helper function. 

> [!TIP] Best to use the now built-in field for formatDate
> When using `formatDate` to alter the appearance of `{{dayOfWeek}}`, we recommend using the `{{now}}` built-in field instead. Please see the [[formatDate#Using formatDate with sourceTimes other than Now|comment in the formatDate]] reference page.

## Example Output 
Given a template snippet of:
```md title="dayOfWeek Example Template.md"
- Day of the week: **{{dayOfWeek}}**
- Abbreviated day of the week: {{formatDate "ddd" now}} 
```

If today was Friday, this would yield the following result:
```md title="dayOfWeek Example File.md"
- Day of the week: **Friday**
- Abbreviated day of the week: Fri

```

