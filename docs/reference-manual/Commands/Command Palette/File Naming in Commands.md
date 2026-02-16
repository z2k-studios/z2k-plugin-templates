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
| Create New File | Create New Note | Create New Card |
| Create File From Selected Text | Create Note From Selected Text | Create Card From Selected Text |
| Apply Template to File | Apply Template to Note | Apply Template to Card |
| Continue Filling File | Continue Filling Note | Continue Filling Card |

Commands that don't reference content files – like [[Insert Block Template]] or [[Convert to Document Template]] – remain unchanged regardless of this setting.

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
