---
sidebar_position: 10
doc_state: initial_ai_draft
aliases:
- Pollution
- pollute
---
# Pollution - Why Template File Extensions Exist
Z2K Templates deliberately builds on top of ordinary Obsidian notes – your templates are real files in your vault, not a hidden database. This has a side effect: Obsidian sees template content as “real content” and happily indexes it.

That means that template files will begin to "pollute" valid content in the vault with their own templated content. 

## Pollution Examples
For instance:
- Content within [[Template Files]] will show up in:
	- Search results
	- Graph view (if links are present)
	- Backlinks and outgoing links
	- Property lists and Dataview queries (if you use YAML properties or YAML fields)
	- Any “Bases” or similar database-style plugins that crawl the vault
- If you use [[Template Fields]] and [[Helper Functions]] inside larger constructs, then content inside your template will show up in Obsidian functions along side valid results, even though they are not truly valid content. For instance:
	- Using fields inside Hashtags, e.g. `#/People/{{Name}}`
	- Using fields inside YAML, e.g.  `summary: "{{mySummaryField}}"`

This is acceptable when you only have a handful of templates. It becomes noisy once you have dozens of templates and block templates sprinkled across the vault.

## Pollution Solution
**The Solution**: Z2K Templates allows you to change the file extension of your template files and effectively makes the templates no longer visible to Obsidian functions. By changing the file extension, you can tell Obsidian and third-party tools “treat this as a template, not a content note.”