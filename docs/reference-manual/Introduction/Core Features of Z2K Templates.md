---
sidebar_position: 30
doc_state: revised_ai_draft_2
title: "Core Features of Z2K Templates"
sidebar_label: "Core Features"
aliases:
- Core Features
---
# Core Features of Z2K Templates

Z2K Templates has a rich collection of features, including:
- A `{{field}}` syntax based on the industry standard [handlebars.js](https://handlebarsjs.com/) library.
- An [[Prompting|interactive prompting dialog]] for filling out information for each new file. 
- The prompting dialog is customizable on a per template basis with a rich [[Template Fields|syntax for specifying prompting information]] (e.g. required fields, prompting text, default values) and handling missing data.
- A series of [[Built-In Fields|built-in fields]] that will auto-populate data into the new notes.
- [[Handlebars Support|Handlebars.js functions]], including built-in helpers for ==iteration and conditional formatting== .
- Support for [[Block Templates|block templates]] that allow you to build modular templates with consistent formatting.
- Support for [[Hierarchical Template Folders|Hierarchical Structures]] that allow you to build templates up as you traverse through a folder-based vault, including support for [[YAML Integration|YAML merging]] across templates.
- [[URI and JSON Support|URI support]] to allow external data to be fed into your templates to create new files programmatically.
- External [[URI and JSON Support#JSON Packages|JSON packages and command lists]] to queue up data to be added to your vault when Obsidian is loaded.



> [!DANGER] INTERNAL NOTES
> - Check: I make the comment that it can handle iteration and conditional formatting

