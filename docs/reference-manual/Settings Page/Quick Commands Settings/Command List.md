---
sidebar_position: 10
aliases:
- command list
- quick create command list
- dynamic card commands
---
# Command List
The command list is a configurable set of quick create commands. Each command creates a new file in a specific folder with a single action from the Command Palette – no template picker or folder prompt required.

## Command Properties
Each command row contains two fields:

- **Name** – The command name shown in the Command Palette. Choose something short and descriptive, like "New Meeting Note" or "New Blog Post."
- **Target Folder** – The vault-relative path to the folder where new files will be created. For example: `Projects/Blog`.

## Managing Commands
Use the buttons on each row to manage the list:

- **Arrow up / Arrow down** – Reorder commands in the list (and in the Command Palette)
- **Plus** – Insert a new empty command row directly below
- **Trash** – Delete the command

Use the **Add Command** button at the bottom to add a new command at the end of the list.

> [!NOTE]
> The description text in this section adapts to your [[Name for Files]] setting. If you've changed the default from "note" to "card," the description will read "create cards" instead of "create notes."

> [!DANGER] IMPLEMENTATION STATUS
> The current UI only exposes Name and Target Folder per command. Planned properties – Action, Template, Source Text – are not yet implemented in the settings UI. See [GitHub issue #138](https://github.com/z2k-studios/z2k-plugin-templates/issues/138) for status.
> When Git Hub Issue #138 is done, this will need to be rewritten. Most Likely this page will need to be just a very basic overview that then points the reader to the [[Quick Create Commands]] page.
