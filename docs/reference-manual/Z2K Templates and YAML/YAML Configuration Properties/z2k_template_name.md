---
sidebar_position: 40
sidebar_class_name: z2k-code
aliases:
- z2k_template_name
---
# z2k_template_name
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Property]] records which template was used to create a content file. The plugin sets this property automatically during [[Instantiation]] – it writes the source template's filename into this field so the content file retains a record of its origin.

## Purpose
The template name property is used in multiple ways:
- It can be used strictly as an informative breadcrumb pointing to which template was used to create a content file. This can be useful, for instance, in the event a template is updated, you can use this YAML property to track down all files created with that template. 
- It is also useful as a tool for auto-categorizing large parts of your vault. For instance, filter search results or topology graphs to include only those files that used your "Book Template" file is a quick way to hone in on your books. 
- It can be used as a data source that can be tested against. For instance, because `z2k_template_name` feeds data into the `{{templateName}}` built-in Field, you can make conditional text display based on the template name of the template when inserting a block.

## Built-In Field Linkage
This value is also used as the value for the `{{templateName}}` [[Built-In Fields|Built-In Field]]. See [[Built-In Fields - Template Data#templateName|templateName]] for more details.

## Valid Settings
The value must be a string. The plugin will throw an error if it encounters a non-string type.

| Value Type | Result                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| string     | Identifies the template that was used to create this file. Surfaces via the `{{templateName}}` built-in field. |


> [!NOTE] Rarely Set Manually
> In most cases, the plugin sets this property for you during instantiation. You would only set it manually if you need the `{{templateName}}` field to return a value different from the actual template filename – an uncommon scenario.

## Example
This overrides the template name stored in a content file:
```yaml
---
z2k_template_name: "Custom Log Template"
---
```

With this value, any reference to `{{templateName}}` in the file resolves to "Custom Log Template" regardless of the template's actual filename.

## Lifecycle Behavior
| Lifecycle Event | Effect on `z2k_template_name` |
| --------------- | ----------------------------- |
| [[Instantiation]] | Set to the source template's filename |
| [[Finalization]] | Kept – persists in the finalized content file |
| [[Block Templates\|Block Insert]] | Not affected |

This property persists through finalization because it serves as a permanent record of which template produced the file.