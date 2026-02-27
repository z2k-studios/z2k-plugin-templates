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
- [[Handlebars Support|Handlebars.js functions]], including built-in helpers for iteration and conditional formatting.
- Support for [[Block Templates|block templates]] that allow you to build modular templates with consistent formatting.
- Customizable [[Quick Commands|obsidian commands]] to insert blocks or create new files with templates, all assignable to hotkeys.
- Support for [[Template Folder Hierarchies|Hierarchical Structures]] that allow you to build templates up as you traverse through a folder-based vault, including support for [[YAML Integration|YAML merging]] across templates.
- [[URI Actions]] to allow external data to be fed into your templates to create new files programmatically.
- External [[JSON Packages Overview|JSON Package]] and [[Command Queues]] that can be use to queue up data from external sources to be added to your vault when Obsidian is loaded.


