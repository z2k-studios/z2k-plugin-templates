---
sidebar_position: 60
sidebar_class_name: z2k-code
---
# z2k_template_version
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Setting]] specifies the version of the template. This is useful to help distinguish between files created from different versions of the same template file.  

This setting is used as the value for the [[Built-In Fields|Built-In Field]] `{{templateVersion}}`. See [[templateVersion]] for more details.

| Key Value | Result                                                                                                                                                    |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| string    | Specifies a string that represents the version number of the template. It will be used to fill in references to the  `{{templateVersion}}` builtin field. |
## Example
This sets the default title (filename) of an instantiated file to use a book's title and author name. 
```yaml
---
z2k_template_version : "v1.1"
---
```
