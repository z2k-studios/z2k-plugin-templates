---
sidebar_position: 40
aliases:
- quick command examples
- quick create examples
- sample quick commands
---
# Quick Create Command Examples
This page presents common Quick Create Command configurations for various workflows. Each example shows the command properties and explains when you'd use that particular setup.

## Contents
- [[#Fully Automated Commands]]
- [[#Partially Automated Commands]]
- [[#Block Template Commands]]
- [[#Selection-Based Commands]]

## Fully Automated Commands
These commands require no prompts—everything is pre-configured. One keystroke creates the file exactly where you want it, using exactly the template you specified.

### New Daily Note
Creates a daily journal entry with no prompts.

| Property | Value |
|----------|-------|
| Name | Daily Note |
| Action | Create New File |
| Target Folder | `/Journal/Daily` |
| Template | `Daily Note Template` |
| Source Text | None |

**When to use:** You write daily notes and want instant access. Assign to `Ctrl+Shift+D`.

### New Zettelkasten Note
Creates an atomic note in your zettelkasten.

| Property | Value |
|----------|-------|
| Name | New Zettel |
| Action | Create New File |
| Target Folder | `/Zettelkasten` |
| Template | `Zettel Template` |
| Source Text | None |

**When to use:** Zettelkasten practitioners who want to capture ideas instantly.

### New Project
Creates a new project file in your active projects folder.

| Property | Value |
|----------|-------|
| Name | New Project |
| Action | Create New File |
| Target Folder | `/Projects/Active` |
| Template | `Project Template` |
| Source Text | None |

**When to use:** Project managers who start new projects frequently.

## Partially Automated Commands
These commands fix some parameters but prompt for others, giving you the right balance of speed and flexibility.

### Quick Thought (Fixed Folder, Ask Template)
Creates a file in your thoughts folder but lets you pick the template.

| Property | Value |
|----------|-------|
| Name | New Thought |
| Action | Create New File |
| Target Folder | `/Thoughts` |
| Template | Ask |
| Source Text | None |

**When to use:** You have multiple thought types (fleeting, literature, permanent) but they all go in the same folder.

### New Note Here (Fixed Template, Ask Folder)
Uses your default template but lets you pick where to put it.

| Property | Value |
|----------|-------|
| Name | New Note Here |
| Action | Create New File |
| Target Folder | Ask |
| Template | `Default Note Template` |
| Source Text | None |

**When to use:** You have a go-to template but organize notes into many different folders.

### Research Note (Ask Both)
Prompts for both folder and template, but provides a named command for discoverability.

| Property | Value |
|----------|-------|
| Name | Research Note |
| Action | Create New File |
| Target Folder | Ask |
| Template | Ask |
| Source Text | None |

**When to use:** Research workflows where context varies but you want a dedicated command (and hotkey) for research specifically.

## Block Template Commands
Commands for inserting block templates into the current document.

### Insert Meeting Agenda
Inserts your standard meeting agenda block at the cursor.

| Property | Value |
|----------|-------|
| Name | Insert Meeting Agenda |
| Action | Insert Block |
| Target Folder | `/Templates/Blocks/Meetings` |
| Template | `Meeting Agenda Block` |
| Source Text | None |

**When to use:** You run meetings and frequently need to add an agenda section.

### Insert Code Snippet (Ask Which)
Prompts you to choose from your code snippet blocks.

| Property | Value |
|----------|-------|
| Name | Insert Code Snippet |
| Action | Insert Block |
| Target Folder | `/Templates/Blocks/Code` |
| Template | Ask |
| Source Text | None |

**When to use:** Programmers who maintain a library of code templates and want quick access.

### Insert Callout
Inserts a callout/admonition block.

| Property | Value |
|----------|-------|
| Name | Insert Callout |
| Action | Insert Block |
| Target Folder | `/Templates/Blocks` |
| Template | `Callout Block` |
| Source Text | None |

**When to use:** Technical writers who frequently use callouts for notes, warnings, tips.

## Selection-Based Commands
Commands that capture selected text or clipboard content and pass it to the template.

### Create Note from Selection
Creates a new note with the selected text as content.

| Property | Value |
|----------|-------|
| Name | Note from Selection |
| Action | Create New File |
| Target Folder | `/Inbox` |
| Template | `From Selection Template` |
| Source Text | Selection |

**When to use:** You're reading a long document and want to extract a passage into its own note.

### Create Task from Selection
Converts selected text into a task note.

| Property | Value |
|----------|-------|
| Name | Task from Selection |
| Action | Create New File |
| Target Folder | `/Tasks` |
| Template | `Task Template` |
| Source Text | Selection |

**When to use:** During meetings or reviews when you identify action items inline.

### Quote to Note
Creates a quote/reference note from clipboard content.

| Property | Value |
|----------|-------|
| Name | Quote to Note |
| Action | Create New File |
| Target Folder | `/References/Quotes` |
| Template | `Quote Template` |
| Source Text | Clipboard |

**When to use:** You copy quotes from external sources and want to capture them with metadata.

## Combining with Hotkeys
For maximum efficiency, pair these commands with memorable hotkeys:

| Command | Suggested Hotkey | Rationale |
|---------|------------------|-----------|
| Daily Note | `Ctrl+Shift+D` | D for Daily |
| New Thought | `Ctrl+Shift+T` | T for Thought |
| New Meeting | `Ctrl+Shift+M` | M for Meeting |
| Note from Selection | `Ctrl+Shift+N` | N for Note (from selection) |
| Insert Callout | `Ctrl+Alt+C` | C for Callout |

> [!DANGER] IMPLEMENTATION STATUS
> The examples above represent the planned feature set. Currently, only the "Create New File" action with a fixed target folder is implemented. Template selection, block insertion, source text handling, and the "Ask" option are not yet available. See [GitHub issue #138](https://github.com/z2k-studios/z2k-plugin-templates/issues/138).
