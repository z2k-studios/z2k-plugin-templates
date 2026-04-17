---
sidebar_position: 40
sidebar_class_name: z2k-code
sidebar_label: Create new file here
aliases:
- Create new file here
- Create new note here
- Create new card here
---
# Create new file here
Creates a new templated file directly in the folder you right-clicked, skipping the destination selection step.

> [!NOTE] Command Name
> This command appears as "Z2K - Create new file here," "Z2K - Create new note here," or "Z2K - Create new card here" depending on your [[File Naming in Commands|settings]].

## Where It Appears

| Location | Appears? | Condition |
| - | - | - |
| Editor context menu | No | — |
| File explorer menu | Yes | Right-click on a folder |
| Command Palette | No | Use [[Create New File]] instead |

> [!NOTE] Context Menu Only
> This command is **unique to the file explorer context menu** – there's no Command Palette equivalent because the Command Palette doesn't have folder context. For Command Palette usage, see [[Create New File]] which prompts you to select a destination.

## What It Does
When you right-click a folder and choose this command:

1. **Destination is set** – The folder you clicked becomes the destination context (no selection needed)
2. **Select template** – Choose a [[Types of Template Files#Document Templates|document template]]
3. **Fill fields** – Provide values for any [[Template Fields]]
4. **File is created** – New file appears in the folder you right-clicked

## How It Differs from the "Create new file" Command
Z2K Templates has a similar command in the Obsidian Command Palette named "[[Create New File]]". Here is the difference between the two approaches:

| Command                  | Destination                            |
| ------------------------ | -------------------------------------- |
| **Create new file here** | Pre-set to the folder you clicked      |
| [[Create New File]]      | You choose from available destinations |

Use this command when you already know where the file belongs. Use [[Create New File]] when you want to see all destination options.
