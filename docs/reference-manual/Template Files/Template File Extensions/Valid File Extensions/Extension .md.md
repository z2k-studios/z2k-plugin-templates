---
sidebar_position: 10
sidebar_class_name: z2k-code
doc_state: initial_ai_draft
aliases:
  - .md
---
# The Default .md File Extension

## Overview
The `.md` file extension is the default mode for editable templates in the vault. 
- Like most files in the vault, the default template file uses the `.md` file extension..
- A `.md` file can be:
	- A normal content file 
	- A document template stored in a template folder and/or marked as `document-template`.
	- A block template (less common, but possible while you are actively editing it).

## Advantages:
- You can freely edit the file in Obsidian like any other note.
- All Obsidian features treat it as a first-class note:
	- Properties, backlinks, graph, search, and third-party tools will see it.

## Disadvantages
- Template content will “[[Template Pollution|pollute]]” the content of the vault when data-mining tools are used.

## Ideal use
Using the default `.md` extension is ideal for:
- Small vaults that only have a few templates 
- Vaults with minimal data mining or non-complex template files
- For more complex vaults and template setups, the `.md` extension is still useful while designing and iterating on a template, only to be converted to one of the template extensions when it solidifies. 
