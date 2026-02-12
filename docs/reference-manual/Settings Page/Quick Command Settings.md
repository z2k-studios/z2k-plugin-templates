---
sidebar_position: 20
aliases:
- quick command settings
---
# Quick Command Settings
The Quick Create Commands section in the settings panel lets you define custom commands that appear in Obsidian's Command Palette.

![[quick-create-settings-panel.png]]
(Screenshot: The Quick Create Commands settings section showing configured commands)

## Configuration
For complete documentation on Quick Create Commands, including:
- What each property means
- How to add, edit, and delete commands
- How to assign hotkeys
- Example configurations

See [[Quick Create Commands]] in the Commands section.

## Quick Reference
Each command row contains:
- **Name** — The command name shown in the Command Palette
- **Action** — What the command does (create file or insert block)
- **Target Folder** — Where to create files or find block templates
- **Template** — Which template to use
- **Source Text** — Whether to include selection or clipboard content

Use the **Add Command** button to create new commands. Use the arrow buttons to reorder, and the trash icon to delete.

> [!DANGER] IMPLEMENTATION STATUS
> The current UI only shows Name and Target Folder fields. The full property set (Action, Template, Source Text) is planned but not yet implemented. See [GitHub issue #138](https://github.com/z2k-studios/z2k-plugin-templates/issues/138).
