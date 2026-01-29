---
sidebar_position: 10
aliases:
- System Blocks
- Z2K System Blocks
- Z2K System Block Templates
---
# Introduction to System Blocks
System Blocks are special system-level [[Block Templates]] embedded within your vault that will automatically be inserted into all new cards in a hierarchical manner. They provide vault-wide consistency without requiring explicit inclusion in every template.


> [!NOTE] Advanced Feature Intended for System Designers
> Please note that System Blocks are considered an advanced feature of the Z2K Templates Plugin. A typical user has little need for them. But if you are designing a more cohesive system for your vault, or are a professional vault designer, then System Blocks opens a number of doors for making more cohesive systems. 

## System Block Files
System Block Files are stored in special `.system-block.md` files that are located throughout an Obsidian vault. All YAML and markdown text inside these System Block files are automatically inserted directly into any card *made at that folder level and all child folders.* 

System Blocks can include both content and [[Z2K Templates and YAML|YAML frontmatter]], but typically it is just used for hierarchical setting of YAML properties. System Blocks are also frequently used to establish [[field-info Helper|field-info]] settings throughout the vault. 

## Hierarchical Inclusion
The System Blocks can be stored at multiple folder levels within your Obsidian vault. This allows you to specify default YAML fields and [[field-info Helper|field-info]] settings that apply to only a specific folder and subfolders. 

When multiple layers of YAML text are included in your folder structure by having multiple System YAML files at different folder depths, then the YAML is accumulated from a top (root) to down (leaf) order. That is, the text in the `z2k-system.yaml` file in your root folder is the first text inserted into every new card.

## Details
Some notes on System Block files:
- The System Blocks files should follow the same guidelines mentioned in [[Z2K Templates and YAML]]
- The `.system-block.md` files are hidden as a result of having an initial dot in the filename. This was intentional in order to keep the user interface clean. To modify these files, you will need to use an external text editor - or temporarily rename them - to view and edit them inside Obsidian. 
- Note: Comments in the YAML are routinely removed by Obsidian and other plugins. Do not assume any YAML comments will be persistent.

## What is the Difference between System Blocks and the Global Block?
System Blocks and the [[Global Block]] are quite similar. Both insert blocks of YAML and context text into large swaths of files automatically. But they have different purposes:
- **System Blocks** are hierarchical and embedded directly into the folder structure. This allows you to adjust the values of YAML settings and `{{field-info}}` commands at the folder level. System Blocks are used by vault designers who have a larger system that they use. 
- **The Global Block** is a single shot, completely global block of text that is inserted into every file created with the Template Plugin. It is not embedded at all into the vault; you specify it via the settings page. 

## Examples
For example, a system block might inject standardized metadata:

```yaml file=".system-block.md"
---
author: "{{userName}}"
---
```

Or prepend structured Markdown:

```md file=".system-block.md"
> *This note originates as part of the Second Brain of {{creator}}.*
```


## See Also

- [[What is a Block Template]] for block template fundamentals
- [[Block Template Requirements]] for identification rules
- [[Why Use System Blocks]] for typical use cases of System Blocks