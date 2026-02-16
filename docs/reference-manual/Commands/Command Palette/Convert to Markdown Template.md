---
sidebar_position: 90
sidebar_class_name: z2k-code
aliases:
- convert to markdown template
---

# Convert to Markdown Template
Changes a template file's extension back to `.md` while preserving its template status. Use this when you want a template to look like a normal markdown file but still function as a template.

## Availability
Available in the Command Palette when the **active file has a `.template` or `.block` extension**. This command only appears for files using [[Template File Extensions]]. If your templates already use `.md`, this command won't be shown.

## What It Does
When you run this command:

**If the file is already a template (document or block):**
- Keeps the [[z2k_template_type]] YAML property unchanged
	- ==if the template type does not exist in the file, then it should add it with the appropriate version that reflects how the file was previously set.==
- Renames the file from `.template` or `.block` to `.md`

**If the file is a content file:**
- Sets [[z2k_template_type]] to `document-template`
- Ensures the file uses the `.md` extension

After the command, Z2K Templates still treats the file as a template, but it looks like a normal markdown file in your vault.

### YAML Before and After

**Before** (block template with `.block` extension):

```md
---
title: "Status Section"
z2k_template_type: block-template
---
## Status
{{Status}}
```

File name: `Status Section.block`

**After** running the command:

```md
---
title: "Status Section"
z2k_template_type: block-template
---
## Status
{{Status}}
```

File name: `Status Section.md`

The YAML type remains `block-template`; only the extension changes.

## When to Use It
Use this command when:

- You have a `.template` or `.block` file but want it visible as a regular `.md` file
- You're troubleshooting and need the file to appear in tools that only recognize `.md`
- You prefer not to use custom file extensions but still want template functionality

> [!NOTE] Move into a Template Folder
> If you're converting a content file into a template via this command, you may need to move it into a [[Template Folders|template folder]] for it to appear in template pickers.

## Related Commands

- [[Convert to Document Template]] – Mark as document template with `.template` extension
- [[Convert to Block Template]] – Mark as block template with `.block` extension


> [!DANGER]
> - Verify behavior when running on a content file – the code suggests it converts to document-template, but confirm this
> - Check if there's a way to convert a content file to a block template with `.md` extension (or if that requires two commands)
