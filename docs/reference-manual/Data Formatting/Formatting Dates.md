---
sidebar_position: 40
aliases:
- date formatting
- formatting dates
- time formatting
---
# Formatting Dates
Dates in Z2K Templates are stored as strings – not as JavaScript Date objects. This has practical consequences for how you format, compare, and manipulate them. This page covers both the basics of how dates work in Z2K Templates and the common patterns for displaying them.

## Contents
- [[#How Dates Work in Z2K Templates]]
- [[#Customizing Date Formats with formatDate]]
- [[#Common Format Patterns]]
- [[#Working with Date Sources]]
- [[#Date Arithmetic with dateAdd]]
- [[#Important: Time Truncation Pitfalls]]
- [[#Obsidian Date Syntax Not Supported]]

## How Dates Work in Z2K Templates
Z2K Templates has a [[Field Types#Dates Are Strings — Handle with Care|loose type system]] – all date and time values are ultimately strings. The `date` and `datetime` [[Field Types|field types]] affect the prompting UI (showing a date picker instead of a text input), but the captured value enters the template as text like `"2025-01-14"` or `"2025-01-14T14:30:00"`.

This means:
- Built-in fields like `{{date}}` output strings in `YYYY-MM-DD` format
- Built-in fields like `{{time}}` output strings in `HH:mm` format
- User-provided dates pass through as-is from the source data
- The `{{now}}` field is a fully qualified ISO timestamp with full precision

To display dates in formats other than their default string representation, use the `formatDate` helper.

## Customizing Date Formats with formatDate
The [[formatDate]] helper formats a date value using [Moment.js syntax](https://momentjs.com/docs/#/displaying/format/):

```handlebars
{{formatDate "YYYY-MM-DD"}}
{{formatDate "dddd, MMMM Do" now}}
```

The helper takes a quoted format string and an optional source time. If no source is specified, `{{now}}` is used.

> [!NOTE]
> Z2K Templates does **not** support Obsidian's date formatting syntax (`{{date:YYYY-MM-DD}}`). This syntax is invalid Handlebars and will cause parsing errors. Use the `formatDate` helper instead – see [[#Obsidian Date Syntax Not Supported|below]].

For complete syntax details, see [[formatDate]].

## Common Format Patterns
Here are frequently-used date formats (assuming the date is January 14, 2025):

### Dates

| Pattern | Output | Use Case |
|---------|--------|----------|
| `YYYY-MM-DD` | 2025-01-14 | ISO standard, file naming, sorting |
| `MM/DD/YYYY` | 01/14/2025 | US conventional |
| `DD/MM/YYYY` | 14/01/2025 | European conventional |
| `MMMM D, YYYY` | January 14, 2025 | Formal documents |
| `MMM D, YYYY` | Jan 14, 2025 | Abbreviated formal |
| `dddd, MMMM Do` | Tuesday, January 14th | Full weekday with ordinal |
| `ddd, MMM D` | Tue, Jan 14 | Compact with weekday |

### Times

| Pattern | Output | Use Case |
|---------|--------|----------|
| `HH:mm` | 14:30 | 24-hour (default) |
| `h:mm A` | 2:30 PM | 12-hour with AM/PM |
| `HH:mm:ss` | 14:30:45 | With seconds |

### Combined

| Pattern | Output |
|---------|--------|
| `YYYY-MM-DD HH:mm` | 2025-01-14 14:30 |
| `LLLL` | Tuesday, January 14, 2025 2:30 PM |
| `lll` | Jan 14, 2025 2:30 PM |

### Special Formats

| Pattern | Output | Notes |
|---------|--------|-------|
| `YYYY-[Q]Q` | 2025-Q1 | Quarter (brackets escape literal text) |
| `YYYY-[W]WW` | 2025-W03 | ISO week number |
| `X` | 1736871045 | Unix timestamp (seconds) |
| `x` | 1736871045000 | Unix timestamp (milliseconds) |

## Working with Date Sources
The `formatDate` helper accepts different date sources as its second parameter:

### The now Field
`{{now}}` represents the current moment with full precision – date, time, and timezone:

```handlebars
{{formatDate "YYYY-MM-DD HH:mm:ss" now}}
```

This is the **recommended** source for most formatting because it preserves complete temporal information.

### Built-In Date Fields
Z2K Templates provides convenience fields for common dates:

| Field | Description |
|-------|-------------|
| `{{now}}` | Current moment (full precision) |
| `{{date}}` | Today's date (YYYY-MM-DD format) |
| `{{time}}` | Current time (HH:mm format) |
| `{{yesterday}}` | Yesterday's date |
| `{{tomorrow}}` | Tomorrow's date |
| `{{year}}` | Current year |
| `{{dayOfWeek}}` | Current day name |

See [[Built-In Fields]] for the complete list.

### User-Provided Dates
Dates from user prompts or external data sources are passed as strings. These work with `formatDate`, but see the [[#Important: Time Truncation Pitfalls|time truncation warning]] below.

## Date Arithmetic with dateAdd
To format dates other than today, use the [[dateAdd]] helper to offset from `{{now}}`:

```handlebars
{{formatDate "YYYY-MM-DD" (dateAdd -7)}}
```

This formats the date 7 days ago. The `dateAdd` helper accepts:

- Days: `(dateAdd 5)` or `(dateAdd -5)`
- Explicit units: `(dateAdd 2 "weeks")`, `(dateAdd 1 "month")`

### Examples

```handlebars
{{!-- Next Monday --}}
{{formatDate "YYYY-MM-DD" (dateAdd 1 "week")}}

{{!-- End of current month --}}
{{formatDate "MMMM Do" (dateAdd 1 "month" (dateAdd -1 "day"))}}

{{!-- Same day last year --}}
{{formatDate "MMMM D, YYYY" (dateAdd -1 "year")}}
```

## Important: Time Truncation Pitfalls
Because dates are stored as strings, time-of-day information can be lost when a date string is parsed back into a date object.

### The Problem
The built-in fields `{{yesterday}}` and `{{tomorrow}}` are stored as date strings (e.g., `2025-01-13`) without time components. If you try to format them with time patterns:

```handlebars
{{formatDate "HH:mm" yesterday}}
```

You'll get `00:00` – not a meaningful time.

### The Solution
For dates other than today that need time precision, use `{{dateAdd}}` from `{{now}}` instead of the convenience fields:

```handlebars
{{!-- Correct: preserves time information --}}
{{formatDate "YYYY-MM-DD HH:mm" (dateAdd -1)}}

{{!-- Problematic: time is truncated --}}
{{formatDate "YYYY-MM-DD HH:mm" yesterday}}
```

### When It Doesn't Matter
If you're only formatting the date portion (no time), the convenience fields work fine:

```handlebars
{{!-- This is fine --}}
{{formatDate "dddd, MMMM Do" yesterday}}
```

## Obsidian Date Syntax Not Supported
Z2K Templates does **not** support Obsidian's native date formatting syntax:

```handlebars
{{!-- This will NOT work --}}
{{date:YYYY-MM-DD}}
```

This syntax is invalid Handlebars – the colon makes Handlebars interpret `YYYY-MM-DD` as a property path, which fails. Use `formatDate` instead:

```handlebars
{{!-- Use this instead --}}
{{formatDate "YYYY-MM-DD"}}
```

> [!DANGER] Notes for Review
> - Verify the dateAdd examples work as documented – particularly the nested `dateAdd` for end-of-month.
> - The "Same day last year" example may not handle leap years correctly. Consider noting this.
> - Test that `{{date}}` vs `{{now}}` behave as described regarding time precision.
> - Verify that user-provided date fields truly pass through as-is vs. having any parsing applied.
