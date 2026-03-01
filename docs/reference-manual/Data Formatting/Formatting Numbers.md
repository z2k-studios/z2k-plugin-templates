---
sidebar_position: 50
aliases:
- number formatting
- formatting numbers
---
# Formatting Numbers
Z2K Templates provides two helpers for formatting numeric values: [[formatNumber]] for general formatting with Numeral.js, and [[formatNumberToFixed]] for simple decimal place control.

## Available Helpers
![[Formatting Functions#Number Formatting Helpers]]

## Basic Usage

### formatNumber
Uses [Numeral.js](http://numeraljs.com/) format strings:

```handlebars
{{formatNumber fieldName "formatString"}}
```

### formatNumberToFixed
Rounds to a fixed number of decimal places:

```handlebars
{{formatNumberToFixed fieldName decimalPlaces}}
```

For complete syntax details, see [[formatNumber]] and [[formatNumberToFixed]].

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
{{fieldInfo quantity type="number" prompt="Quantity?"}}
{{fieldInfo unitPrice type="number" prompt="Unit price?"}}
{{fieldInfo total type="number" value=(calc quantity "*" unitPrice) directives="no-prompt"}}

| Item | Qty | Price | Total |
|------|-----|-------|-------|
| Widget | {{quantity}} | {{formatNumber unitPrice "$0,0.00"}} | {{formatNumber total "$0,0.00"}} |
```

### Statistics Summary
```handlebars
{{fieldInfo score type="number" prompt="Score (0-100)?"}}

Score: {{formatNumberToFixed score 1}}%
Normalized: {{formatNumber (calc score "/" 100) "0.00"}}
```

### Duration Tracking
```handlebars
{{fieldInfo minutes type="number" prompt="Minutes spent?"}}

Time: {{formatNumberToFixed (calc minutes "/" 60) 2}} hours
```

## Handling Non-Numeric Values
If a field value isn't a valid number, the formatting helpers return the original value unchanged. No error is thrown, but the output won't be formatted.

> [!WARNING]
> When receiving data from external sources (URIs, JSON), ensure numeric fields are actually numbers, not strings. The string `"1,234"` won't format correctly – commas must be removed first.

> [!DANGER] INTERNAL NOTES
> - Verify the file size formatting (`0 b`) works as documented – this is a Numeral.js feature.
> - The `calc` helper is referenced but not yet documented. Ensure [[calc]] page exists.
> - Test behavior when field value is a string that looks like a number (e.g., `"1,123"`) - is the warning statement above correct?
