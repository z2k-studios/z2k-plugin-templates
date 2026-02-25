---
sidebar_folder_position: 10
sidebar_position: 1
sidebar_metacategory: "Basics"
---
# Command Palette Commands
Z2K Templates integrates with Obsidian's Command Palette (`Ctrl/Cmd + P`) to give you quick access to template operations. These commands let you create new files from templates, insert block templates, convert files between template types, and more.

> [!NOTE] File, Note, or Card?
> Command names adapt to your [[Settings Page|settings]]. If you've configured Z2K Templates to use "note" or "card" instead of "file," the commands will reflect that choice. See [[File Naming in Commands]] for details.

## Contents
- [[#New File Commands]]
- [[#Block Template Commands]]
- [[#Template Conversion Commands]]
- [[#Utility Commands]]

## New File Commands
Commands for creating new files from templates.

| Command                                     | Availability    | Description                                                          |
| ------------------------------------------- | --------------- | -------------------------------------------------------------------- |
| [[Create New File]]                         | Always          | Creates a new file from a document template                          |
| [[Create File From Selected Text]]          | Text selected   | Creates a new file, passing the selection as data                    |
| [[Apply Template to File]] | Active .md file | Applies a template to an existing file                               |
| [[Continue Filling File]]                   | Active .md file | Resumes prompting for [[Deferred Field Resolution\|deferred fields]] |
| [[Finalize File]]                           | Active .md file | Finalizes a file immediately using fallbacks — no prompting          |

## Block Template Commands
Commands for inserting reusable content blocks.

| Command                                       | Availability                   | Description                                                               |
| --------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------- |
| [[Insert Block Template]]                     | Active .md file, no selection  | Inserts a block template at the cursor                                    |
| [[Insert Block Template Using Selected Text]] | Active .md file, text selected | Inserts a block template, passing the selection as data into the template |

## Template Conversion Commands
Commands for changing a file's template type or file extension.

| Command                                                | Availability                                                  | Description                                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [[Convert to Document Template]]                       | File not already a document template                          | Marks the file as a [[Types of Template Files#Document Templates\|document template]] |
| [[Convert to Block Template]]                          | File not already a block template                             | Marks the file as a [[Types of Template Files#Block Templates\|block template]]       |
| [[Convert to Markdown Template]]                       | File has `.template` or `.block` extension                    | Changes extension back to `.md` while keeping template status                         |
| [[Convert to Content File]]                            | File not already a content file                               | Removes template status, making it a normal file                                      |
| [[Make .template and .block Templates Visible-Hidden]] | [[Use Template File Extensions\|Template extensions enabled]] | Toggles visibility of `.template` and `.block` files                                  |

## Utility Commands
Additional commands for advanced workflows.

| Command                       | Availability                              | Description                                        |
| ----------------------------- | ----------------------------------------- | -------------------------------------------------- |
| [[Process Command Queue Now]] | [[Command Queues\|Offline queue enabled]] | Immediately processes any queued template commands |

## Custom Commands to Specific Templates
You can also design your own commands to interface with specific templates. Please see the [[Quick Create Commands]] for more details. 

## Assigning Commands to Hotkeys
Any command can be assigned a keyboard shortcut in Obsidian:

1. Open **Settings** → **Hotkeys**
2. Search for "Z2K" to filter to Z2K Templates commands
3. Click the **+** icon next to the command you want to assign
4. Press your desired key combination

Common assignments:
- `Ctrl/Cmd + N` → [[Create New File]] (replaces Obsidian's default new note)
- `Ctrl/Cmd + Shift + N` → [[Create File From Selected Text]]

