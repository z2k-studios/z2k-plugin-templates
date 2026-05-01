---
sidebar_position: 40
aliases:
- naming templates
- template naming conventions
- template file naming
---
# Template File Naming
Template files live in your vault as regular files. Unlike fields and helpers – where naming affects parsing – template file names have no syntactic constraints beyond what your operating system allows. 
## Contents
- [[#File Name Guidelines]]
- [[#File Extensions]]
- [[#Examples]]

## File Name Guidelines
Template files should be named for what they create, not how they work internally. A user browsing the template picker sees file names – they should be self-explanatory.

**Recommended practices:**
- Use plain, human-readable names: `Meeting Notes`, `Book Review`, `Project Brief`
- Capitalize naturally, as you would a document title
- Avoid encoding metadata in the file name (that's what YAML frontmatter is for)
- Keep names concise – long names get truncated in Obsidian's UI

**No technical restrictions on case or style.** Unlike field names (which are case-sensitive and space-sensitive), template file names pass through Obsidian's file system layer. Spaces, mixed case, and punctuation are all fine.

## File Extensions
Z2K Templates recognizes three file extensions:

| Extension | Used For | Details |
|---|---|---|
| `.md` | All template types | The default. Templates are standard Markdown files. |
| `.template` | Document templates | Optional custom extension that hides templates from Obsidian's normal file operations. |
| `.block` | Block templates | Optional custom extension for [[Block Templates\|block templates]]. |

The `.template` and `.block` extensions are part of the [[Template File Extensions]] feature. When enabled, they prevent template files from appearing in Obsidian's quick switcher, graph view, and search results – addressing the [[Template Pollution]] problem.

> [!NOTE]
> The file extension does not affect how the template engine processes the file. A template works identically whether it ends in `.md`, `.template`, or `.block`. The extension controls only how Obsidian treats the file in its UI.

## Examples
A typical template folder might look like:

```
Templates/
├── Meeting Notes.md
├── Book Review.md
├── Project Brief.template
├── Weekly Summary.template
├── Header.block
├── Footer.block
```

The `.md` files are visible throughout Obsidian. The `.template` and `.block` files are hidden from normal vault operations but fully accessible to the Z2K Templates plugin.

