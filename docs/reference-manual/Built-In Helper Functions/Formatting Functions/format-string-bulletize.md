---
sidebar_position: 180
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-bulletize}}"
---
# format-string-bulletize Helper
The `format-string-bulletize` Helper function will take a text and bulletize it (i.e. insert a `- ` at the beginning of each line.) This is particularly useful for multi-line text.

## Syntax

```
{{format-string-bulletize fieldname indent start end}}
```

where:
- `format-string-bulletize` is the predefined name of the helper function for bulletizing
- `fieldname` is the value to be bulletized. Can be a string (split on newlines), an array (each element becomes a bullet), or any other value (converted to a single bullet item).
- `indent` (optional) is an indentation *level* where each level adds 4 spaces before the `- ` bullet prefix. Defaults to `0` (no indentation, just `- `). If a string is provided instead of a number, it is used directly as the line prefix.
- `start` (optional) is a string prepended to the entire output
- `end` (optional) is a string appended to the entire output

Also supports named hash parameters: `{{format-string-bulletize value=fieldname indent=1 start="..." end="..."}}`

## Null Handling
If the value is null or undefined, the helper returns nothing.

## Examples

### Basic Usage
```handlebars
{{format-string-bulletize myList}}
```

If `myList` is `"Alpha\nBravo\nCharlie"`, outputs:
```md
- Alpha
- Bravo
- Charlie
```

### With Indentation Level
```handlebars
{{format-string-bulletize myList 1}}
```

Produces (each line indented by 4 spaces):
```md
    - Alpha
    - Bravo
    - Charlie
```

### With Start and End
The `start` and `end` parameters wrap the entire bulleted output — they are not added per line. This is useful for adding a header or trailing content around the list:
```handlebars
{{format-string-bulletize myList 0 "Shopping List:\n" "\nEnd of list"}}
```

If `myList` is `"Eggs\nMilk\nBread"`, outputs:
```md
Shopping List:
- Eggs
- Milk
- Bread
End of list
```

### With Custom Prefix (String Indent)
When `indent` is a string instead of a number, it replaces the default `- ` prefix entirely:
```handlebars
{{format-string-bulletize myList "* "}}
```

Outputs:
```md
* Alpha
* Bravo
* Charlie
```

### With Array Input
```handlebars
{{format-string-bulletize (arr "First" "Second" "Third")}}
```

Outputs:
```md
- First
- Second
- Third
```
