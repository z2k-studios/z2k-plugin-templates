---
sidebar_position: 50
sidebar_class_name: z2k-code
---

# z2k_template_author
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Setting]] key allows you to assign an "author name" to the template file. This can be useful when sharing the template file with others (e.g. you can provide a link to your website in the `z2k_template_author` text).

This field will also be used whenever the [[Built-In Fields|Built-In Field]] `{{templateAuthor}}` is used within the template file. See [[Built-In Fields - Template Data#templateAuthor|templateAuthor]] for more details.

| Key Value | Result                                                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| string    | Specifies a string that represents the author of a template. It will be used to fill in references to the  `{{templateAuthor}}` builtin field. |

## Example
This sets the default title (filename) of an instantiated file to use a book's title and author name. 
```yaml
---
z2k_template_author : "This template was designed by Z2K Studios, (c) 2025"
---
```
