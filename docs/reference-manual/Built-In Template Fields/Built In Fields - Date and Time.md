---
sidebar_position: 42
---

# Date and Time
The following built-in date and time template fields can be used in templates:

| Field               | Value to be inserted                                         | Example *(assuming today is 2026-01-09)* |
| ------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| `{{date}}`          | Today's date (\*1)                                           | `2026-01-09`                             |
| `{{time}}`          | Current time in the format `HH:mm` (\*1)                     | `15:23`                                  |
| `{{today}}`         | Today's date (same as `{{date}}`)                            | `2026-01-09`                             |
| `{{yesterday}}`     | Yesterday's date                                             | `2026-01-08`                             |
| `{{tomorrow}}`      | Tomorrow's date                                              | `2026-01-10`                             |
| `{{timestamp}}`     | A full zettelkasten timestamp of the format `YYYYMMDDHHmmss` | `20260109185559`                         |
| `{{dayOfWeek}}`     | The name of the day of the week with the format `dddd`       | `Friday`                                 |
| `{{weekNum}}`       | The week number with the format `YYYY-[w]ww`                 | `2024-w02`                               |
| `{{yearMonth}}`     | The date with the format `YYYY-MM`                           | `2025-03`                                |
| `{{yearMonthName}}` | The date with the format `YYYY-MM MMMM`                      | `2025-09 September`                      |
| `{{yearQuarter}}`   | The current year and quarter with the format `YYYY-[Q]Q`     | `2025-Q1`                                |

(\*1) The `{{date}}` and `{{time}}` built-in fields perform identically to Obsidian's predefinited template variables with the same name. 

## Time and Date Formatting
- In keeping with Obsidian formatting, a optional time format string can be added with a `:` followed by a string of [Moment.js format tokens](https://momentjs.com/docs/#/displaying/format/). This formatting ability applies only to date and time fields.
- Examples:
	- `{{timestamp:YYYYMMDDhhmm}}` would result in `202601091314`
	- `{{date:YYYY-MM}}` would result in `2026-01`
	- `{{dayOfWeek:ddd}}` would result in `Fri`
- For more details and more advanced formatting, see [[Custom Field Formatting|Date and String Formatting]]

