---
sidebar_folder_position: 80
sidebar_position: 1
doc_state: initial_ai_draft
aliases:
  - Template File Extension
  - File Extension
  - File Extensions
---
# Template File Extensions
By default, every template file is just a normal Obsidian note with the `.md` extension, and for many users that is all you will ever need. Z2K Templates supports new file extension types for templates, but they only become important when you start to notice that your template content is showing up in places where you really only want real notes to appear.

This section explains the "[[Template Pollution|Pollution Problem]]" , how file extensions relate to [[Template Files]] and [[Types of Template Files]], and how to switch between them using the command palette.

## Contents
The following pages steps through the use of [[Valid File Extensions]]:

- [[Template Pollution]] - what is the problem with storing templates as normal markdown files in your vault
- [[Valid File Extensions]] - a summary of valid file extensions
	- [[Extension .md]] - the default normal markdown extension
	- [[Extension .template]] - a custom file extension for holding [[Types of Template Files#Document Templates|Document Templates]]
	- [[Extension .block]] - a custom file extension for holding [[Types of Template Files#Block Templates|Block Templates]]
- [[Obsidian and File Extensions]] - gives details on how Obsidian treats the `.template` and `.block` file extensions
- [[Changing File Extensions]] - steps through how to use the Z2K Plugin to change the file extensions
- [[Editing .template and .block Files]] - how to edit template files after they have been converted to custom file extensions
- [[File Extension Process Guide]] - Our recommendations for using these custom file extensions

## Warnings

> [!WARNING] For Advanced Users
> Template File Extensions are intended for advanced users. A user will need to feel comfortable manually changing file extensions (often through a command line or terminal window interface) in the event something goes awry.

> [!WARNING] This feature must first be Enabled in Settings
> To use [[Template File Extensions]], you must first enable the feature in the [[Settings Page]]. See the "[[Use Template File Extensions]]" setting for more details.
