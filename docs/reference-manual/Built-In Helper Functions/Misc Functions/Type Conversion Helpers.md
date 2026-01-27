---
sidebar_position: 40
sidebar_class_name: z2k-code
sidebar_label: "{{toNumber}}, {{toBool}}, {{toString}}"
---
# Type Conversion Helpers

Z2K Templates provides helpers for explicitly converting values between types. These are useful when you need to ensure a value is treated as a specific type, particularly for comparisons or when passing values to helpers that expect specific types.

## Available Type Conversion Helpers

| Helper | Converts to | Description |
| ------ | ----------- | ----------- |
| `{{toNumber value}}` | Number | Converts the value to a number |
| `{{toBool value}}` | Boolean | Converts the value to a boolean |
| `{{toString value}}` | String | Converts the value to a string |

---

## toNumber

Converts a value to a number.

### Syntax

```handlebars
{{toNumber value}}
```

### Return Value

- Returns the numeric value if conversion succeeds
- Returns `null` if the value cannot be converted to a number (e.g., non-numeric strings)
- Returns `null` if the input is `null` or `undefined`

### Examples

```handlebars
{{toNumber "42"}}          {{! Returns: 42 }}
{{toNumber "3.14"}}        {{! Returns: 3.14 }}
{{toNumber "abc"}}         {{! Returns: null }}
{{toNumber true}}          {{! Returns: 1 }}
{{toNumber false}}         {{! Returns: 0 }}
```

### Use Case: Ensuring Numeric Comparisons

```handlebars
{{field-info userInput type="text"}}

{{#if (gt (toNumber userInput) 100)}}
Value exceeds maximum of 100.
{{/if}}
```

---

## toBool

Converts a value to a boolean. Uses generous parsing for common truthy/falsy string representations.

### Syntax

```handlebars
{{toBool value}}
```

### Return Value

Returns `true` for:
- Boolean `true`
- Strings: `"true"`, `"1"`, `"yes"`, `"y"`, `"on"`, `"enabled"`, `"enable"` (case-insensitive)

Returns `false` for:
- Boolean `false`
- `null` or `undefined`
- Any other value (including `"false"`, `"0"`, `"no"`, etc.)

### Examples

```handlebars
{{toBool "yes"}}           {{! Returns: true }}
{{toBool "YES"}}           {{! Returns: true }}
{{toBool "1"}}             {{! Returns: true }}
{{toBool "enabled"}}       {{! Returns: true }}
{{toBool "no"}}            {{! Returns: false }}
{{toBool "0"}}             {{! Returns: false }}
{{toBool ""}}              {{! Returns: false }}
```

### Use Case: Handling User Input

```handlebars
{{field-info enableFeature type="text" prompt="Enable feature? (yes/no)"}}

{{#if (toBool enableFeature)}}
Feature is enabled.
{{else}}
Feature is disabled.
{{/if}}
```

---

## toString

Converts a value to a string.

### Syntax

```handlebars
{{toString value}}
```

### Return Value

- Returns the string representation of the value
- Returns an empty string `""` if the input is `null` or `undefined`

### Examples

```handlebars
{{toString 42}}            {{! Returns: "42" }}
{{toString true}}          {{! Returns: "true" }}
{{toString null}}          {{! Returns: "" }}
```

### Use Case: Ensuring String Operations

```handlebars
{{field-info count type="number"}}

{{! Ensure count is treated as string for concatenation }}
ID-{{toString count}}
```

---

## See Also

- [[Comparison Operators]] for comparing values
- [[Arithmetic Operators]] for numeric operations
- [[format-number]] for formatting numbers as strings with specific patterns
