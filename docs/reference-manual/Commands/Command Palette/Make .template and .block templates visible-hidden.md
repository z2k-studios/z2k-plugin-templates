---
sidebar_position: 110
sidebar_class_name: z2k-code
doc_state: revised_ai_draft_1
aliases:
- Make .template and .block templates visible
- Make .template and .block templates hidden
---

# Make .template and .block templates visible-hidden

## Overview

The **Make .template and .block templates visible-hidden** command pair toggles whether `.template` and `.block` files appear in your Obsidian file explorer. It does not change the files themselves – only how prominently they appear while you are working.

Use these commands to keep your day-to-day workspace focused on content notes while still allowing easy access to template files when you need to edit or debug them.

## What the Commands Do

There are two logical modes:

- **Visible**
  - `.template` and `.block` files are shown in the file explorer.
  - You can open and edit them like any other note.
- **Hidden**
  - `.template` and `.block` files are hidden from the file explorer.
  - Z2K Templates still uses them internally for card creation and block insertion.
  - Your navigation pane focuses on real content instead of machinery.

The exact UI representation may differ (single toggle command vs. two explicit commands), but the behavior is always a visibility switch for template extensions.

## When to Make Templates Visible

Set templates to **visible** when:

- You are designing or editing document templates or block templates.
- You need to refactor template folders or rename templates.
- You are debugging why certain fields or helper functions are not behaving as expected.
- You want to inspect how `.template` or `.block` files interact with other plugins.

In this mode, expect more [[Template Pollution]] – template files will show up in:

- File explorer
- Some searches
- Some plugin views that respect non-`.md` files

## When to Make Templates Hidden

Set templates to **hidden** when:

- You are done editing templates for now.
- You want the file explorer to show only content notes and cards.
- You share the vault with others who should not be distracted by the template layer.

Hidden mode is a good default for mature systems where templates change infrequently.

## Typical Workflow

A common pattern for working with template files is:

1. **Reveal templates**
   - Run **Make .template and .block templates visible**.
2. **Edit or refactor**
   - Use the file explorer to find `.template` and `.block` files.
   - Open and edit them like normal Markdown notes.
   - Use conversion commands such as:
     - [[Convert to Document Template]]
     - [[Convert to Block Template]]
     - [[Convert to Markdown Template]]
     - [[Convert to Content File]]
3. **Hide templates again**
   - Run **Make .template and .block templates hidden**.
   - Return to a clean, content-focused view.

This keeps the “template maintenance” phase explicit and bounded.

## Interactions with File Extensions

These visibility commands assume that you are using [[Template File Extensions]]:

- `.template` – for document templates
- `.block` – for block templates

Visibility toggling does **not** change:

- File names
- YAML `[[z2k_template_type]]`
- Folder structure

It only affects whether these extension types surface in Obsidian’s navigation UI.

If you rely heavily on [[File Extension Process Guide]] patterns, visibility toggling is the final piece that keeps your vault both structured and calm.

## Practical Example

You adopt a new structure for your person cards and need to update all related templates:

1. Run **Make .template and .block templates visible**.
2. Navigate to your [[Template Folders]] and open:
   - `Person – Base.template`
   - `Person – Contact Info.block`
3. Apply structural changes, update fields, and test.
4. When you are satisfied, run **Make .template and .block templates hidden** to return to a content-only workspace.

> [!DANGER]
> - Confirm whether the UI exposes this as a single toggle command or as two separate commands (“visible” and “hidden”) and align the wording of this page with the actual command names.
> - The exact mechanism used to hide/show `.template` and `.block` files (e.g., view registration, filter hooks) should be verified against Obsidian’s current API; changes there may affect what “hidden” truly means.
> - If future versions add support for additional template-specific extensions, this page will need to be updated to describe their visibility behavior as well.
> - If you later decide to register `.template` and `.block` as markdown views again (via `viewRegistry.registerExtensions`), revisit the “How Obsidian Treats Template Extensions” section – the hiding behavior will change significantly once those extensions are treated as full markdown notes again.

