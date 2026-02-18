---
sidebar_position: 20
sidebar_class_name: z2k-code
sidebar_label: "{{time}}"
---
# time Built-In Field
The `{{time}}` built-in field returns the current time. 

## Default Format
The default format for the `{{time}}` built-in field is `HH:mm` in the current timezone. You can override that using Obsidian style date formatting or with the [[formatDate]] Built-In Helper Function. 

## Customizing the Format of time
To adjust the format of this built-in date-time field, please use the [[formatDate]] built-in Helper function. 

> [!TIP] Best to use the now built-in field for formatDate
> When using `formatDate` to alter the appearance of `{{time}}`, we recommend using the `{{now}}` built-in field instead. Please see the [[formatDate#Using formatDate with sourceTimes other than Now|comment in the formatDate]] reference page.

## Example Output 
Given a template snippet of:
```md title="Time Example Template.md"
- Time of Creation: {{time}}      {{~! Default formatting }}
- Precise Time: {{formatDate "HH:mm:ss"}}  {{~! Custom   }}
- Time and Timezone: {{formatDate "HH:mm:ss A z"}}
```

If the local time was 12:34:56 am, Pacific Standard Time, then the outputted file would read:

```md title="Time Example Instantiated File.md"
- Time of Creation: 12:34
- Precise Time: 12:34:56
- Time and Timezone: 12:34:56 AM PST
```

