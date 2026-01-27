---
sidebar_position: 20
sidebar_class_name: z2k-code
sidebar_label: "Arithmetic Operators"
---
# Arithmetic Operators

Z2K Templates includes basic arithmetic helper functions for performing simple math operations on numeric values.

## Available Arithmetic Operators

| Helper | Operation | Description |
| ------ | --------- | ----------- |
| `{{add a b}}` | Addition | Returns `a + b` |
| `{{subtract a b}}` | Subtraction | Returns `a - b` |
| `{{multiply a b}}` | Multiplication | Returns `a * b` |
| `{{divide a b}}` | Division | Returns `a / b` |

## Syntax

```handlebars
{{add value1 value2}}
{{subtract value1 value2}}
{{multiply value1 value2}}
{{divide value1 value2}}
```

Or as subexpressions for chaining:

```handlebars
(add value1 value2)
(subtract value1 value2)
(multiply value1 value2)
(divide value1 value2)
```

## Parameters

| Parameter | Description |
| --------- | ----------- |
| `value1` | The first operand (converted to number) |
| `value2` | The second operand (converted to number) |

## Return Value

Returns the result of the arithmetic operation as a number.

## Special Cases

- **Division by zero**: `{{divide x 0}}` returns `null`
- **Non-numeric inputs**: Values are converted to numbers using JavaScript's `Number()` function
- **Default values**: If arguments are missing, `add`, `subtract`, and `multiply` default to `0`; `divide` defaults the divisor to `1`

## Examples

### Basic Arithmetic

```handlebars
{{field-info quantity type="number" prompt="Enter quantity"}}
{{field-info price type="number" prompt="Enter price"}}

Total: ${{multiply quantity price}}
```

### Chaining Operations

For more complex calculations, chain operations using subexpressions:

```handlebars
{{field-info subtotal type="number"}}
{{field-info taxRate type="number" default=0.08}}

Tax: ${{multiply subtotal taxRate}}
Total: ${{add subtotal (multiply subtotal taxRate)}}
```

### Calculating Percentages

```handlebars
{{field-info completed type="number"}}
{{field-info total type="number"}}

Progress: {{multiply (divide completed total) 100}}%
```

### Incrementing Values

```handlebars
{{field-info version type="number" default=1}}

Next version: {{add version 1}}
```

## When to Use calc Instead

For complex mathematical expressions, consider using [[calc]] instead:

```handlebars
{{! Simple: use arithmetic operators }}
{{add (multiply 5 3) 10}}

{{! Complex: use calc }}
{{calc "(5 * 3 + 10) / 2"}}
```

The `calc` helper supports full mathematical expressions including parentheses, exponents, and functions, making it better suited for complex calculations.

## See Also

- [[calc]] for complex mathematical expressions
- [[toNumber]] for converting values to numbers
- [[format-number]] for formatting numeric output
- [[format-number-to-fixed]] for controlling decimal places
