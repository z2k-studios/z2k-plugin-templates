---
sidebar_position: 10
sidebar_class_name: z2k-code
aliases:
- z2k_template_default_fallback_handling
---
# z2k_template_default_fallback_handling
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Property]] sets the default fallback behavior for all fields in a template file – that is, what happens when a user does not provide a value for a field during [[Instantiation]] or [[Finalization]].

Without this property, each field's fallback behavior is determined by its own [[fieldInfo directives|directives]] or [[fieldInfo fallback|fallback]] parameter. Setting `z2k_template_default_fallback_handling` establishes a file-wide default so you don't have to repeat the same directive on every field.

## Valid Settings
The following values are supported (case-insensitive):

| Key Value            | Result |
| -------------------- | ------ |
| `finalize-preserve`  | If no value is provided for a field, the field expression is preserved as-is in the output file. The field remains available for later resolution via [[Continue filling note]]. |
| `finalize-clear`     | If no value is provided for a field, the field expression is removed from the output – replaced with an empty string. |
| `finalize-suggest`   | If no value is provided for a field, the value of the [[fieldInfo suggest\|suggest]] parameter (from a `{{fieldInfo}}` for that field) is used instead. If no `suggest` value exists, the field is cleared. |

## How It Works
The engine merges all YAML frontmatter sources (including [[Intro to System Blocks|System Blocks]]) using a last-wins strategy, then reads the final `z2k_template_default_fallback_handling` value. It applies the corresponding directive to every field that does not already have an explicit finalize directive (`finalize-clear`, `finalize-preserve`, or `finalize-suggest`) set via [[fieldInfo directives|fieldInfo]].

In other words, field-level directives always win. This property only fills in the gap for fields that haven't declared their own fallback behavior.

> [!NOTE] Fallback Behavior is More Than This
> Field-level [[fieldInfo directives|directives]] and [[fieldInfo fallback|fallback]] parameters in a [[reference-manual/fieldInfo Helper/fieldInfo Helper|fieldInfo]] statement override this file-level setting. For a complete picture of how fallback resolution works, see [[Fallback Behavior]].

## Example
This sets the default fallback for the entire template to clear any unfilled fields:
```yaml
---
z2k_template_default_fallback_handling: finalize-clear
---
```

With this setting, a field like `{{ProjectName}}` that receives no user input will be replaced with an empty string in the output file – unless that field has its own `finalize-preserve` or `finalize-suggest` directive via `{{fieldInfo}}`.

## Lifecycle Behavior
| Lifecycle Event | Effect on `z2k_template_default_fallback_handling` |
| --------------- | -------------------------------------------------- |
| [[Instantiation]] | Kept – the engine needs this value to process fields during the [[WIP Stage]] |
| [[Finalization]] | Deleted from the output file's YAML |
| [[Block Templates\|Block Insert]] | Deleted from the block's YAML |

The property is deliberately preserved through instantiation because field resolution may occur across multiple passes (see [[Deferred Field Resolution]]). Once finalization completes, the property is no longer needed and is removed.

