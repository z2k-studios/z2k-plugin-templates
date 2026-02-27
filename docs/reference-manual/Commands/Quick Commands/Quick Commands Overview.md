---
sidebar_position: 10
aliases:
- quick commands overview
- quick create overview
- quick command overview
---
# Quick Commands Overview
Quick Commands let you build custom commands tailored to your workflow. Instead of navigating through template selection dialogs each time, you define commands that pre-configure the action, destination, and template — then trigger them instantly from the Command Palette or via hotkey.

## Why Use Quick Commands
The standard [[Create New File]] command works well for occasional use, but frequent template users often want:
- **Fewer prompts** — e.g. Skip the folder picker when you always create quick notes in `/Quick Notes`
- **Keyboard shortcuts** — e.g. Assign `Ctrl+Shift+T` to instantly instantly insert a task block
- **Workflow-specific commands** — e.g. Create a new command "New Meeting Note" that uses your meeting template in your meetings folder
- **Block insertion shortcuts** — Quick access to frequently-used block templates

## What Each Command Configures
A Quick Command combines several settings into a single action. Each command specifies:

| Property | Purpose |
|----------|---------|
| **Name** | The command name shown in the Command Palette |
| **Action** | What to do: create a new file or insert a block template |
| **Target Folder** | Where to create the file (or leave empty to prompt each time) |
| **Template File** | Which template to use (or leave empty to prompt each time) |
| **Source Text** | Whether to use selected text, clipboard contents, or nothing |

Leaving Target Folder or Template File empty gives you flexibility. You can fully automate a command (fixed folder + fixed template), partially automate it (fixed folder, prompt for template), or just create a named shortcut that prompts for everything.

## How Commands Appear
Quick Commands appear in Obsidian's Command Palette alongside built-in commands. They're prefixed with the plugin name to keep them grouped:

- Z2K - Templates: New Thought
- Z2K - Templates: New Meeting Note
- Z2K - Templates: Insert Code Snippet

Because they're standard Obsidian commands, you can assign hotkeys to any of them through **Settings → Hotkeys**.

## Example Workflow
Consider a researcher who frequently creates:
- Literature notes (in `/Research/Literature`, using `Literature Note` template)
- Daily lab entries (in `/Research/Lab Journal`, using `Lab Entry` template)
- Quick ideas (in `/Inbox`, prompting for which template to use)

With three Quick Commands, each becomes a single keystroke. No folder navigation. No template picker (unless desired). Just press the hotkey and start writing.
