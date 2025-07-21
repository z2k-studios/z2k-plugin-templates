Z2K Templates supports the concept of "System YAML" text that is inserted into every new card created with the template plugin. Using System YAML, you can ensure that some YAML fields are used consistently throughout the entire vault (or subsections).

# System YAML files
System YAML is stored in special `.z2k-system.yaml` files that are located within your Obsidian vault. All yaml text inside these System YAML files are inserted directly into any card made at that folder level and all child folders. 

The YAML text itself can include template `{{fields}}` inside them that can be filled in by template plugin, including fields that will be prompted to the user.

# Hierarchical Inclusion
The System YAML files can be stored at multiple folder levels within your Obsidian vault. This allows you to specify default YAML fields that apply to only a specific folder and subfolders. 

When multiple layers of YAML text are included in your folder structure by having multiple System YAML files at different folder depths, then the YAML is accumulated from a top (root) to down (leaf) order. That is, the text in the `z2k-system.yaml` file in your root folder is the first text inserted into every new card.

# Details
Some notes on System YAML files:
- The System YAML files should follow the same guidelines mentioned in [[9 - Z2K Fields and YAML]]
- The `.z2k-system.yaml` files are hidden by using an initial dot in the filename to users to keep the user interface clean. To modify these files, you will need to use an external text editor - or temporarily rename them to edit them inside Obsidian. 
- Note: Comments in the YAML are routinely removed by Obsidian and other plugins. Do not assume any YAML comments will be persistent.


# Sample YAML for System YAML files

## Basic 
Assume you have a file in your root folder of your vault that reads:
```yaml
# My Beautiful Vault
card_author : "Mark Twain"
```

Then every card created in your vault will have a the above yaml code inserted into it.

## With Prompted Fields 
You can amend the above example with a field that has a default value, but is shown to the user through a prompt
```yaml
# My Beautiful Vault
card_author : "{{CardAuthor|text|Who is the Author of this card?|My Name|My Name}}"
```

Then every card created in your vault will have a the above yaml code inserted into it.


