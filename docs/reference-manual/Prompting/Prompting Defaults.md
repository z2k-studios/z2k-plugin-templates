---
sidebar_position: 30
aliases:
- prompting defaults
- default prompting behavior
---
# Prompting Defaults
Every [[Template Fields|template field]] that appears in the [[Prompting Interface]] has a set of properties that control how it's presented and what happens when the user doesn't provide a value. When you don't explicitly configure a field with [[fieldInfo Helper|{{fieldInfo}}]], these defaults apply.

## Default Values
The following table shows what the prompting interface assumes when no `{{fieldInfo}}` is specified for a field:

| Property     | Default                        | Effect                                                        |
| ------------ | ------------------------------ | ------------------------------------------------------------- |
| `prompt`     | Auto-generated from field name | `camelCase` → "Camel Case", `HTTPServer` → "HTTP Server"      |
| `type`       | `text`                         | Renders as a multi-line text area                             |
| `suggest`    | Empty string                   | No pre-filled value                                           |
| `fallback`   | None                           | Determined by the [[Fallback Behavior]] procedure             |
| `opts`       | Empty                          | No options (only relevant for `singleSelect` / `multiSelect`) |
| `directives` | None                           | No special behavior                                           |
| `value`      | None                           | Field is not computed; user provides the value                |
For more information, please see the dedicated [[fieldInfo Helper]] documentation. 

## Prompt Label Generation
When no `prompt` parameter is set, the label shown to the user is derived from the field name using the following rules:
- The first character is capitalized
- `camelCase` boundaries are split with spaces: `projectName` → "Project Name"
- Acronym boundaries are preserved: `XMLParser` → "XML Parser", `HTTPServer` → "HTTP Server"

For example, the field `{{meetingAttendees}}` generates the label "Meeting Attendees" without any `{{fieldInfo}}` configuration.

## Overriding Defaults
Each default can be overridden independently using [[fieldInfo Helper|{{fieldInfo}}]]. You only need to specify the properties you want to change – everything else keeps its default.

### Override the prompt label
```md
{{fieldInfo meetingAttendees prompt="Who attended the meeting?"}}
```

### Override the type
```md
{{fieldInfo priority type="singleSelect" opts="Low,Medium,High,Critical"}}
```

### Override the suggest value
```md
{{fieldInfo author suggest="{{creator}}"}}
```

### Override fallback behavior
```md
{{fieldInfo status fallback="Draft"}}
```

### Combine multiple overrides
```md
{{fieldInfo dueDate prompt="When is this due?" type="date" suggest="{{date}}" fallback="TBD"}}
```

See [[fieldInfo Parameters]] for the full parameter reference.

## See Also
- [[fieldInfo Parameters]] – Complete parameter documentation
- [[Prompting Interface]] – How the prompting modal works
- [[Fallback Behavior]] – What happens when no value is provided

> [!DANGER] Notes for Documentation Team
> - The `formatFieldName()` function is at `src/main.tsx` ~line 3895. The regex-based splitting handles camelCase and acronym boundaries. Verify edge cases like single-letter fields or all-caps names.
> - The "auto-generated from field name" default for `prompt` is applied via `formatFieldName(fieldName)` as a fallback in `computeInitialFieldStates()` and again in `updateFieldStates()`.
