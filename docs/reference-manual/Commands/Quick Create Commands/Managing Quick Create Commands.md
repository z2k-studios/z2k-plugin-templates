---
sidebar_position: 20
aliases:
- managing quick commands
- add quick command
- delete quick command
- edit quick command
---
# Managing Quick Create Commands
Quick Create Commands are configured in the plugin settings. This page covers how to add, edit, delete, and reorder your commands.

## Contents
- [[#Accessing Quick Create Settings]]
- [[#Adding a New Command]]
- [[#Command Properties]]
- [[#Editing a Command]]
- [[#Deleting a Command]]
- [[#Reordering Commands]]

## Accessing Quick Create Settings
Open the Quick Create Commands configuration:

1. Open **Settings** → **Community Plugins** → **Z2K Templates** → **Options**
2. Scroll to the **Quick Create Commands** section

![[quick-create-settings-panel.png]]
(Screenshot: The Quick Create Commands section showing a list of configured commands with input fields and control buttons)

## Adding a New Command
To create a new Quick Create Command:

1. Click the **Add Command** button at the bottom of the commands list
2. A new row appears with empty fields
3. Configure the [[#Command Properties]] as needed
4. Changes save automatically

You can also insert a command between existing ones by clicking the **+** button on any row—the new command appears below that row.

## Command Properties
Each Quick Create Command has the following properties:

### Name
The display name for your command. This appears in the Command Palette prefixed with "Z2K:". Choose something descriptive and action-oriented.

**Examples:**
- "New Thought" → appears as "Z2K: New Thought"
- "Meeting Note" → appears as "Z2K: Meeting Note"
- "Insert Code Block" → appears as "Z2K: Insert Code Block"

### Action
What the command does when triggered. Select from the dropdown:

| Action | Description |
|--------|-------------|
| **Create New File** | Creates a new file from a template |
| **Insert Block** | Inserts a block template at the cursor position |

### Target Folder
Where the new file will be created (for "Create New File" action) or which folder's block templates to use (for "Insert Block" action).

| Option | Behavior |
|--------|----------|
| *Folder path* | Uses the specified folder (e.g., `/Projects/Active`) |
| **Ask** | Prompts you to choose a folder each time |

When using [[Template Folder Hierarchies]], the target folder determines which templates are available. Only templates visible from that folder's hierarchy appear in the template picker.

### Template
Which template to use for the action.

| Option | Behavior |
|--------|----------|
| *Template file* | Uses the specified template automatically |
| **Ask** | Prompts you to choose from available templates |

Click the file picker button to browse and select a template file.

### Source Text
Whether to pass text into the template as the `{{sourceText}}` field.

| Option | Behavior |
|--------|----------|
| **None** | No source text is passed |
| **Selection** | Uses the currently selected text in the editor |
| **Clipboard** | Uses the current clipboard contents |

This is useful for commands like "Create note from selection" where you want the selected text automatically included in the new file.

## Editing a Command
Simply modify any field in the command row. Changes save automatically after you finish typing (with a brief debounce delay).

Renaming a command does not break existing hotkey assignments—the command retains its internal ID.

## Deleting a Command
Click the **trash** icon on the right side of the command row. The command is removed immediately.

> [!WARNING]
> Deleting a command also removes any hotkey assignments associated with it. There is no confirmation prompt.

## Reordering Commands
Use the **up** and **down** arrow buttons to change command order. The order affects:
- How commands appear in the settings panel (for organization)
- The order in the [[Perform Quick Command]] picker

> [!NOTE]
> Command order does not affect their position in Obsidian's Command Palette—Obsidian sorts commands alphabetically.

> [!DANGER] IMPLEMENTATION STATUS
> The current implementation only supports:
> - Name field
> - Target Folder field (no "Ask" option yet)
>
> Action type, Template selection, and Source Text options are planned but not yet implemented. The UI currently shows only Name and Target Folder inputs. See [GitHub issue #138](https://github.com/z2k-studios/z2k-plugin-templates/issues/138).
