---
sidebar_position: 100
sidebar_class_name: z2k-code
aliases:
- convert to content file
---
# Convert to content file
Removes template status from a file, turning it into an ordinary content file. The file will no longer appear in template pickers or function as a template.

## Availability
Available in the Command Palette when the **active file is considered a template**. The command is visible when any of these conditions are true:
- File has a `.template` or `.block` extension
- File has [[z2k_template_type]] set to `document-template` or `block-template` in YAML
- File is a `.md` file located inside a [[Template Folders|template folder]]

## What It Does
When you run this command:
- Removes the [[z2k_template_type]] YAML property (if present)
- If the file has a `.template` or `.block` extension, renames it to `.md`
- Z2K Templates stops treating the file as a template

This is a semantic reset – it tells Z2K Templates "this file is now ordinary content."

### YAML Before and After

**Before** (document template):

```md
---
title: "Person – Base Template"
z2k_template_type: document-template
---
# {{Name}}
```

**After** running the command:

```md
---
title: "Person – Base Template"
---
# {{Name}}
```

If the file was `Person – Base Template.template`, it becomes `Person – Base Template.md`.

## When to Use It
Use this command when:

- You promoted a note into a template temporarily and now want to revert
- You accidentally converted a file to a template
- You're refactoring and want the original template to become a static note

## Move Out of Template Folder
If the file lives in a [[Template Folders|template folder]], consider moving it elsewhere. While it won't function as a template, keeping it in a template folder may cause organizational confusion as it is now a content file interspersed with your template files.

If the converted file still lives inside a [[Template Folders|template folder]]:
- It will have `.md` extension with no `z2k_template_type` property
- **However**, Z2K Templates will still treat it as a document template because of its location
- The command will notify you that you need to manually move the file outside the template folder

For a clean separation, be sure to move the file to a non-template location after converting.

## How It Interacts with File Extensions

**Extensions disabled:**
- File extension remains `.md`
- `z2k_template_type` property is removed from YAML

**Extensions enabled:**
- `.template` or `.block` files are renamed to `.md`
- `z2k_template_type` property is removed from YAML

## Related Commands
- [[Convert to document template]] – Make a file into a document template
- [[Convert to block template]] – Make a file into a block template

