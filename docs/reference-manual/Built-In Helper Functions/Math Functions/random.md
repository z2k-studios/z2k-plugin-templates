---
sidebar_position: 30
sidebar_class_name: z2k-code
sidebar_label: "{{random}}"
---
# random Helper
The `random` helper selects one element at random from an array. This is useful for adding variety to templated content – rotating quotes, assigning random categories, or picking a default from a set of options.

## Syntax

```
{{random array}}
```

where:
- `random` is the predefined helper name for random selection
- `array` is an array of values to choose from. Use the [[arr]] helper to construct arrays inline.

## Return Value
- Returns a single randomly selected element from the array
- Returns `null` if the input is not an array or the array is empty

## Examples

### Basic Usage
```handlebars
{{random (arr "Alpha" "Bravo" "Charlie")}}
```

This outputs one of `Alpha`, `Bravo`, or `Charlie` at random each time the template is rendered.

### Random Default Value
```handlebars
{{fieldInfo greeting value=(random (arr "Hello" "Salutations" "Greetings" "Good day"))}}
{{greeting}}, and welcome to today's note.
```

### Using with Field Values
```handlebars
{{fieldInfo reviewer1 prompt="First reviewer"}}
{{fieldInfo reviewer2 prompt="Second reviewer"}}
{{fieldInfo reviewer3 prompt="Third reviewer"}}

Selected reviewer: {{random (arr reviewer1 reviewer2 reviewer3)}}
```

### Random with Fallback
```handlebars
{{fieldInfo mood suggest=(random (arr "contemplative" "energetic" "curious" "serene"))}}
Current mood: {{mood}}
```

The user sees the randomly selected suggestion in the prompt but can change it.

## See Also
- [[arr]] for constructing arrays
- [[fieldInfo suggest|suggest parameter]] for pre-filling prompts with suggested values
