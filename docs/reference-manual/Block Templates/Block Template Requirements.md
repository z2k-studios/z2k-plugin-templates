---
sidebar_position: 40
sidebar_label: "Block Template Requirements"
---
# Block Template Requirements
Let's step through how the Z2K Templates plugin recognizes a file to be a Block Template. There are some subtle differences here versus how [[Types of Template Files#Document Templates|Document Templates]] work. 

## How the Plugin Identifies Block Templates
Block Template files in the vault can be created and identified in 3 ways:
### 1. Via the "Convert to Block Template" Command
The easiest way to create a block template is to use the plugin command [[Convert to Block Template]]. This makes an existing file (content file or document template) into a block template. 

Under the covers, this sets the `z2k_template_type` property in your block template file's [[YAML Configuration Properties]] to reflect that it is a block template:

```yaml
---
z2k_template_type: block-template
---
```

The plugin then uses this YAML setting to establish what block templates are relevant for a given [[Destination Context]].

After conversion to a block template, you can decide [[Where Do You Store Block Templates|where to store the block template]], but we recommend storing them in a [[Template Folders|Template Folder]] alongside the document templates. Rest easy, the plugin is [[Where Do You Store Block Templates#Intermixing Document and Block Templates|smart]] about not co-mingling the two types of templates when it comes to selection lists. 

### 2. Block File Extension
If you are using [[Template File Extensions]], then block templates are identified by their `.block` file extension. All `.block` files are automatically recognized as block templates:

```
my-task-block.block
meeting-notes-section.block
```


### 3. Explicit Partial Reference
Any file can be used as a block template if it is explicitly referenced using Handlebars [[Partials|partial syntax]]:

```handlebars
{{> path/to/any-file.md}}
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
