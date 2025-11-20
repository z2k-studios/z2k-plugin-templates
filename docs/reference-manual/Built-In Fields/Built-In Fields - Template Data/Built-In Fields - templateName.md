---
sidebar_position: 10
sidebar_label: "{{templateName}}"
sidebar_class_name: z2k-code
aliases:
- templateName Built-In Field
---
# templateName
The built in field `{{templateName}}` will be filled in with the filename (without extension) of the template used to create a card. 

For example, use this field to store away the template name for later use. It is common to see it used in the YAML or in a "Context" section. See [[#Example Usage]] below.


> [!TIP] Use wikilink Helper for templateName
> If you would like to have the name of the Template file be hotlinked back to the actual template file, use the wikilink helper function `{{wikilink}}`. For instance, `{{wikilink templateName}}`

## Example

```md title="Template - Book Review.md"
–––
z2k_template_version: 1.0.23
z2k_template_author: "[Z2K Studios, LLC](https://z2kstudios.com)"

OriginalTemplateForFile: {{wikilink templateName}}
OriginalTemplateVersion: {{templateVersion}}
–––
Welcome to my book review!

{{! Fill out your template information here --- }}
...

## Attributions
- Template used to create this file: {{wikilink templateName}}, created by {{templateAuthor}}
- Template Version #: {{templateVersion}}
  
```


