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


