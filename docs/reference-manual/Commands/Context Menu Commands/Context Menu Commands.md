---
sidebar_folder_position: 20
sidebar_position: 1
sidebar_metacategory: "Basics"
---

# Context Menu Commands
Z2K Templates adds commands to Obsidian's right-click context menus, giving you quick access to template operations without opening the Command Palette.

Context menu commands appear in two locations:
- **Editor menu** – Right-click inside the text editor
- **File explorer menu** – Right-click on files or folders in the navigation pane

## Contents
- [[#Editor Menu Commands]]
- [[#File Explorer Menu Commands]]

## Editor Menu Commands
These commands appear when you right-click inside a markdown file's editor.

| Command                                                                                         | Appears When     | Description                                          |
| ----------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------- |
| [[Create file from selection (Context Menu)\|Create file from selection]]                       | Text is selected | Creates a new file using the selection as input      |
| [[Insert block template (Context Menu)\|Insert block template]]                                 | No text selected | Inserts a block template at cursor                   |
| [[Insert block template using selection (Context Menu)\|Insert block template using selection]] | Text is selected | Inserts a block template, passing selection as input |

## File Explorer Menu Commands
These commands appear when you right-click on files or folders in the file explorer.

| Command                                                                       | Appears When                               | Description                                 |
| ----------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------- |
| [[Create new file here (Context Menu)\|Create new file here]]                 | Right-click on a folder                    | Creates a new templated file in that folder |
| [[Convert to document template (Context Menu)\|Convert to document template]] | File is not a document template            | Marks file as a document template           |
| [[Convert to block template (Context Menu)\|Convert to block template]]       | File is not a block template               | Marks file as a block template              |
| [[Convert to markdown template (Context Menu)\|Convert to markdown template]] | File has `.template` or `.block` extension | Changes extension to `.md`                  |
| [[Convert to content file (Context Menu)\|Convert to content file]]           | File is not a content file                 | Removes template status                     |

## Context Menu vs. Command Palette
Most context menu commands have Command Palette equivalents. The difference is how you access them:

| Access Method       | Best For                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| **Context menu**    | Quick actions on specific files or selections – fewer keystrokes when your hand is on the mouse |
| **Command Palette** | Keyboard-driven workflows, accessing commands from anywhere                                     |

Both methods execute the same underlying operations.

> [!DANGER]
> - Confirm the alt-text display names work correctly for the "(Context Menu)" suffix pattern
> - Check if any context menu commands are missing from this list
