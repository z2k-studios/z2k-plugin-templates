---
sidebar_position: 5
sidebar_class_name: z2k-code
---

# z2k_template_type
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Property]] specifies the type of template file that this file represents.
## Valid Settings
The following key values are allowed for the z2k_template_type property:

| Key Value           | Result                  |
| ------------------- | ----------------------- |
| `content-file`      | (default)               |
| `document-template` | ==needs documentation== |
| `block-template`    |                         |
for z2k_template_type, please accept the following values:

[#1](https://github.com/z2k-studios/z2k-plugin-templates/issues/1) - `content-file` - indicates this is not a template at all, despite other indicators (formerly "normal")  
[#2](https://github.com/z2k-studios/z2k-plugin-templates/issues/2) - `document-template` - indicates this is a whole file template (formerly "named")  
[#3](https://github.com/z2k-studios/z2k-plugin-templates/issues/3) - `block-template` - indicates that this is a block template (formerly "partial")

## Example
This resets the default miss handling for this file to clear the field completely if no value is given. 
```yaml
---
z2k_template_type: "block"
---
```
