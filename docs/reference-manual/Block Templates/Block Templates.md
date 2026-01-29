---
sidebar_position: 1
sidebar_folder_position: 140
aliases:
- Partials
- Partial Templates
- Block Template
---
# Block Templates

## Overview
In addition to file-level [[Types of Template Files#Document Templates|Document Templates]], the Z2K Templates plugin also supports *block-level* templates that can be inserted inside existing files.

Block Templates are reusable fragments of markdown that help you maintain consistency across your vault. They typically are small, structured units like checklists, metadata blocks, or standard snippets

## Contents
- [[What is a Block Template|What is a Block Template?]] - What fundamentally is a Block Template?
- [[Why Use Block Templates|Why Use Block Templates?]] - When are Block Templates useful?
- [[How Do You Use Block Templates|How Do You Use Block Templates?]] - How do you actually use a Block Template?
- [[Where Do You Store Block Templates|Where Do You Store Block Templates?]] - Where do you put them in your vault?
- [[Block Template Requirements]] - What makes a Block Template be recognized as one?
- [[Block Template File Structure]] - What is the structure of a Block Template file?
- [[What Happens When You Insert A Block|What Happens When You Insert A Block?]] - Steps through the process of inserting a block.

## Quick Example

A simple block template for adding a task to a file:

```handlebars
## Task
- [ ] {{taskName}}
- Priority: {{priority}}
```

Insert it via:
- The [[Insert block template]] command in Obsidian
- Inside another template using the handlebars [[Partials|partial]] command, e.g.`{{> task-block}}`



---



==question==
Can you make a partial that is based on a field (eg use a multiselect to allow the user to choose a partial to import)

`{{< (random "Foo.md" "Bar.md")}}`

