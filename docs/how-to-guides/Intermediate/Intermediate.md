---
sidebar_position: 30
sidebar_folder_position: 30
title: Intermediate Guides
hide_title: true
---
Wanting to up your game and use some of the more advanced features of [[README|Z2K Templates]]? Use these guides to really super charge your Obsidian workflow. 

## Intermediate Guides
- How to Make More Readable Templates (e.g. no-prompt and pushing fields into yaml)
- How to Create New Files from Existing Files - stores data in yaml to be used again by creating a new card from the existing card
- How to Organize your Template Folders to be Context Sensitive
- How to Store Fields into YAML for Template Updates
- How to make all files be preceded with a timestamp, true Zettelkasten style
	- Define root level system block field call "fileTitlePostfix", and then redefine file title to be "`{{timetamp}} {{fileTitlePostfix}}`" with default and directives = finalize-suggest
- How to create a variety of chat prompts to query chatgpt about the contents of a card
	- Create a partial with a bunch of yaml settings (or set values on fields) that describe different chat prompts
	- then use the [[chatgpt]] helper and reference the prompt
	- Can you use {{systemData}} to pass the contents of a file?
	- Can you pass the filename as a sluggified value into the chat?