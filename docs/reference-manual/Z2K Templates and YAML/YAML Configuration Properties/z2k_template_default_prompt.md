---
sidebar_position: 20
sidebar_class_name: z2k-code
---

# z2k_template_default_prompt
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Setting]] specifies the default prompt to use for all fields in a file. ==This can use the built-in field `{{FieldName}}` to reference the field's name inside the specified prompt string.==

## Configuration Settings

| Key                           | Key Value | Result                            |
| ----------------------------- | --------- | --------------------------------- |
| `z2k_template_default_prompt` | string    | Specifies a prompt string to use. |


> [!NOTE] Use field-info for specific field prompts
> To specify a prompt for a specific field (as opposed to all fields in a template file), use the [[field-info Helper|field-info]] silent helper function. 


## Example
This sets a custom default prompt for all fields in this file. 
```yaml
---
z2k_template_default_prompt : "Please specify the value of {{FieldName)}}"
---
```


> [!DANGER] Notes
> is `{{FieldName}}` allowable? If so, do we need to add it to the [[Built-In Fields]] section?
