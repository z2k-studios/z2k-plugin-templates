---
sidebar_position: 10
sidebar_class_name: z2k-code
---

# z2k_template_default_fallback_handling
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Setting]] specifies the default fallback behavior (i.e. what happens when a user fails to provide data for a particular field). 

## Configuration Settings
The following key values are allowed for the [[z2k_template_default_fallback_handling]] field:

| Key Value            | Result                                                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `finalize-preserve`  | (default) If no value is provided for a field, the field will be preserved as-is in the resultant file.                                                                                                                 |
| `finalize-clear`     | If no value is provided for a field, it will clear the field from the result.                                                                                                                                           |
| `finalize-suggest`   | If no value is provided for a field, it will use the value of the `suggest` parameter as specified in a `{{field-info}}` for the field. If no `suggest` has been provided, then it will clear the field from the resultant file. |

> [!TIP] Fallback Behavior is More Than This
> Note that field-level [[field-info directives|directives]] and [[field-info fallback|fallback]] parameters in a [[reference-manual/field-info Helper/field-info Helper|field-info]] statement can override these file-level settings. Please see [[Fallback Behavior]] for more details.

## Example
This resets the default fallback behavior for this file to clear the field completely if no value is given.
```yaml
---
z2k_template_default_fallback_handling: finalize-clear
---
```
