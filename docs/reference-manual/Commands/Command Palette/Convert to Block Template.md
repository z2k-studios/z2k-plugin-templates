---
sidebar_position: 80
sidebar_class_name: z2k-code
aliases:
- convert to block template
---

# Convert to Block Template
Turns the current file into a [[Block Templates|block template]] – a reusable content fragment that can be inserted into other files. The command marks the file as a block template and optionally changes its file extension.

## Availability
Available in the Command Palette when the **active file is not already a block template**. This command is hidden if the file's [[z2k_template_type]] is already set to `block-template`.

## What It Does
When you run this command:

- Sets the [[z2k_template_type]] YAML property to `block-template`
- If [[Use Template File Extensions|template file extensions are enabled]], changes the file extension to `.block`

The file becomes a building block – a reusable piece of structure that can be embedded via [[Insert Block Template]].

### YAML Before and After

**Before** (plain content file):

```md
---
title: "Status Section"
---
## Status

{{Status}}
```

**After** running the command:

```md
---
title: "Status Section"
z2k_template_type: block-template
---
## Status

{{Status}}
```

If template file extensions are enabled, the file is also renamed from `Status Section.md` to `Status Section.block`.

## When to Use It
Use this command when:

- You find yourself copying the same section between multiple templates
- You want a single source of truth for a checklist, header, or boilerplate block
- You want to keep repetitive scaffolding out of your main document templates


> [!NOTE] Move into a Template Folder
> If you're converting a content file into a block template and are using [[Template Folders]], you'll also likely want to move it into a [[Template Folders|template folder]] so that it can be [[Template Discovery|discovered]].

## How It Interacts with File Extensions
Behavior depends on whether [[Use Template File Extensions|template file extensions are enabled]]:

**Extensions disabled:**
- File extension remains `.md`
- Only `z2k_template_type` is set to `block-template`
- Obsidian treats it as a normal note, even though Z2K Templates treats it as a block

**Extensions enabled:**
- File is renamed to `.block`
- YAML type is set to `block-template`
- If templates are [[Make .template and .block Templates Visible-Hidden|hidden]], the file disappears from navigation
- Tools ignoring non-`.md` files will exclude it, reducing [[Template Pollution]]

## Related Commands
- [[Convert to Document Template]] – Mark as a document template instead
- [[Convert to Markdown Template]] – Revert a `.block` file back to `.md`
- [[Convert to Content File]] – Remove template status entirely
- [[Insert Block Template]] – Use block templates in your files

