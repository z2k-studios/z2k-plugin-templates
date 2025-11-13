---
sidebar_position: 20
sidebar_class_name: z2k-code
sidebar_label: "{{time}}"
---
# time Built-In Field
The `{{time}}` built-in field returns the current time. 

## Default Format
The default format for the `{{time}}` built-in field is `HH:mm` in the current timezone. You can override that using Obsidian style date formatting or with the [[format-date]] Built-In Helper Function. 

## Customizing the Format of time
![[date#Customizing the Format of date]]

## Example Output 
Given a template snippet of:
```md title="Time Example Template.md"
- Time of Creation: {{time}}       {{~! This uses the default formatting.    }}
- Precise Time: {{time:HH:mm:ss}}  {{~! This uses Obsidian Style formatting. }}
- Time and Timezone: {{format-date time "HH:mm:ss A z"}} {{~! This uses Handlebars style. }}
```

If the local time was 12:34:56 am, Pacific Standard Time, then the outputted file would read:

```md title="Time Example Instantiated File.md"
- Time of Creation: 12:34
- Precise Time: 12:34:56
- Time and Timezone: 12:34:56 AM PST
```

