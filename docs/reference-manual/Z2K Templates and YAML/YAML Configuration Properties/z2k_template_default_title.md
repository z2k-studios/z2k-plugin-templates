---
sidebar_position: 30
sidebar_class_name: z2k-code
---

# z2k_template_suggested_title
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Setting]] specifies the suggested title to use for the instantiated content file upon creation. 

## Configuration Settings

| Key Value | Result                                                                                    |
| --------- | ----------------------------------------------------------------------------------------- |
| string    | Specifies a string to use as the title of a card after all fields have been prompted for. |

> [!NOTE] Equivalent to using field-info on fileTitle
> This YAML field is the equivalent to using [[field-info]] to set the [[field-info suggest|suggest]] value for the built-in [[fileTitle and Variations|fileTitle]] field - but is a much easier and readable way to do it. 


## Example
This sets the suggested title (filename) of an instantiated file to use a book's title and author name. 
```yaml
---
z2k_template_suggested_title : "{{BookTitle}} - {{BookAuthor}}"
---
```
