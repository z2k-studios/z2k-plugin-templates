---
sidebar_position: 40
sidebar_label: "Block Template Requirements"
---
# Block Template Requirements
For the Z2K Templates plugin to recognize a file as a Block Template, it must meet one of the following identification criteria.

## How the Plugin Identifies Block Templates

### 1. Use the Convert to Block Template Command (YAML Setting)
Use the plugin command [[Convert to Block Template]] to make an existing file (content or document template) into a block template. 

Under the covers, this sets the `z2k_template_type` property in your block template file's [[YAML Configuration Properties]] to reflect that it is a block template:

```yaml
---
z2k_template_type: block-template
---
```

After conversion, you can decide [[Where Do You Store Block Templates|where to store the block template]], but we recommend storing them in a [[Template Folders|Template Folder]] alongside the document templates. Rest easy, the plugin is [[Where Do You Store Block Templates#Intermixing Document and Block Templates|smart]] about not comingling the two types of templates. 

### 2. Block File Extension
Another way that files can be identified as a block template is with the `.block` extension. All `.block` files are automatically recognized as block templates:

```
my-task-block.block
meeting-notes-section.block
```

This method is useful when using [[Template File Extensions]] to hide template files from the Obsidian file explorer.

### 3. Explicit Partial Reference
Any file can be used as a block template if it is explicitly referenced using Handlebars [[Partials|partial syntax]]:

```handlebars
{{> path/to/any-file}}
```

When a file is referenced this way, the plugin treats it as a block template for that invocation, regardless of the file's other properties. This allows flexibility in composing templates from various sources.

## Identification Methods Summary

| Method | How to Use |
| ------ | ---------- |
| YAML property | Add `z2k_template_type: block-template` to frontmatter |
| File extension | Name file with `.block` extension |
| Explicit reference | Reference file using `{{> filename}}` syntax |

## See Also

- [[What is a Block Template]] for fundamentals
- [[Block Template File Structure]] for content organization
- [[How Do You Use Block Templates]] for usage methods
- [[Template File Extensions]] for hiding template files
