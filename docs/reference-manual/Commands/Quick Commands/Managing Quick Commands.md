---
sidebar_position: 20
aliases:
- managing quick commands
- managing quick create commands
- add quick command
- delete quick command
- edit quick command
---
# Managing Quick Commands
Quick Commands are configured through a dedicated editor in the plugin settings. This page covers how to open the editor and how to add, configure, delete, and reorder your commands.

## Contents
- [[#Opening the Quick Commands Editor]]
- [[#Adding a New Command]]
- [[#Command Properties]]
- [[#Deleting a Command]]
- [[#Reordering Commands]]
- [[#Saving Changes]]

## Opening the Quick Commands Editor
1. Open **Settings** → **Community Plugins** → **Z2K - Templates**
2. Scroll to the **Quick Commands** section
3. Click **Edit Quick Commands**

A modal editor opens showing all your configured commands.

![[quick-commands-editor.png]]
(Screenshot: The Quick Commands editor showing a list of configured command cards, each with Name, Action, Target Folder, Template File, and Source Text fields)

## Adding a New Command
To create a new Quick Command:

- Click **Add Command** at the bottom of the editor — a new card appears at the end of the list
- Or click the **+** button on any existing card — a new card appears immediately below it

Fill in the [[#Command Properties]] as needed, then click **Save**.

## Command Properties
Each Quick Command is a card with five fields:

### Name
The display name for your command. This appears in the Command Palette prefixed with the plugin name.

**Examples:**
- "New Thought" → appears as "Z2K - Templates: New Thought"
- "Meeting Note" → appears as "Z2K - Templates: Meeting Note"
- "Insert Code Block" → appears as "Z2K - Templates: Insert Code Block"

### Action
What the command does when triggered. Select from the dropdown:

| Action | Description |
|--------|-------------|
| **Create New File** | Creates a new file from a template |
| **Insert Block** | Inserts a block template at the cursor position |

### Target Folder
Where the new file will be created (for "Create New File") or which folder's block templates to use (for "Insert Block").

| Input | Behavior |
|-------|----------|
| A folder path (e.g., `Projects/Active`) | Uses that folder directly |
| `/` | Uses the vault root |
| *(leave empty)* | Prompts you to choose a folder each time |

When using [[Template Folder Hierarchies]], the target folder determines which templates are available. Only templates visible from that folder's hierarchy appear in the template picker.

### Template File
Which template to use for the action.

| Input | Behavior |
|-------|----------|
| A template file path (e.g., `Templates/Meeting.md`) | Uses that template automatically |
| *(leave empty)* | Prompts you to choose from available templates |

### Source Text
Whether to pass text into the template as the `{{sourceText}}` field.

| Option | Behavior |
|--------|----------|
| **None** | No source text is passed |
| **Selection** | Uses the currently selected text in the editor |
| **Clipboard** | Uses the current clipboard contents |

This is useful for commands like "Create note from selection" where you want selected text automatically included in the new file.

## Deleting a Command
Click the **×** button on the right side of the command card. The command is removed immediately from the editor list.

> [!WARNING]
> Deleting a command also removes any hotkey assignments associated with it. Changes take effect when you click **Save**.

## Reordering Commands
Use the **↑** and **↓** buttons to change command order within the editor. The order affects how commands appear in the editor for your own organization.

> [!NOTE]
> Command order does not affect their position in Obsidian's Command Palette — Obsidian sorts commands alphabetically.

## Saving Changes
Click **Save** to apply all changes and close the editor. Click **Cancel** to discard any unsaved changes. Changes do not take effect until you click **Save**.
