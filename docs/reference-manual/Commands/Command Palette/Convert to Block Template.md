---
sidebar_position: 80
sidebar_class_name: z2k-code
doc_state: revised_ai_draft_1
---

# Convert to Block Template

## Overview
The **Convert to Block Template** command turns the current file into a block-level template that can be reused inside other templates or notes. It sets the file’s template type to `block-template` and, if you are using template file extensions, renames the file to use the `.block`
extension.

Use this command when you have a snippet – a checklist, section header, boilerplate block, or small structural unit – that you want to reuse across many [[Template Files]] without treating it as a full document on its own.

## What the Command Does
When you run **Convert to Block Template** on the active file:

- It updates the [[z2k_template_type]] YAML property to `block-template`.
- If [[Use Template File Extensions|Template File Extensions are Enabled]], it changes the file extension to `.block`.
- Z2K Templates will treat the file as a **Block Template** rather than a content note or document template.

Conceptually, the file becomes a building block – a reusable piece of structure that can be embedded by other templates. See [[Block Templates]] for more information on what block templates are and how they are used.

### Notices

> [!NOTE] May Need to Move into a Template Folder
> If you are converting a content file into a Block Template, you will also need to move the file into a [[Template Folders|Template Folder]].

### YAML Before and After

**Before** (plain content file or document template):

```md
---
title: "Project – Status Section"
---
## Status

{{Status}}
```

**After** running **Convert to Block Template**:

```md
---
title: "Project – Status Section"
z2k_template_type: block-template
---
## Status

{{Status}}
```

If template file extensions are enabled, you will also see the file renamed from, for example, `Project – Status Section.md` to:

- `Project – Status Section.block`

## When to Use It
Use **Convert to Block Template** when you want to convert the existing file into a [[Block Templates|Block Template]].

- You find yourself copying and pasting the same section between multiple templates.
- You want a single source of truth for a checklist or boilerplate block.
- You want to keep repetitive scaffolding out of your main document templates.

## How It Interacts with File Extensions
The behavior depends on whether [[Use Template File Extensions|Template File Extensions are Enabled]]:

- **Extensions disabled**
	- The file extension remains `.md`.
	- Only the `z2k_template_type` YAML value changes to `block-template`.
	- Obsidian and plugins will treat the file as a normal note, even though Z2K Templates treats it as a block template.

- **Extensions enabled**
	- The file extension is changed to `.block`.
	- The `z2k_template_type` YAML value is set to `block-template`.
	- If template files are currently [[Make .template and .block templates visible-hidden|hidden]], then *the renamed file will disappear from the file navigation bar*. 
	- Tools that ignore non-`.md` files will stop treating it as content, which reduces [[Template Pollution]] in search, Dataview/Bases, and dashboards.

