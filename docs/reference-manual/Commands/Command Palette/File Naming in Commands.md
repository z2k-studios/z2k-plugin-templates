---
sidebar_position: 5
aliases:
- file naming in commands
- note vs file vs card
- card reference name
---

# File Naming in Commands
Z2K Templates lets you choose what to call the files you create. Commands adapt their names to match your preference.

## The Setting
In the [[Settings Page]], you can configure the **Card Reference Name** setting. This controls the terminology used throughout the plugin:

- **File** (default) – commands say "Create new file," "Continue filling file," etc.
- **Note** – commands say "Create new note," "Continue filling note," etc.
- **Card** – commands say "Create new card," "Continue filling card," etc.

The underlying functionality is identical – only the labels change.

## Why This Exists
Different knowledge management systems use different terminology:

- Obsidian's core uses "note"
- Zettelkasten practitioners often use "card" or "slip"
- Technical users may prefer the neutral "file"

Z2K Templates adapts to your vocabulary so the plugin feels native to your workflow.

## What Changes
The following commands include your chosen term:

| Default (File) | With "Note" | With "Card" |
| - | - | - |
| Create new file | Create new note | Create new card |
| Create file from selected text | Create note from selected text | Create card from selected text |
| Apply template to file | Apply template to note | Apply template to card |
| Continue filling file | Continue filling note | Continue filling card |

Commands that don't reference content files – like [[Insert block template]] or [[Convert to document template]] – remain unchanged regardless of this setting.

## Changing the Setting

1. Open **Settings** → **Z2K Templates**
2. Find **Card Reference Name** under General Settings
3. Enter your preferred term (e.g., "note" or "card")
4. Close settings – commands update immediately

> [!NOTE]
> This setting affects command names, prompts, and error messages throughout the plugin. It does not rename any actual files in your vault.

> [!DANGER]
> - Verify the exact setting name in the Settings Page code – it may be "Card Reference Name" or similar
> - Confirm whether the setting accepts any string or only predefined options
> - Add a screenshot of the settings UI showing this option
