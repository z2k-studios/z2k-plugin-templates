---
sidebar_position: 50
sidebar_class_name: z2k-code
aliases:
- finalize file
- finalize note
- finalize card
- Finalize File
---
# Finalize File
Finalizes the current content file immediately, resolving all remaining `{{fields}}` using [[Fallback Behavior|fallback values]] — without prompting. Any field with no fallback value is removed.

> [!NOTE] Command Name
> This command appears as "Finalize file," "Finalize note," or "Finalize card" depending on your [[File Naming in Commands|settings]].

## Availability
Available in the Command Palette when the **active file is a markdown file** (`.md`).

## What It Does
When you run this command, the plugin will:

1. **Scan for remaining fields** – The plugin identifies all `{{field}}` placeholders still in the file
2. **Apply fallbacks** – Each field is resolved using its configured [[Fallback Behavior|fallback value]], if one exists
3. **Remove unresolved fields** – Any field with no fallback is removed from the file entirely
4. **Finalize** – The file is left with no remaining `{{field}}` syntax

No prompts are shown. The command runs to completion silently.

> [!WARNING]
> This is a destructive operation. Any field without a fallback value will be **permanently removed** from the file. There is no undo beyond Obsidian's file history. Use [[Continue Filling File]] if you want to be prompted for remaining fields instead.

## When to Use This
- **Batch workflows** – Quickly lock in multiple files without stepping through prompts
- **Files with complete fallbacks** – When all your fields have sensible defaults and no manual input is needed
- **Cleanup** – Remove stale `{{field}}` placeholders from a file you no longer intend to fill

## Difference from Continue Filling File

| Command | Prompts? | Remaining fields |
|---|---|---|
| [[Continue Filling File]] | Yes — for each field | Deferred fields stay in file |
| **Finalize File** | No | Resolved via fallback or removed |

## Related Commands
- [[Continue Filling File]] – Prompts you for each remaining field instead of using fallbacks
- [[Apply Template to File]] – Applies a template to an existing file, beginning the fill process
- [[Finalize this file (Context Menu)|Finalize This File (Context Menu)]] – Same operation from the file explorer right-click menu

> [!DANGER] INTERNAL NOTES
> - Confirm whether a confirmation dialog is shown before finalizing (issue #134 flagged this as a consideration — "destructive action").
> - Verify the exact command name as it appears in the Command Palette under different naming settings.
> - ==do we need to worry about users that use files of extension .txt ==
