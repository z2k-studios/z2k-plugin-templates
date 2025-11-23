---
sidebar_position: 70
sidebar_class_name: z2k-code
doc_state: revised_ai_draft_1
---
# Convert to Document Template

## Overview
The **Convert to Document Template** command turns the current file into a full [[Types of Template Files#Document Templates|Document Template]] – a template file that represents a whole document. The command marks the file as a document template and, if you are using [[Template File Extensions]], sets the file extension.

Use this command when a template’s structure is stable enough that you want to use it repeatedly as the basis for new content files.

## What the Command Does
When you run **Convert to Document Template** on the active file:

- It sets the [[z2k_template_type]] YAML property to `document-template`.
- If [[Use Template File Extensions|Template File Extensions are Enabled]], it changes the file extension to `.template`.

### Notices

> [!NOTE] May Need to Move into a Template Folder
> If you are converting a content file into a Document Template, you will also need to move the file into a [[Template Folders|Template Folder]].


> [!WARNING] Why did my template disappear after this command?
> If a Template File suddenly "disappears" from the file navigation bar after issuing this command, then you are likely a) [[Use Template File Extensions|Template File Extensions are Enabled]] and b) you need to issue a [[Make .template and .block templates visible-hidden|Make .template and .block templates visible]] command.


### YAML Before and After

**Before** (plain content file):

```md
---
title: "Project – Kickoff"
---
# Project – {{Name}}

{{Summary}}
```

**After** running **Convert to Document Template**:

```md
---
title: "Project – Kickoff"
z2k_template_type: document-template
---
# Project – {{Name}}

{{Summary}}
```

If template file extensions are enabled and the file was `Project – Kickoff.md`, it will be renamed to:

- `Project – Kickoff.template`

## When to Use It
Use **Convert to Document Template** when:

- You have a note whose structure you want to reuse for multiple entities (people, projects, meetings, tasks, etc.)
- You have an existing block or document template and you wish to rename it to the [[Extension .template|.template]] extension. 
- You are ready to treat a file as the canonical pattern for a card type.

Document templates typically live in dedicated [[Template Folders]] and are used by Z2K commands that create new cards/notes in your system.

## How It Interacts with File Extensions
The visible behavior depends on whether [[Use Template File Extensions|Template File Extensions are Enabled]]:

- **Extensions disabled**
	- The file extension remains `.md`.
	- Only `z2k_template_type` is set to `document-template`.
	- Obsidian and plugins will treat it like any other `.md` file, which can increase [[Template Pollution]] in search and dashboards.

- **Extensions enabled**
	- The file is renamed to `.template`.
	- The YAML type is set to `document-template`.
	- If template files are currently [[Make .template and .block templates visible-hidden|hidden]], then *the renamed file will disappear from the file navigation bar*. 
	- Many tools that focus on `.md` files will stop including it in content views, while Z2K Templates continues to use it as a template.
	
