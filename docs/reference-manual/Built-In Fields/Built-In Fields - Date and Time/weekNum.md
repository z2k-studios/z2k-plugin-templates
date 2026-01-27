---
sidebar_position: 90
sidebar_class_name: z2k-code
sidebar_label: "{{weekNum}}"
---
# weekNum Built-In Field

The `{{weekNum}}` built-in field returns the current ISO week number as a two-digit value.

## Default Format
The default format for the `{{weekNum}}` built-in field is `WW`. This returns just the week number without the year, zero-padded to two digits.

## Syntax

```handlebars
{{weekNum}}
```

## Example Output

Given today's date is January 27, 2026:

```
05
```

## Use Cases

### Adding Week Context to Notes
Include the week number in frontmatter or note content:

```handlebars
---
created: {{date}}
week: {{weekNum}}
---
```

### Conditional Logic Based on Week
Use weekNum with comparison helpers for week-based logic:

```handlebars
{{#if (lt weekNum "10")}}
Early in the year (weeks 01-09)
{{else}}
{{#if (lt weekNum "27")}}
First half of the year
{{else}}
Second half of the year
{{/if}}
{{/if}}
```

### Building Custom Week Formats
Combine weekNum with other fields for custom formatting:

```handlebars
{{! Result: Week 05 of 2026 }}
Week {{weekNum}} of {{year}}

{{! Result: 2026/W05 }}
{{year}}/W{{weekNum}}
```

## Difference from yearWeek

| Field | Format | Example |
| ----- | ------ | ------- |
| `{{weekNum}}` | `WW` | `05` |
| `{{yearWeek}}` | `YYYY-[w]WW` | `2026-w05` |

Use `weekNum` when you only need the week number; use `yearWeek` when you need the full year-week identifier for sorting or unique identification.

## See Also

- [[yearWeek]] for the full year and week identifier
- [[year]] for just the year
- [[format-date]] for custom date formatting
- [[Built-In Fields - Date and Time]] for all date/time fields
