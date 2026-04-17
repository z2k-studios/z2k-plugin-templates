---
sidebar_position: 10
aliases:
  - the Global Block
---
# Overview of the Global Block
The Global Block is a single block of template content – specified in the plugin settings – that is automatically prepended to every template before rendering. It is the broadest scope at which you can declare shared template behavior: one definition that applies everywhere, every time.

## Contents
- [[#What is the Global Block?]]
- [[#Why Use the Global Block]]
- [[#Is it Truly Global?]]
- [[#How to Edit the Global Block]]
- [[#What is the Difference between the Global Block and System Blocks?]]

## What is the Global Block?
The global block is a user-specified block template that is automatically prepended to every template before rendering by the Z2K Templates engine. It functions identically to a [[System Blocks|system block]] in how it merges YAML frontmatter and prepends body content – but where system blocks are embedded in the folder hierarchy of your vault, the global block lives entirely outside the vault, configured exclusively through the plugin [[Global Block Settings|settings]].

## Why Use the Global Block
The global block is most useful when you have content, field declarations, or YAML properties that should appear in every template without being duplicated. The primary use cases (not mutually exclusive to each other):

- **[[Global Block and Markdown|Insert Global Markdown Content]]** – prepend vault-wide structural text or boilerplate to every file, such as a summary prompt, a copyright notice, or a section divider.
- **[[Global Block and fieldInfo|Configure Global Field Behavior]]** – declare `{{fieldInfo}}` settings once and have them apply across every template: prompts, types, suggested values, computed fields, and overrides.
- **[[Global Block and Field Values|Set Global Field Values]]** - declare new built-in like fields that have preset values, or override the values of existing [[Built-In Fields]].
- **[[Global Block and YAML|Insert Global YAML Properties]]** – inject default YAML frontmatter into every file, merged with the template's own frontmatter using a last-wins strategy.

The global block is particularly valuable when designing a cohesive vault where the same vocabulary of fields and structural conventions recurs across many templates.

## Is it Truly Global?
For practical purposes, yes — the global block is prepended to every [[Types of Template Files#Document Templates|Document Template]] that Z2K Templates instantiates into a new content file. This includes templates triggered from the [[Command Palette]], via [[URI Actions]], and through [[Command Queues]]. All three paths run the same rendering engine with the global block applied.

There are a few meaningful exceptions:
- **Files created outside Z2K Templates** – Obsidian's own commands (e.g., "New Note") create files without involving the Z2K engine at all. The global block is never inserted into files that Z2K didn't create.
- **Areas outside the Templates Root Folder** – If your [[Templates Root Folder]] is configured to a subfolder of your vault rather than the root, Z2K Templates cannot access or create files in the areas outside it. Files created in those areas won't receive the global block.
- **Block template insertion** – When you insert a block template using either block template insertion command (see [[Using Block Templates]]), the global block is not prepended. The global block is specifically scoped to Document Template instantiation — not block-level insertion. (The global block's `{{fieldInfo}}` declarations are still applied to the field resolution context during insertion, but no content is prepended.)

## How to Edit the Global Block
The global block is edited through the plugin settings:

1. Open Obsidian **Settings → Z2K Templates → Advanced → [[Global Block Settings]]**
2. Click **Edit Global Block** to open the [[Global Block Editor]] modal
3. Enter or modify your global block content in the editor
4. The editor validates syntax continuously — the **Save** button enables only when content is valid
5. Click **Save** to apply

For full details on the editor interface – toolbar controls, help panel, validation status, and error decoding – see [[Global Block Editor]].

## What is the Difference between the Global Block and System Blocks?
![[Intro to System Blocks#What is the Difference between System Blocks and the Global Block?]]

> [!DANGER] INTERNAL NOTES
> - "All vaults" UI phrasing in the settings is inaccurate — the global block is per-vault. Tracked in GitHub Issue #[156](https://github.com/z2k-studios/z2k-plugin-templates/issues/156).
> - Scope behavior for URI and command queue was verified in source (`main.tsx` lines 1923, 2114, 1664–1768). Both confirmed to apply the global block for `new` commands.
> - The block template insertion exception (body not prepended, fieldInfos still applied) was verified at `main.tsx` lines 2037 and 2040–2045.
> - "Areas outside the Templates Root Folder" behavior is inferred from how Z2K scopes template discovery — verify if there are edge cases where files outside the root can still be created via URI.
