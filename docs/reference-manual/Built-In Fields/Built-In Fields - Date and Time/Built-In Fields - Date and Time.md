---
sidebar_position: 1
sidebar_folder_position: 10
sidebar_label: Date and Time
aliases:
- Date and Time
- Date and Time Built-Ins
---

# Date and Time
The following built-in date and time template fields can be used in templates:

| Field               | Link              | Value to be inserted                                         | Example *(assuming today is 2026-01-09)* |
| ------------------- | ----------------- | ------------------------------------------------------------ | ---------------------------------------- |
| `{{date}}`          | [[date]]          | Today's date (\*1)                                           | `2026-01-09`                             |
| `{{time}}`          | [[time]]          | Current time in the format `HH:mm` (\*1)                     | `15:23`                                  |
| `{{utcTime}}`       | [[utcTime]]       | Current time expressed in UTC time                           | `23:23:00 UTC`                           |
| `{{today}}`         | [[today]]         | Today's date (same as `{{date}}`)                            | `2026-01-09`                             |
| `{{yesterday}}`     | [[yesterday]]     | Yesterday's date                                             | `2026-01-08`                             |
| `{{tomorrow}}`      | [[tomorrow]]      | Tomorrow's date                                              | `2026-01-10`                             |
| `{{timestamp}}`     | [[timestamp]]     | A full zettelkasten timestamp of the format `YYYYMMDDHHmmss` | `20260109185559`                         |
| `{{dayOfWeek}}`     | [[dayOfWeek]]     | The name of the day of the week with the format `dddd`       | `Friday`                                 |
| `{{weekNum}}`       | [[weekNum]]       | The week number with the format `YYYY-[w]ww`                 | `2024-w02`                               |
| `{{year}}`          | [[year]]          | The current year                                             | `2025`                                   |
| `{{yearMonth}}`     | [[yearMonth]]     | The date with the format `YYYY-MM`                           | `2025-03`                                |
| `{{yearMonthName}}` | [[yearMonthName]] | The date with the format `YYYY-MM MMMM`                      | `2025-09 September`                      |
| `{{yearQuarter}}`   | [[yearQuarter]]   | The current year and quarter with the format `YYYY-[Q]Q`     | `2025-Q1`                                |

## Time and Date Formatting
There are two ways to adjust the format of these built-in date and time fields:
1. **Obsidian Style**: You can use Obsidian style formatting with the "`:`" qualifier followed by a string of [Moment.js format tokens](https://momentjs.com/docs/#/displaying/format/). 
2. **Handlebars Style**: You can also use the [[format-date]] built-in Helper function to specify a format string for the date. This is more consistent with the general Handlebars.js approach. 

Note: Both styles use  [moment.js](https://momentjs.com/docs/#/displaying/format/) syntax to specify their format strings. Tip: see this [alternative source for moment.js tokens](https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/) . For more details, see [[Custom Field Formatting#Obsidian Date-Time Formatting|Obsidian Date-Time Formatting]]

