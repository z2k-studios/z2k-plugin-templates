---
sidebar_position: 10
sidebar_class_name: z2k-code
---

# z2k_template_default_miss_handling
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Setting]] specifies the default method that is used for handling data misses (i.e. when a user fails to provide data for a particular field). 

## Configuration Settings
The following key values are allowed for the [[z2k_template_default_miss_handling]] field:

| Key Value  | Result                                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `preserve` | (default) If a miss occurs for a field, the field will be preserved as is in the resultant                                                                                                                               |
| `clear`    | If a miss occurs for a field, it will clear the field from the result                                                                                                                                                    |
| `default`  | If a miss occurs for a field, it will use the value of the `default` response as specified in a `{{field-info}}` for the field. If no `default` has been provided, then it will clear the field from the resultant file. |

> [!TIP] Miss Handling is More Than This
> Note that field-level [[field-info directives|directives]] and [[field-info miss|miss]] parameters in a [[reference-manual/field-info Helper/field-info Helper|field-info]] statement can override these file-level requests. Please see [[Miss Handling]] for more details.

## Example
This resets the default miss handling for this file to clear the field completely if no value is given. 
```yaml
---
z2k_template_default_miss_handling: clear
---
```
