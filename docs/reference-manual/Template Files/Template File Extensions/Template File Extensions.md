---
sidebar_folder_position: 40
sidebar_position: 1
doc_state: initial_ai_draft
aliases:
- Template File Extension
- File Extension
- File Extensions
---
# Template File Extensions

## Overview
By default, every template file has just a normal Obsidian note with the `.md` extension, and for many users that is all you will ever need. Extensions only become important when you start to notice that your template content is showing up in places where you really only want real notes to appear.

This section explains what problem custom extensions solve, how they relate to [[Template Files]] and [[Types of Template Files]], and how to switch between them using the command palette.

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

## Warnings:

> [!WARNING] For Advanced Users
> Template File Extensions are intended for advanced users. A user will need to feel comfortable manually changing file extensions (often through a command line or terminal window interface) in the event something goes awry.

> [!WARNING] This feature must first be Enabled in Settings
> To use [[Template File Extensions]], you must first enable the feature in the [[Settings Page]]. See the "[[Use Template File Extensions]]" setting for more details.




> [!DANGER] INTERNAL NOTES AND DISCREPANCIES
> - The current plugin code still uses `z2k_template_type` values `"normal"`, `"named"`, and `"partial"` in several places. This page describes the newer naming scheme (`content-file`, `document-template`, `block-template`). Please ensure the implementation is updated to match or provide a clear migration path.
> - The `.block` extension is described here as the canonical extension for block templates, but the code still refers to `"partial"` templates and does not yet show explicit handling for `.block` in `getFileTemplateType`. Confirm and update once `.block` is fully wired.
> - Command names `Convert file to named template`, `Convert file to block template`, and `Convert file to markdown` currently map to `"named" | "partial" | "normal"` at the code level. Once the YAML values are migrated, update this page to mirror the exact enum values and any renamed commands.
> - The behavior of `.template` and `.block` files with respect to Properties, Dataview/Bases, and other plugins depends on how Obsidian and those plugins treat non-`.md` extensions. Please validate the exact current behavior against your target environment and tighten language here if needed.
> - If you later decide to register `.template` and `.block` as markdown views again (via `viewRegistry.registerExtensions`), revisit the “How Obsidian Treats Template Extensions” section – the hiding behavior will change significantly once those extensions are treated as full markdown notes again.
