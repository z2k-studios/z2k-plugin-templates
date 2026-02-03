---
sidebar_position: 60
sidebar_class_name: z2k-code
aliases:
- z2k_template_version
---
# z2k_template_version
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Property]] assigns a version identifier to a template file. This is useful for distinguishing between content files created from different iterations of the same template – if you update a template's structure, bumping the version lets you tell at a glance which version produced a given note.

## Purpose
The template version property is used in multiple ways:
- If an error occurred in a template format, you can quickly filter to the [[z2k_template_name]] and [[z2k_template_version]] properties to find all those content files impacted
- If a template is upgraded, you can use the [[z2k_template_name]] and [[z2k_template_version]] properties to construct an upgrade path for older versions. 
- It can be used as a data source that can be tested against. For instance, a block template that makes use of [[Storing Field Values in YAML|Storing Fields in YAML]] can test the version number to ensure that the original template had all the fields you are expecting. 

## Built-In Field Linkage
This value is used whenever the `{{templateVersion}}` [[Built-In Fields|Built-In Field]] appears in the template. See [[Built-In Fields - Template Data#templateVersion|templateVersion]] for more details.

## Valid Settings
The value can be a string or a number (e.g. `"v1.2"` or `2`). Please be consistent. The plugin will throw an error if it encounters any other type.

| Value Type       | Result                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| string or number | Specifies the version of the template. Converted to a string internally. Surfaces via the `{{templateVersion}}` built-in field. |
## Example
This assigns a version to a template:
```yaml
---
z2k_template_version: "v1.1"
---
```

Any reference to `{{templateVersion}}` in the template or its instantiated content file will resolve to `v1.1`.

## Lifecycle Behavior
| Lifecycle Event | Effect on `z2k_template_version` |
| --------------- | -------------------------------- |
| [[Instantiation]] | Kept – carries over to the content file |
| [[Finalization]] | Kept – persists in the finalized content file |
| [[Block Templates\|Block Insert]] | Not affected |

This property persists through the full lifecycle as a permanent record of which template version produced the file.