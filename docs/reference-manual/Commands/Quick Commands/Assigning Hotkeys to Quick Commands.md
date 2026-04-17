---
sidebar_position: 30
aliases:
- quick command hotkeys
- quick create hotkeys
- hotkey assignment
---
# Assigning Hotkeys to Quick Commands
Quick Commands integrate with Obsidian's hotkey system. Once you've created a command, you can assign any keyboard shortcut to trigger it instantly.

## Contents
- [[#How to Assign a Hotkey]]
- [[#Finding Your Commands]]

## How to Assign a Hotkey
Assigning a hotkey to a Quick Command works like any other Obsidian command:

1. Open **Settings** → **Hotkeys**
2. In the search box, type the name of your Quick Command (or just "Z2K" to see all plugin commands)
3. Find your command in the filtered list
4. Click the **+** icon to the right of the command
5. Press your desired key combination
6. The hotkey is saved automatically

![[hotkey-assignment.png]]
(Screenshot: Obsidian's Hotkeys settings panel with a Quick Command being assigned a keyboard shortcut)

## Finding Your Commands
Quick Commands appear in the hotkeys list prefixed with the plugin name. For example, if you created a command named "New Thought", it appears as:

```
Z2K - Templates: New Thought
```

You can search for:
- The full command name: "New Thought"
- The prefix: "Z2K"
- Partial matches: "Thought"

> [!TIP]
> For your most frequent Quick Commands, consider "stealing" common shortcuts. Many users reassign `Ctrl+N` (normally "new note") to their primary Quick Command since it provides more control over where and how notes are created.

> [!WARNING] Conflict Detection
> Obsidian warns you if your chosen hotkey conflicts with an existing assignment. You can override system shortcuts, but be aware this may affect other functionality.
