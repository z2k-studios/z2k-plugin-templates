---
sidebar_position: 90
sidebar_class_name: z2k-code
aliases:
- switch to .md extension
- switch to md extension
---
# Switch to .md Extension
Changes a template file's extension from `.template` or `.block` back to `.md`, while leaving its template type exactly as it was. This is a pure storage change — the file remains a fully functional template.

## Availability
Available in the Command Palette when the **active file has a `.template` or `.block` extension**. If your templates already use `.md`, this command won't appear.

## What It Does
This command does one thing: renames the file back to `.md`. It does not change what the template *is*.

- If `z2k_template_type` is already set in the YAML, it is left unchanged
- If `z2k_template_type` is missing, it is inferred from the old extension and added:
  - `.template` → `z2k_template_type: document-template`
  - `.block` → `z2k_template_type: block-template`

The YAML inference step is a preservation measure — not a conversion. The template's identity was already established by its extension; the command just makes that explicit before the extension disappears.

> [!NOTE] Contrast with "Convert to..." Commands
> [[Convert to Document Template]] and [[Convert to Block Template]] change the template's *type* — with an extension change as a possible side effect. This command changes *only* the extension. It never alters `z2k_template_type`.

## Example

**Before** (block template with `.block` extension, YAML already set):

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

The YAML is unchanged. Only the extension changes.

## When to Use It
- You want a template visible as a regular `.md` file (e.g., for tools that don't recognize `.template`/`.block`)
- You're troubleshooting and need the file accessible in Obsidian's default file explorer
- You prefer `.md`-based templates but still want full template functionality

> [!NOTE] Move into a Template Folder
> If you're switching a content file to `.md` template storage, you may still need to move it into a [[Template Folders|template folder]] for it to appear in template pickers.

## Related Commands
- [[Convert to Document Template]] – Mark as document template (with `.template` extension if enabled)
- [[Convert to Block Template]] – Mark as block template (with `.block` extension if enabled)
- [[Convert to Content File]] – Remove template status entirely

> [!DANGER] INTERNAL NOTES
> - Known GitHub Issues:
>   - GH Issue #136: Renamed from "Convert to markdown template" to "Switch to .md extension" — implemented and confirmed done.
> - Concerns:
>   - The behavior when the active file is a content file (not a template) is undocumented here — does the command appear? Does it set `document-template` by default?
> - Testing Items:
>   - #TEST/User: Verify YAML inference behavior — run on a `.template` file with no `z2k_template_type` and confirm it is set to `document-template`
>   - #TEST/User: Verify YAML inference behavior — run on a `.block` file with no `z2k_template_type` and confirm it is set to `block-template`
>   - #TEST/User: Confirm command does not appear when active file is already `.md`
