---
sidebar_position: 10
sidebar_class_name: z2k-code
sidebar_label: "{{eq}}, {{ne}}, {{lt}}, {{gt}}, ..."
---
# Comparison Operators

Z2K Templates includes a set of comparison helper functions for use in conditional logic. These helpers compare two values and return a boolean (`true` or `false`).

## Available Comparison Operators

| Helper | Name | Returns `true` when... |
| ------ | ---- | ---------------------- |
| `{{eq a b}}` | Equal | `a` strictly equals `b` |
| `{{ne a b}}` | Not Equal | `a` does not strictly equal `b` |
| `{{lt a b}}` | Less Than | `a` is less than `b` |
| `{{lte a b}}` | Less Than or Equal | `a` is less than or equal to `b` |
| `{{gt a b}}` | Greater Than | `a` is greater than `b` |
| `{{gte a b}}` | Greater Than or Equal | `a` is greater than or equal to `b` |

## Syntax

```handlebars
{{eq value1 value2}}
{{ne value1 value2}}
{{lt value1 value2}}
{{lte value1 value2}}
{{gt value1 value2}}
{{gte value1 value2}}
```

## Usage with Conditionals

These operators are typically used with Handlebars `{{#if}}` blocks:

```handlebars
{{#if (eq status "active")}}
This content appears when status equals "active"
{{/if}}

{{#if (gt count 10)}}
Count is greater than 10
{{/if}}

{{#if (lte priority 3)}}
This is a high-priority item (priority 3 or lower)
{{/if}}
```

## Null Handling
- `eq` and `ne` work with `null` values (e.g., `{{eq value null}}` returns `true` if value is null)
- `lt`, `lte`, `gt`, and `gte` return `false` if either argument is `null`

## Examples

### Checking Field Values

```handlebars
{{field-info status type="singleSelect" options=(arr "draft" "review" "published")}}

{{#if (eq status "published")}}
**Published**: This document is live.
{{else if (eq status "review")}}
**In Review**: Awaiting approval.
{{else}}
**Draft**: Work in progress.
{{/if}}
```

### Numeric Comparisons

```handlebars
{{field-info score type="number"}}

{{#if (gte score 90)}}
Grade: A
{{else if (gte score 80)}}
Grade: B
{{else if (gte score 70)}}
Grade: C
{{else}}
Grade: Needs Improvement
{{/if}}
```

### Combining with Other Helpers

```handlebars
{{#if (eq (format-string-to-lower category) "urgent")}}
Priority handling required.
{{/if}}
```

## See Also

- [[Handlebars Support]] for more on conditional logic
- [[toBool]] for converting values to booleans
