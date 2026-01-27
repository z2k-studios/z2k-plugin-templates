---
sidebar_position: 1
sidebar_folder_position: 10
sidebar_label: Date and Time
aliases:
- Date and Time
- Date and Time Built-Ins
---
# Date and Time Built-In Fields

## Overview
The following built-in date and time template fields can be used in templates:

| Field               | Doc Link          | Value to be inserted                                         | Example *(assuming today is 2026-01-09)* |
| ------------------- | ----------------- | ------------------------------------------------------------ | ---------------------------------------- |
| `{{date}}`          | [[date]]          | Today's date (\*1)                                           | `2026-01-09`                             |
| `{{time}}`          | [[time]]          | Current time in the format `HH:mm` (\*1)                     | `15:23`                                  |
| `{{now}}`           | [[now]]           | Today's date and time                                        | `Friday, January 9, 2026 11:23 PM`       |
| `{{utcTime}}`       | [[utcTime]]       | Current time expressed in UTC time                           | `23:23:00 UTC`                           |
| `{{today}}`         | [[today]]         | Today's date (same as `{{date}}`)                            | `2026-01-09`                             |
| `{{yesterday}}`     | [[yesterday]]     | Yesterday's date                                             | `2026-01-08`                             |
| `{{tomorrow}}`      | [[tomorrow]]      | Tomorrow's date                                              | `2026-01-10`                             |
| `{{timestamp}}`     | [[timestamp]]     | A full zettelkasten timestamp of the format `YYYYMMDDHHmmss` | `20260109185559`                         |
| `{{dayOfWeek}}`     | [[dayOfWeek]]     | The name of the day of the week with the format `dddd`       | `Friday`                                 |
| `{{weekNum}}`       | [[weekNum]]       | The ISO week number with the format `WW`                     | `05`                                     |
| `{{year}}`          | [[year]]          | The current year                                             | `2025`                                   |
| `{{yearWeek}}`      | [[yearWeek]]      | The current year and ISO week with the format `YYYY-[w]WW`   | `2026-w02`                               |
| `{{yearMonth}}`     | [[yearMonth]]     | The date with the format `YYYY-MM`                           | `2025-03`                                |
| `{{yearMonthName}}` | [[yearMonthName]] | The date with the format `YYYY-MM MMMM`                      | `2025-09 September`                      |
| `{{yearQuarter}}`   | [[yearQuarter]]   | The current year and quarter with the format `YYYY-[Q]Q`     | `2025-Q1`                                |


## Date Formatting
If one of the premade date + formats above is insufficient for your needs, you can use the [[format-date]] built-in Helper function to specify an alternative format string for the date. This is more consistent with the general Handlebars.js approach. 

## Obsidian Style Date Formatting
Please note that Obsidian introduced a formatting style in which a date was followed by a colon and then an unquoted string of [Moment.js format tokens](https://momentjs.com/docs/#/displaying/format/). We have elected to NOT support this format style inside Z2K Templates, as it is not valid [[Handlebars Support|Handlebars]] syntax.

