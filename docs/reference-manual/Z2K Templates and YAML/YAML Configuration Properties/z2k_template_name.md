---
sidebar_position: 40
sidebar_class_name: z2k-code
---
# z2k_template_name
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Setting]] specifies the name of the template to use for the `{{templateName}}` [[templateName|Built-In Field]] , overriding the actual name.  This will likely be used except for unusual circumstances where the template name needs to be different than the actual name.

## Configuration Settings

| Key Value | Result                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------ |
| string    | Specifies a string to use as the title of the template for the `{{templateName}}` builtin field. |

## Example
This sets the default title (filename) of an instantiated file to use a book's title and author name. 
```yaml
---
z2k_template_name : "Custom Log Template"
---
```
