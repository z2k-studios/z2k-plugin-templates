---
sidebar_position: 30
aliases:
- quick command hotkeys
- quick create hotkeys
- hotkey assignment
---
# Assigning Hotkeys to Quick Create Commands
Quick Create Commands integrate with Obsidian's hotkey system. Once you've created a command, you can assign any keyboard shortcut to trigger it instantly.

## Contents
- [[#How to Assign a Hotkey]]
- [[#Finding Your Commands]]
- [[#Hotkey Persistence]]
- [[#Suggested Hotkey Patterns]]

## How to Assign a Hotkey
Assigning a hotkey to a Quick Create Command works like any other Obsidian command:

1. Open **Settings** → **Hotkeys**
2. In the search box, type the name of your Quick Create Command (or just "Z2K" to see all plugin commands)
3. Find your command in the filtered list
4. Click the **+** icon to the right of the command
5. Press your desired key combination
6. The hotkey is saved automatically

![[hotkey-assignment.png]]
(Screenshot: Obsidian's Hotkeys settings panel with a Quick Create Command being assigned a keyboard shortcut)

## Finding Your Commands
Quick Create Commands appear in the hotkeys list with the prefix "Z2K:". For example, if you created a command named "New Thought", it appears as:

```
Z2K: New Thought
```

You can search for:
- The full command name: "New Thought"
- The prefix: "Z2K"
- Partial matches: "Thought"

## Hotkey Persistence
Hotkeys are tied to the command's internal ID, not its display name. This means:

**Safe changes:**
- Renaming a command preserves its hotkey assignment
- Reordering commands has no effect on hotkeys

**Breaking changes:**
- Deleting a command removes its hotkey assignment
- If you delete and recreate a command with the same name, it gets a new ID and won't retain the old hotkey

## Suggested Hotkey Patterns
When assigning hotkeys to Quick Create Commands, consider using consistent modifier patterns:

| Pattern | Example Use |
|---------|-------------|
| `Ctrl/Cmd + Shift + Letter` | Primary creation shortcuts |
| `Ctrl/Cmd + Alt + Letter` | Secondary or less frequent commands |
| `Ctrl/Cmd + Shift + Number` | Numbered quick access (1-9) |

**Common assignments:**
- `Ctrl+Shift+T` → New Thought
- `Ctrl+Shift+M` → New Meeting Note
- `Ctrl+Shift+J` → New Journal Entry
- `Ctrl+Alt+B` → Insert Code Block

> [!WARNING] Conflict Detection
> Obsidian warns you if your chosen hotkey conflicts with an existing assignment. You can override system shortcuts, but be aware this may affect other functionality.

> [!TIP]
> For your most frequent Quick Create Commands, consider "stealing" common shortcuts. Many users reassign `Ctrl+N` (normally "new note") to their primary Quick Create Command since it provides more control over where and how notes are created.

> [!DANGER] IMPLEMENTATION STATUS
> Hotkey assignment works correctly with the current implementation. The internal command ID system ensures hotkeys persist across command renames.
