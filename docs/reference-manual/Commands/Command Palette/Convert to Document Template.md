---
sidebar_position: 70
sidebar_class_name: z2k-code
aliases:
- convert to document template
---
# Convert to document template
Turns the current file into a [[Types of Template Files#Document Templates|document template]] – a reusable pattern for creating new files. The command marks the file as a document template and optionally changes its file extension.

## Availability
Available in the Command Palette when the **active file is not already a document template**. For instance, this command is hidden if the file's [[z2k_template_type]] is already set to `document-template`.

## What It Does
When you run this command:
- Sets the [[z2k_template_type]] YAML property to `document-template`
- If [[Template File Extensions]] are enabled, changes the file extension to `.template`

### YAML Before and After
**Before** (plain content file):

```md
---
title: "Project – Kickoff"
---
# Project – {{Name}}

{{Summary}}
```

**After** running the command:

```md
---
title: "Project – Kickoff"
z2k_template_type: document-template
---
# Project – {{Name}}

{{Summary}}
```

If template file extensions are enabled, the file is also renamed from `Project – Kickoff.md` to `Project – Kickoff.template`.

## When to Use It
Use this command when:
- You have a file structure you want to reuse for multiple entities (people, projects, meetings, tasks)
- You're ready to treat a file as the canonical pattern for a file type
- You want to convert a `.md` template to use the `.template` extension

Document templates typically live in [[Template Folders]] and are used by [[Create new file]] and related commands.

> [!NOTE] Move into a Template Folder
> If you're converting a content file into a document template and not using [[Template File Extensions]], then you'll also need to move it into a [[Template Folders|template folder]] for it to appear in template pickers.

> [!WARNING] Template Disappeared?
> If your file vanishes from the file explorer after this command, you likely have [[Use Template File Extensions|template extensions enabled]] and templates are currently [[Make .template and .block templates visible-hidden|hidden]]. Run **Make .template and .block templates visible** to see it again.

## How It Interacts with File Extensions
Behavior depends on whether [[Use Template File Extensions|template file extensions are enabled]]:

**File Extensions disabled:**
- File extension remains `.md`
- Only `z2k_template_type` is set to `document-template`
- The file appears like any other markdown file, which can increase [[Template Pollution]]

**File Extensions enabled:**
- File is renamed to `.template`
- YAML type is set to `document-template`
- If templates are [[Make .template and .block templates visible-hidden|hidden]], the file disappears from navigation
- Tools focused on `.md` files will exclude it from content views

## Related Commands
- [[Convert to block template]] – Mark as a block template instead
- [[Convert to markdown template]] – Revert a `.template` file back to `.md`
- [[Convert to content file]] – Remove template status entirely

