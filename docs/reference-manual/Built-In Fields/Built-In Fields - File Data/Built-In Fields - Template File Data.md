---
sidebar_position: 10
sidebar_label: "{{templateName}}, {{templateVersion}}, {{templateAuthor}}"
sidebar_class_name: z2k-code
aliases:
- templateName
- templateVersion
- templateAuthor
---
## Template File Fields
The following [[Built-In Fields|Built-In Fields]] are for accessing information about the template that was used to create a file:
 - [[#templateName]] - the name of the template (filename) used to create a card
 - [[#templateVersion]] - the version number (if available) of the template used to create a card
 - [[#templateAuthor]] - the author of the template 


## templateName
The built in field `{{templateName}}` will be filled in with the filename (without extension) used to create a card. 

For example, use this field to store away the template name for later use. It is common to see it used in the YAML or in a "Context" section. See [[#Example Usage]] below.


> [!TIP] Use wikilink Helper for templateName
> If you would like to have the name of the Template file be hotlinked back to the actual template file, use the wikilink helper function `{{wikilink}}`. For instance, `{{wikilink templateName}}`


## templateVersion
Like [[#templateName]], the `{{templateVersion}}` built-in field will include the version number of a template into in any file created from that template. A template uses the [[YAML Configuration Fields|YAML entry]] `z2k_template_version` to specify its current version.


## templateAuthor
Template files can be exchanged with others. If a template author wishes to attach their name to a template file, they can do so using the `z2k_template_author` [[YAML Configuration Fields|YAML entries]]. You can then use the `{{templateAuthor}}` to have the template author field be placed in the text of all files created from that template.

## Example Usage

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


