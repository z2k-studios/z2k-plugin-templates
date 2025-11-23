---
sidebar_position: 100
sidebar_class_name: z2k-code
doc_state: revised_ai_draft_1
---
# Convert to Content File

## Overview
The **Convert to Content File** command turns the current file into a normal [[Types of Template Files#Content Files|Content File]] in the vault. It remove the template role from the file; Z2K Templates will no longer treat the file as a template, and it ensures the file uses a standard `.md` extension where appropriate.

Use this command when a file **used to be** a template (document or block) but you now want it to behave as an ordinary note in your vault.

## What the Command Does
When you run **Convert to Content File** on the active file:

- It sets the [[z2k_template_type]] YAML property to `content-file` or removes it entirely.
- If the file currently has a `.template` or `.block` extension, it renames the file to `.md`.
- Z2K Templates stops treating the file as a template during card creation, block insertion, and related workflows.

### Notices

> [!NOTE] May Need to Move It Out of the Template Folder
> If you are converting a template file to a content file, you will also need to move the file out of the [[Template Folders|Template Folder]]. See [[#Interaction with Template Folders]] discussion below

### YAML Before and After
**Before** (template file):

```md
---
title: "Person – Base Template"
z2k_template_type: document-template
---
# {{Name}}
```

**After** running **Convert to Content File**:

```md
---
title: "Person – Base Template"
z2k_template_type: content-file
---
# {{Name}}
```

If you also previously used `.template`, the file will be renamed, for example, from `Person – Base Template.template` to:

- `Person – Base Template.md`

## When to Use It
Use **Convert to Content File** when:
- You promoted a note into a template for a while and now want it to stop acting as a template.
- You accidentally converted a file into a template and want to revert that change.
- You are refactoring a template into a new file and want the original to live on as a static note.

This is a semantic reset – it tells Z2K Templates “this file is now ordinary content.”

## Interaction with Template Folders
If the converted file still lives inside a dedicated [[Template Folders|Template Folder]]:
- It will have a `.md` extension and `content-file` semantics.
- However, other folder-based logic (or your own organizational rules) might still treat it as a template-like file.

If your intention is to turn it into a fully normal note, you may also want to:
- Move it to a non-template folder.
- Update any references that previously treated it as a template.

## How It Interacts with File Extensions
Behavior depends on whether [[Use Template File Extensions|Template File Extensions are Enabled]]:

- **Extensions disabled**
	- The file extension remains `.md`.
	- The `z2k_template_type` field is set to `content-file` (or is removed).

- **Extensions enabled**
	- Files with `.template` or `.block` extensions are renamed to `.md`.
	- The `z2k_template_type` field is set to `content-file` (or is removed).
