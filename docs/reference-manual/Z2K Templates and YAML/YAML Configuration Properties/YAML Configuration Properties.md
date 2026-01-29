---
sidebar_position: 1
sidebar_folder_position: 60
aliases:
- YAML Configuration Setting
- YAML Configuration Property
- Z2K Templates YAML Configuration Setting
- Z2K Templates YAML Configuration Settings
- Z2K Templates YAML Configuration Property
- Z2K Templates YAML Configuration Properties
---
# Z2K Templates' YAML Configuration Properties
The Z2K Template plugin uses properties stored in the YAML frontmatter of a template file to control how the Template plugin behaves. This allows the template plugin to behave differently on a per-template file basis. All settings (yaml nodes) are prefaced with `z2k_template` to logically group them together and separate them from other YAML configuration settings

## Using Z2K Templates YAML Configuration Properties
Z2K Templates YAML Configuration settings can be inserted into the yaml frontmatter of the source template file directly. They are also allowed to be inserted into [[Intro to System Blocks|System Blocks]] to configure execution across a larger set of files as needed in [[Template Folder Hierarchies|hierarchically designed vaults]]. 

## Supported YAML Configuration Properties
The following YAML configuration properties are recognized by the Z2K Templates plugin:

- [[z2k_template_type]]
- [[z2k_template_default_fallback_handling]]
- [[z2k_template_default_prompt]]
- [[z2k_template_suggested_title]]
- [[z2k_template_name]]
- [[z2k_template_author]]

==These YAML keys should be cleared out when finalized==