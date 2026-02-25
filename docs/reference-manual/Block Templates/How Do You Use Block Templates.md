---
sidebar_position: 30
sidebar_label: Using Block Templates
---
# How Do You Use Block Templates?
There are two primary methods for inserting Block Templates into your documents.

## Method 1: Via Obsidian Commands

### Insert Block Template Commands
Use the command palette or right-click context menu to run:
- **[[Insert Block Template]]** - Opens a picker to select from available block templates
- **[[Insert Block Template Using Selection]]** - Uses selected text as context for the block

When you run these commands, the plugin:
1. Determines the current note's [[Destination Context|destination context]]
2. Gathers all block templates relevant to that destination context
3. Presents them in a selection dialogue box
4. Inserts the chosen block at your cursor position

This method is useful for interactive block insertions, for example, sections that are repeated frequently. 

For more information, please see the [[Insert Block Template]] command's documentation.

## Method 2: Via Handlebars Partial Syntax
Block templates can also be inserted by using Handlebars [[Partials]] syntax:

```handlebars
{{> block-template-name}}
```

This method is useful for constructing modular templates that have shared or repeated blocks of content. 

### Specifying a Path
The name you provide in `{{> name}}` can be as simple as a block's name (the preferred method) or as specific as a full path. Z2K Templates interprets the format as follows:

Suggested path specifications:
- **Name only** (`{{> my-block}}`): Finds the block template with that name closest to the current file. When multiple blocks share the same name across different folders, the one nearest to the current template takes precedence.

For advanced users, you can also:
- **Path without a leading slash** (`{{> notes/my-block}}`): Searches for a block whose location ends with the path you specified — useful for narrowing down by subfolder without anchoring to the root. When multiple candidates match, the one closest to the current template wins.
- **Leading slash** (`{{> /shared/my-block}}`): Resolves the block by its exact location within the [[Templates Root Folder]]. Note: The `/` anchors to your templates root — not the vault root.
- **Leading `./` or `../`** (`{{> ./my-block}}`): Resolves relative to the folder where the template file itself lives — not the folder of the note being created. This works but is not recommended due to the ambiguity of what it is relative to.

## See Also
- [[What is a Block Template]] for fundamentals
- [[Block Template Requirements]] for identification rules
- [[Block Template File Structure]] 
