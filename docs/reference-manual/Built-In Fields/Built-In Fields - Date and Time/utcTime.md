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
![[date#Customizing the Format of date]]

## Example Output 
Given a template snippet of:
```md title="utctime Example Template.md"
- Time of Creation: {{utcTime}}
- UTC Time: {{utcTime:HH:mm:ss}}
- UTC Timestamp: {{format-date utcTime "YYYYMMDDHHmmss"}} 
```

If the local time was 2026-11-11, 12:34:56 am, Pacific Standard Time, then the outputted file would read:

```md title="utcTime Example Instantiated File.md"
- Time of Creation: 08:34:56 +00:00
- UTC Time: 08:34:56
- UTC Timestamp: 20261111083456
```

Note that the time has been changed to UTC time. This may cause a change in the date as well. 