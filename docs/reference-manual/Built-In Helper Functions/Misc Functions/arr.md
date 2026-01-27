---
sidebar_position: 20
sidebar_class_name: z2k-code
sidebar_label: "{{arr}}"
---
# arr Helper

The `{{arr}}` helper creates an array from its arguments. This is useful for constructing arrays inline within templates, particularly for use with other helpers that expect array inputs.

## Syntax

```handlebars
{{arr item1 item2 item3 ...}}
```

Or as a subexpression:

```handlebars
(arr item1 item2 item3 ...)
```

## Parameters

| Parameter | Description |
| --------- | ----------- |
| `item1`, `item2`, ... | The items to include in the array. Can be strings, numbers, field references, or other values. |

## Return Value

Returns an array containing all the provided arguments.

## Examples

### Creating an Options List for field-info

The most common use of `arr` is to create options for `singleSelect` or `multiSelect` fields:

```handlebars
{{field-info priority type="singleSelect" options=(arr "Low" "Medium" "High" "Critical")}}
```

### Using with the random Helper

```handlebars
{{random (arr "Option A" "Option B" "Option C")}}
```

This randomly selects one item from the array.

### Creating Arrays from Field Values

```handlebars
{{field-info tag1 prompt="First tag"}}
{{field-info tag2 prompt="Second tag"}}
{{field-info tag3 prompt="Third tag"}}

tags: {{arr tag1 tag2 tag3}}
```

### Using with format-string-bulletize

```handlebars
{{format-string-bulletize (arr "First item" "Second item" "Third item")}}
```

Output:
```
- First item
- Second item
- Third item
```

## See Also

- [[obj]] for creating objects
- [[random]] for selecting a random item from an array
- [[format-string-bulletize]] for formatting arrays as bulleted lists
- [[field-info (Field Functions)]] for using arrays with field options
