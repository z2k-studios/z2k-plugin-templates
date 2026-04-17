---
sidebar_position: 20
sidebar_class_name: z2k-code
aliases:
- z2k_template_default_prompt
---
# z2k_template_default_prompt
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Property]] would specify a default prompt string to display for all fields in a template file. When set, every field that does not have its own [[fieldInfo prompt|prompt]] parameter would use this string as its prompt message.

The property supports the built-in placeholder `{{FieldName}}`, which would be replaced with each field's name at prompt time – allowing a single prompt string to serve as a dynamic default across all fields.

> [!WARNING] Not Yet Implemented
> This property is **not yet implemented** in the Z2K Templates codebase. It is documented here as a planned feature. Setting this property in your YAML frontmatter will have no effect.

## Planned Configuration

| Key                           | Value Type | Planned Result |
| ----------------------------- | ---------- | -------------- |
| `z2k_template_default_prompt` | string     | Sets a default prompt string for all fields that lack an explicit [[fieldInfo prompt\|prompt]] parameter |

> [!NOTE] Use fieldInfo for Specific Field Prompts
> To specify a prompt for a specific field (as opposed to all fields in a template file), use the [[fieldInfo prompt|prompt]] parameter of the [[reference-manual/fieldInfo Helper/fieldInfo Helper|fieldInfo]] helper function.

## Planned Example
This would set a custom default prompt for all fields in the file:
```yaml
---
z2k_template_default_prompt: "Please specify the value of {{FieldName}}"
---
```

With this setting, a field named `{{ProjectName}}` would display the prompt: "Please specify the value of ProjectName" – unless that field has its own prompt set via `{{fieldInfo}}`.

## Lifecycle Behavior
| Lifecycle Event                   | Expected Effect on `z2k_template_default_prompt` |
| --------------------------------- | ------------------------------------------------ |
| [[Instantiation]]                 | ==To be determined==                             |
| [[Finalization]]                  | ==To be determined==                             |
| [[Block Templates\|Block Insert]] | ==To be determined==                             |

> [!DANGER] INTERNAL NOTES
> - This property is not implemented in either `main.tsx` or the template engine (`src/main.ts`). No code reads, processes, or removes it.
> - The `{{FieldName}}` placeholder is not documented in [[Built-In Fields]]. If this feature is implemented, determine whether `{{FieldName}}` should be added there or treated as a special interpolation token specific to this property.