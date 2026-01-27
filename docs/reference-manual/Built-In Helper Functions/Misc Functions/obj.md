---
sidebar_position: 30
sidebar_class_name: z2k-code
sidebar_label: "{{obj}}"
---
# obj Helper
The `{{obj}}` helper creates an object from hash (named) parameters. This allows you to construct objects inline within templates, useful for passing structured data to other helpers or storing complex values.

## Syntax

```handlebars
{{obj key1=value1 key2=value2 ...}}
```

Or as a subexpression:

```handlebars
(obj key1=value1 key2=value2 ...)
```

## Parameters

The helper uses Handlebars hash parameters (named arguments):

| Parameter | Description |
| --------- | ----------- |
| `key=value` | Each key-value pair becomes a property on the resulting object. Values can be strings, numbers, field references, or subexpressions. |

## Return Value

Returns an object containing all the provided key-value pairs.

## Examples

### Creating a Simple Object

```handlebars
{{obj name="John" age=30 city="New York"}}
```

This produces an object: `{ name: "John", age: 30, city: "New York" }`

### Using Field Values

```handlebars
{{field-info firstName prompt="First name"}}
{{field-info lastName prompt="Last name"}}

{{obj first=firstName last=lastName fullName=(format-string "{{value}} " firstName)}}
```

### Combining with arr for Complex Data

```handlebars
{{obj
  title="Project Status"
  items=(arr "Research" "Development" "Testing")
  priority="high"
}}
```

### Storing in YAML Frontmatter

Objects created with `obj` can be stored in YAML frontmatter fields:

```handlebars
---
metadata: {{obj author=creator date=date version="1.0"}}
---
```

## Notes

- Keys must be valid JavaScript identifiers (no spaces or special characters)
- Values are evaluated before being added to the object
- Nested objects can be created using subexpressions: `{{obj outer=(obj inner="value")}}`

## See Also

- [[arr]] for creating arrays
- [[field-info (Field Functions)]] for structured field definitions
