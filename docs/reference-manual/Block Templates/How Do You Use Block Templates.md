---
sidebar_position: 30
sidebar_label: Using Block Templates
---
# How Do You Use Block Templates?
There are two primary methods for inserting Block Templates into your documents.

## Method 1: Obsidian Commands

### Insert Block Template Commands
Use the command palette or right-click context menu to run:
- **[[Insert block template]]** - Opens a picker to select from available block templates
- **[[Insert block template using selection]]** - Uses selected text as context for the block

When you run these commands, the plugin:
1. Determines the current note's [[Destination Context|destination context]]
2. Gathers all block templates relevant to that destination context
3. Presents them in a selection dialogue box
4. Inserts the chosen block at your cursor position

This method is useful for interactive block insertions, for example, sections that are repeated frequently. 

For more information, please see the [[Insert block template]] command's documentation.

## Method 2: Handlebars Partial Syntax
Block templates can also be inserted by using Handlebars [[Partials]] syntax:

```handlebars
{{> block-template-name}}
```

This method is useful for constructing modular templates that have shared or repeated blocks of content. 

## See Also
- [[What is a Block Template]] for fundamentals
- [[Block Template Requirements]] for identification rules
- [[Block Template File Structure]] 
