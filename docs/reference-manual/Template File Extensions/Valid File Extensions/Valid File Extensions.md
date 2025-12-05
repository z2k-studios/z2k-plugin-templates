---
sidebar_folder_position: 20
sidebar_position: 1
doc_state: initial_ai_draft
---
# Valid File Extensions

## Overview
There are three different file extensions recognized by the Z2K Templates Plugin for use by [[Template Files]]:
- [[Extension .md]]
- [[Extension .template]]
- [[Extension .block]]

## Review - Template Types
By using custom template extensions, it will give you a cleaner dividing line between the different [[Types of Template Files|types of template files]]:

- **Content Files** – actual notes you read, search, and query.
- **Document Templates** – full-file templates that define how those content files are created.
- **Block Templates** – reusable snippets that are pulled into other templates or notes.

In addition to segregating template files from content files, Z2K Template File Extensions also are used as an additional signal about the type and role of a file: i.e. is it a [[Block Templates|Block Template]] or a [[Types of Template Files#Document Template|Document Template]].

## Summary Table
The table below summarizes how file extensions and YAML types relate.

| File Kind         | File Extension       | YAML `z2k_template_type` | Typical Use                                     |
| ----------------- | -------------------- | ------------------------ | ----------------------------------------------- |
| Content File      | `.md`                | `content-file` (or none) | Real notes, cards, and documents                |
| Document Template | `.md` or `.template` | `document-template`      | Full-document patterns for creating new notes   |
| Block Template    | `.md` or `.block`    | `block-template`         | Reusable snippets embedded into other templates |



> [!WARNING] For Advanced Users
> [[Template File Extensions]] are intended for advanced users. A user will need to feel comfortable manually changing file extensions (often through a command line or terminal window interface) in the event something goes awry.

