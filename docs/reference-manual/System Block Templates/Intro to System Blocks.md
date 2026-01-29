---
sidebar_position: 10
aliases:
- System Blocks
- Z2K System Blocks
- Z2K System Block Templates
---

## System Block Files Overview
Z2K Templates supports the concept of "System Block Templates" (aka "System Blocks") - special block templates that is inserted into every new card created with the template plugin. Using System Blocks, you can:
- Ensure that certain YAML fields are used consistently throughout the entire vault (or subsections) 
	- see [[Using System Blocks and YAML]]
- Ensure that certain `field-info` is consistently defined within the entire vault (or subsections) 
	- see [[Using System Blocks and field-info]]
- Specify a common header of text to include at the top of every markdown file 
	- see [[Using System Blocks and Markdown]]

## System Block Files
System Block Files are stored in special `.system-block.md` files that are located within your Obsidian vault. All YAML and markdown text inside these System Block files are automatically inserted directly into any card *made at that folder level and all child folders.* 

The YAML text itself can include template `{{fields}}` inside them that can be filled in by template plugin, including fields that will be prompted to the user.

## Hierarchical Inclusion
The System YAML files can be stored at multiple folder levels within your Obsidian vault. This allows you to specify default YAML fields that apply to only a specific folder and subfolders. 

When multiple layers of YAML text are included in your folder structure by having multiple System YAML files at different folder depths, then the YAML is accumulated from a top (root) to down (leaf) order. That is, the text in the `z2k-system.yaml` file in your root folder is the first text inserted into every new card.

## Details
Some notes on System Block files:
- The System Blocks files should follow the same guidelines mentioned in [[Z2K Templates and YAML]]
- The `.system-block.md` files are hidden by using an initial dot in the filename to users to keep the user interface clean. To modify these files, you will need to use an external text editor - or temporarily rename them to edit them inside Obsidian. 
- Note: Comments in the YAML are routinely removed by Obsidian and other plugins. Do not assume any YAML comments will be persistent.


## Examples
For example, a system block might inject standardized metadata:

```md file=".system-block.md"
---
author: "{{userName}}"
---
```

Or prepend structured Markdown:

```md file=".system-block.md"
> *This note originates as part of the Second Brain of {{creator}}*
```


---

 here's another version: 
# System Block Templates
**System Block Templates** are special block templates that are automatically injected into all templates before rendering. They provide vault-wide consistency without requiring explicit inclusion in every template.

## Overview

System Block Templates behave like invisible partials that are automatically applied:

- They merge **before** template YAML
- Their `field-info` definitions can be overridden by template-level fields
- Their content is prepended to template bodies

This allows an entire vault to maintain consistent structure without repeating boilerplate in every template.

## Common Use Cases

### Vault-Wide Headers/Footers
Add standard header or footer content to every generated document:

```handlebars
---
z2k_template_type: system-partial
---
---
created: {{date}}
modified: {{date}}
creator: {{creator}}
---
```

### Global Metadata
Ensure every document includes required metadata:

```handlebars
---
z2k_template_type: system-partial
---
---
vault: My Vault
version: 1.0
---
```

### Standard Tags
Apply default tags to all generated documents:

```handlebars
---
z2k_template_type: system-partial
---
---
tags:
  - generated
  - z2k-template
---
```

### Required Fields
Define fields that should appear in every template:

```handlebars
---
z2k_template_type: system-partial
---
{{field-info author suggest="{{creator}}"}}
```

## How System Block Templates Work

1. **Discovery**: The plugin identifies all system block templates in the vault
2. **Merge Order**: System templates are processed before regular template content
3. **Override Behavior**: Template-level definitions take precedence over system definitions

### Override Example

**System Block Template**:
```yaml
---
z2k_template_type: system-partial
---
---
status: draft
---
```

**Regular Template**:
```yaml
---
status: published
---
# My Document
```

**Result**: The document will have `status: published` because the template-level definition overrides the system default.

## Configuration

System Block Templates are configured through the plugin settings. Consult the plugin documentation for details on:
- Designating a template as a system block template
- Controlling the order of system template application
- Excluding specific templates from system block injection

## See Also

- [[What is a Block Template]] for block template fundamentals
- [[Block Template Requirements]] for identification rules
- [[Why Use Block Templates]] for general use cases
