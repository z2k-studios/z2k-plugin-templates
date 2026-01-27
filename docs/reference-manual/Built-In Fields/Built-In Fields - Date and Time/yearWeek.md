---
sidebar_position: 110
sidebar_class_name: z2k-code
sidebar_label: "{{yearWeek}}"
---
# yearWeek Built-In Field
The `{{yearWeek}}` built-in field returns the current year and ISO week number, formatted for use in weekly planning, logs, or organizational structures.

## Default Format
The default format for the `{{yearWeek}}` built-in field is `YYYY-[w]WW`. This format is useful for assigning items to a specific week of the year in a manner that is sortable. Businesses frequently refer to this style as the "work week number".

## Syntax

```handlebars
{{yearWeek}}
```

## Example Output

Given today's date is January 27, 2026:

```
2026-w05
```

## Use Cases

### Weekly Note Naming
Use `yearWeek` to create weekly notes with consistent naming:

```handlebars
{{field-info fileTitle default="{{yearWeek}}" directives="finalize-default"}}

# Weekly Review: {{yearWeek}}

## Goals for This Week
-

## Accomplishments
-

## Next Week
-
```

This would create a note titled `Weekly Review 2026-w05.md`.

### Organizing by Week
Add week identifiers to frontmatter for filtering and organization:

```handlebars
---
created: {{date}}
week: {{yearWeek}}
year: {{year}}
---
```

### Linking to Weekly Notes
Reference weekly notes using the yearWeek format:

```handlebars
Related to: {{wikilink yearWeek}}
```

## Customizing the Format
To adjust the format of the week display, use the [[format-date]] built-in helper function with [[now]] as the source:

```handlebars
{{! Default format: 2026-w05 }}
{{yearWeek}}

{{! Alternative: Week 5 of 2026 }}
Week {{format-date "W" now}} of {{year}}

{{! Alternative: 2026/W05 }}
{{format-date "YYYY/[W]WW"}}
```

## Difference from weekNum

| Field | Format | Example |
| ----- | ------ | ------- |
| `{{yearWeek}}` | `YYYY-[w]WW` | `2026-w05` |
| `{{weekNum}}` | `WW` | `05` |

Use `yearWeek` when you need the full year-week identifier; use `weekNum` when you only need the week number.

## See Also

- [[weekNum]] for just the week number
- [[year]] for just the year
- [[format-date]] for custom date formatting
- [[Built-In Fields - Date and Time]] for all date/time fields
