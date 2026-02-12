---
sidebar_position: 10
aliases:
- quick create overview
- quick command overview
---
# Quick Create Commands Overview
Quick Create Commands let you build custom commands tailored to your workflow. Instead of navigating through template selection dialogs each time, you define commands that pre-configure the action, destination, and template—then trigger them instantly from the Command Palette or via hotkey.

## Why Use Quick Create Commands
The standard [[Create new file]] command works well for occasional use, but frequent template users often want:
- **Fewer prompts** — Skip the folder picker when you always create thoughts in `/Thoughts`
- **Keyboard shortcuts** — Assign `Ctrl+Shift+T` to instantly create a new task
- **Workflow-specific commands** — "New Meeting Note" that uses your meeting template in your meetings folder
- **Block insertion shortcuts** — Quick access to frequently-used block templates

## What Each Command Configures
A Quick Create Command combines several settings into a single action. Each command specifies:

| Property | Purpose |
|----------|---------|
| **Name** | The command name shown in the Command Palette |
| **Action** | What to do: create a new file or insert a block template |
| **Target Folder** | Where to create the file (or "Ask" to prompt each time) |
| **Template** | Which template to use (or "Ask" to prompt each time) |
| **Source Text** | Whether to use selected text, clipboard contents, or nothing |

The combination of "Ask" options gives you flexibility. You can fully automate a command (fixed folder + fixed template), partially automate it (fixed folder, ask for template), or just create a named shortcut that prompts for everything.

## How Commands Appear
Quick Create Commands appear in Obsidian's Command Palette alongside built-in commands. They're prefixed with "Z2K:" to keep them grouped:

- Z2K: New Thought
- Z2K: New Meeting Note
- Z2K: Insert Code Snippet

Because they're standard Obsidian commands, you can assign hotkeys to any of them through **Settings → Hotkeys**.

## Example Workflow
Consider a researcher who frequently creates:
- Literature notes (in `/Research/Literature`, using `Literature Note` template)
- Daily lab entries (in `/Research/Lab Journal`, using `Lab Entry` template)
- Quick ideas (in `/Inbox`, asking which template to use)

With three Quick Create Commands, each becomes a single keystroke. No folder navigation. No template picker (unless desired). Just press the hotkey and start writing.

> [!DANGER] IMPLEMENTATION STATUS
> The current implementation only supports creating files in a specific folder, with template selection prompted each time. The full feature set (action types, template pre-selection, source text handling) is planned but not yet implemented. See [GitHub issue #138](https://github.com/z2k-studios/z2k-plugin-templates/issues/138).
