---
sidebar_position: 30
sidebar_class_name: z2k-code
sidebar_label: "{{utcTime}}"
---
# utcTime Built-In Field
The `{{utcTime}}` built-in field returns the current time in UTC time (aka [Coordinated Universal Time](https://en.wikipedia.org/wiki/Coordinated_Universal_Time)).

## Default Format
The default format for the `{{utcTime}}` built-in field is `"HH:mm:ss Z"`. You can override that using Obsidian style date formatting or with the [[format-date]] Built-In Helper Function. 

## Customizing the Format of utcTime
To adjust the format of the built-in `{{utcTime}}` field, please use the [[format-date]] built-in Helper function. 

> [!TIP] Best to use the now built-in field for format-date
> When using `format-date` to alter the appearance of `{{utcTime}}`, we recommend using the `{{now}}` built-in field instead. Please see the [[format-date#Using format-date with sourceTimes other than Now|comment in the format-date]] reference page.


## Example Output 
Given a template snippet of:
```md title="utctime Example Template.md"
- Time of Creation: {{utcTime}}
- UTC Time: {{format-date "HH:mm:ss" now}}            {{~! Uses now instead }}
- UTC Timestamp: {{format-date "YYYYMMDDHHmmss" now}} {{~! Uses now instead }} 
```

If the local time was 2026-11-11, 12:34:56 am, Pacific Standard Time, then the outputted file would read:

```md title="utcTime Example Instantiated File.md"
- Time of Creation: 08:34:56 +00:00
- UTC Time: 08:34:56
- UTC Timestamp: 20261111083456
```

Note that the time has been changed to UTC time. This may cause a change in the date as well. 