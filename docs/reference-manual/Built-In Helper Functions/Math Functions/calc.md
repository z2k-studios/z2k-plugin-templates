---
sidebar_position: 10
sidebar_class_name: z2k-code
sidebar_label: "{{calc}}"
---
# calc Helper
The `calc` helper evaluates a mathematical expression provided as a string and returns the numeric result. It uses the [math.js](https://mathjs.org/) library under the hood, giving you access to arithmetic operators, parentheses, exponents, trigonometric functions, constants, and more – all from within a template.

## Syntax

```
{{calc "expression"}}
```

where:
- `calc` is the predefined helper name for evaluating math expressions
- `expression` is a string containing a mathematical expression to evaluate

## Return Value
- Returns the numeric result of the expression
- Returns `null` if the expression is null, evaluates to a non-number, or contains a syntax error

Invalid expressions fail silently – they return `null` rather than causing a template error.

## Examples

### Basic Arithmetic
```handlebars
{{calc "5 * 3 + 10"}}       {{! Returns: 25 }}
{{calc "100 / 4"}}           {{! Returns: 25 }}
{{calc "(2 + 3) * (4 - 1)"}} {{! Returns: 15 }}
```

### Using with Fields
```handlebars
{{fieldInfo price type="number" prompt="Enter price"}}
{{fieldInfo taxRate type="number" suggest=0.08}}

{{! For complex expressions involving fields, use formatString to build the expression }}
Total: ${{calc (formatString price "\{{value}} * 1.08")}}
```

### Fractional Days with dateAdd
One common use is computing fractional day values for [[dateAdd]]:
```handlebars
One hour from now: {{dateAdd (calc "1/24")}}
Two hours from now: {{dateAdd (calc "2/24")}}
Ninety minutes from now: {{dateAdd (calc "1.5/24")}}
```

### Advanced Functions
The math.js library supports functions beyond basic arithmetic:
```handlebars
{{calc "sqrt(144)"}}         {{! Returns: 12 }}
{{calc "2^10"}}              {{! Returns: 1024 }}
{{calc "round(3.7)"}}        {{! Returns: 4 }}
{{calc "pi"}}                {{! Returns: 3.141592653589793 }}
```

## When to Use calc vs. Arithmetic Operators
For simple two-operand math, the [[Arithmetic Operators]] (`add`, `subtract`, `multiply`, `divide`) are more readable. Use `calc` when:
- The expression involves more than two operations
- You need parentheses for grouping
- You need advanced functions (sqrt, round, trig, etc.)
- You want to express the formula as a single readable string

## See Also
- [[Arithmetic Operators]] for simple two-operand math
- [[dateAdd]] for time offset calculations using fractional days
- [[formatNumber]] and [[formatNumberToFixed]] for formatting numeric output
