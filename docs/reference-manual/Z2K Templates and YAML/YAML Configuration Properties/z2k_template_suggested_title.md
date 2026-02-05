---
sidebar_position: 30
sidebar_class_name: z2k-code
aliases:
- z2k_template_suggested_title
---
# z2k_template_suggested_title
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Property]] specifies a suggested title (filename) for the content file created when a template is instantiated. The value is a string that can include `{{field}}` references – after all fields have been prompted for, the plugin evaluates this string and pre-fills it as the suggested filename.

This is the most convenient way to give your templates meaningful default filenames. Instead of getting a generic title, users see a context-aware suggestion built from the data they just entered.

## Valid Settings

| Value Type | Result |
| ---------- | ------ |
| string     | Used as the suggested filename for the new content file. May contain `{{field}}` references that resolve after prompting. |

The value must be a string. The plugin will throw an error if it encounters a non-string type.

> [!NOTE] Equivalent to field-info on fileTitle
> This property is equivalent to using [[reference-manual/field-info Helper/field-info Helper|field-info]] to set the [[field-info suggest|suggest]] value for the built-in [[fileTitle and Variations|fileTitle]] field. We find the `z2k_templated_suggested_title` approach to be far more readable.

## Example
This sets the suggested title of an instantiated file to combine a book's title and author:
```yaml
---
z2k_template_suggested_title: "{{BookTitle}} - {{BookAuthor}}"
---
```

If the user enters "Neuromancer" for `{{BookTitle}}` and "William Gibson" for `{{BookAuthor}}`, the plugin suggests the filename: `Neuromancer - William Gibson`.

## Lifecycle Behavior
| Lifecycle Event | Effect on `z2k_template_suggested_title` |
| --------------- | ---------------------------------------- |
| [[Instantiation]] | Deleted – the title suggestion is consumed and no longer needed |
| [[Finalization]] | N/A (already removed) |
| [[Block Templates\|Block Insert]] | Deleted from the block's YAML |

The property is removed immediately at instantiation because it serves no purpose after the filename has been determined.