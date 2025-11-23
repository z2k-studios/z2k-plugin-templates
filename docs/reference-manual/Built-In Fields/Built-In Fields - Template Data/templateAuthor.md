---
sidebar_position: 30
sidebar_label: "{{templateAuthor}}"
sidebar_class_name: z2k-code
aliases:
- templateAuthor Built-In Field
---
# templateAuthor

Like [[templateName]], the `{{templateAuthor}}` built-in field will be filled in with the author name of the template used to create a file. 

Note: A template uses the [[YAML Configuration Properties|YAML entry]] `z2k_template_author` to specify its current version.


> [!TIP] Why? Attribution, of course
> Template files can be exchanged with others. If a template author wishes to attach their name to a template file, they can do so using the `z2k_template_author` [[YAML Configuration Properties|YAML entries]]. You can then use the `{{templateAuthor}}` to have the template author field be placed in the text of all files created from that template.


## Example
![[templateName#Example]]


