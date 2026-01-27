---
sidebar_position: 30
doc_state: initial_ai_draft
---
# Template File Structure
Let's talk about the structure of a Template file. Topics include:
- [[#Markdown Format]]
- [[#YAML Frontmatter]]
- [[#Body Content]]
- [[#Minimum Structure]]
- [[#Example Template File Structures]]

**In short, Template Files are simply standard Markdown files and are editable directly in Obsidian.**

## Markdown Format
Because the only strict requirement for a template file is that [[Template Requirements#It Must Be a Text File|it must be a text file]], preferably markdown based, the file structure consists of a text file stored in standard straight text. 

Templates follow the same rules as any Obsidian note when it comes to its markdown syntax. If you are unfamiliar with Obsidian frontmatter or Markdown structure, refer to Obsidian’s official documentation:

- Obsidian Markdown: [https://help.obsidian.md/obsidian-flavored-markdown]

## YAML Frontmatter
Like most Markdown formats, the template can optionally support [[Z2K Templates and YAML|YAML frontmatter]] to provide additional data and configuration for the file. Again, it follows Obsidian's guidelines:

- Obsidian Frontmatter: [https://help.obsidian.md/properties]

In addition, a template file can define several YAML keys (nodes) that are recognized by the plugin to control its behavior. See [[YAML Configuration Properties]] for more details. 

You can also use [[Template Fields]] inside the frontmatter (see [[Using Fields Inside YAML Metadata]]) and YAML properties can be used as named fields in your content (see [[Using YAML Metadata as Fields]]). 

For example:
```yaml
---
z2k_template_type: document-template
z2k_template_name: Sample Template
custom_field: "{{myField}}"
---
```


> [!WARNING] YAML Properties and Template Fields
> Note: just be aware of [[Template Pollution]] when using template fields inside YAML properties - we suggest using one of these [[Template Pollution#How To Minimize Template Pollution|techniques to minimize]] pollution.



## Body Content
The body contains Markdown mixed with template expressions ([[Template Fields]], [[Helper Functions]], etc). Everything written in the body is copied to the final file after template expressions have been resolved.

Example:

```md
# Meeting Notes for {{format-date "LLLL"}}

Attendees: {{attendees}}

{{#if agenda}}
## Agenda
{{agenda}}
{{/if}}
```

The body allows:
- Standard Markdown
- Field references: `{{attendees}}`, `{{agenda}}`
- Helper functions: `{{format-date date}}` (see [[format-date]])
- Conditional Handlebars constructs

## Example Template File Structures

### Minimal Template

```md
Hello world
```

### Practical Minimal Template

```md
---
z2k_template_type: document-template
---
# {{fileTitle}}
Created on {{wikilink date}}
```

### Template with Fields in YAML

```md
---
project: "{{projectName}}"
owner: "{{owner}}"
---
# Project Kickoff
Welcome to {{projectName}}
```


