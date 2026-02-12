---
sidebar_position: 50
aliases:
- number formatting
- formatting numbers
---
# Formatting Numbers
Z2K Templates provides two helpers for formatting numeric values: [[format-number]] for general formatting with Numeral.js, and [[format-number-to-fixed]] for simple decimal place control.

## Available Helpers
![[Formatting Functions#Number Formatting Helpers]]

## Basic Usage

### format-number
Uses [Numeral.js](http://numeraljs.com/) format strings:

```handlebars
{{format-number fieldName "formatString"}}
```

### format-number-to-fixed
Rounds to a fixed number of decimal places:

```handlebars
{{format-number-to-fixed fieldName decimalPlaces}}
```

For complete syntax details, see [[format-number]] and [[format-number-to-fixed]].

## Common Format Patterns
Assuming a field `amount` with value `1234567.8912`:

### Thousands Separators

| Pattern | Output | Notes |
|---------|--------|-------|
| `0,0` | 1,234,568 | Rounded, with commas |
| `0,0.00` | 1,234,567.89 | Two decimal places |
| `0,0.0000` | 1,234,567.8912 | Four decimal places |

### Decimal Places

| Pattern | Output | Notes |
|---------|--------|-------|
| `0.0` | 1234567.9 | One decimal place |
| `0.00` | 1234567.89 | Two decimal places |
| `0.[00]` | 1234567.89 | Up to 2 decimals (trims trailing zeros) |

### Currency

| Pattern | Output | Notes |
|---------|--------|-------|
| `$0,0.00` | $1,234,567.89 | US dollars |
| `0,0.00€` | 1,234,567.89€ | Euros (symbol after) |
| `($0,0.00)` | $1,234,567.89 | Accounting format |

### Percentages
For a field with value `0.85`:

| Pattern | Output | Notes |
|---------|--------|-------|
| `0%` | 85% | Basic percentage |
| `0.0%` | 85.0% | One decimal place |
| `0.00%` | 85.00% | Two decimal places |

### Scientific Notation
For a field with value `1234567`:

| Pattern | Output |
|---------|--------|
| `0.00e+0` | 1.23e+6 |

### File Sizes
For a field with value `1048576` (bytes):

| Pattern | Output |
|---------|--------|
| `0 b` | 1 MB |
| `0.00 b` | 1.00 MB |

## Examples in Templates

### Invoice Line Item
```handlebars
{{field-info quantity type="number" prompt="Quantity?"}}
{{field-info unitPrice type="number" prompt="Unit price?"}}
{{field-info total type="number" value=(calc quantity "*" unitPrice) directives="no-prompt"}}

| Item | Qty | Price | Total |
|------|-----|-------|-------|
| Widget | {{quantity}} | {{format-number unitPrice "$0,0.00"}} | {{format-number total "$0,0.00"}} |
```

### Statistics Summary
```handlebars
{{field-info score type="number" prompt="Score (0-100)?"}}

Score: {{format-number-to-fixed score 1}}%
Normalized: {{format-number (calc score "/" 100) "0.00"}}
```

### Duration Tracking
```handlebars
{{field-info minutes type="number" prompt="Minutes spent?"}}

Time: {{format-number-to-fixed (calc minutes "/" 60) 2}} hours
```

## Handling Non-Numeric Values
If a field value isn't a valid number, the formatting helpers return the original value unchanged. No error is thrown, but the output won't be formatted.

> [!WARNING]
> When receiving data from external sources (URIs, JSON), ensure numeric fields are actually numbers, not strings. The string `"1,234"` won't format correctly – commas must be removed first.

> [!DANGER] Notes for Review
> - Verify the file size formatting (`0 b`) works as documented – this is a Numeral.js feature.
> - The `calc` helper is referenced but not yet documented. Ensure [[calc]] page exists.
> - Test behavior when field value is a string that looks like a number (e.g., `"1,123"`) - is the warning statement above correct?
