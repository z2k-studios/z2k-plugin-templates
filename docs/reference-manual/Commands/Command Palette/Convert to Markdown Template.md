---
sidebar_position: 90
sidebar_class_name: z2k-code
doc_state: revised_ai_draft_1
---

# Convert to Markdown Template

## Overview
The **Convert to Markdown Template** converts a file to a template (if it isn't already) and sets its file extension to the standard `.md` extension. It is useful when you want to work on a template file that uses [[Template File Extensions]] but convert it back to a straight `.md` file extension. It is also useful when converting a normal content file into a [[Types of Template Files#Document Templates|Document Template]].

## What the Command Does
When you run **Convert to Markdown Template** on the active file's [[Types of Template Files|File Type]]:
- If the existing file is a content file:
	- It sets the [[z2k_template_type]] YAML property to `document-template`.
- If the existing file is a document template or block template:
	- It leaves the [[z2k_template_type]] YAML property as-is (`document-template` or `block-template`).
	- If the file currently has a `.template` or `.block` extension, it renames the file to `.md`.

After the command is done, Z2K Templates will treat the file as a template, but it now looks like a normal Markdown note in your vault.


### Notices

> [!NOTE] May Need to Move into a Template Folder
> If you are converting a content file into a Document Template, you will also need to move the file into a [[Template Folders|Template Folder]].

### YAML Before and After

**Before** (template with a template extension):

```md
---
title: "Project – Status Section"
z2k_template_type: block-template
---
## Status
{{Status}}
```

File name: `Project – Status Section.block`

**After** running **Convert to Markdown Template**:

```md
---
title: "Project – Status Section"
z2k_template_type: block-template
---
## Status
{{Status}}
```

File name: `Project – Status Section.md`

The YAML type remains `block-template`; only the extension changes.

## When to Use It
Use **Convert to Markdown Template** when:

- When a file is already a document or block template and you want it to remain a template, but you no longer want the `.template` or `.block` extension.
- You have a content file that you would like to convert to a template, but be certain it is save with a `.md` extension. 
