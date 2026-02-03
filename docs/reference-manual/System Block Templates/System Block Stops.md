---
sidebar_position: 100
doc_state: initial_ai_draft
aliases:
- System Stop Blocks
- System Block Stop Files
- .system-block-stop
---
# System Block Stops

[[Intro to System Blocks|System Blocks]] inherit upward – a template at any folder depth collects `.system-block.md` files all the way to the templates root, merging them top-down. That's powerful, but sometimes a subfolder needs a clean slate. A **System Block Stop** cuts the inheritance chain at a specific folder, preventing any parent-level system blocks from reaching templates below it.

## How It Works

Place an empty file named `.system-block-stop` in any folder within your templates hierarchy. When the plugin walks upward from a template's folder to collect system blocks, it will:

- **Read** the `.system-block.md` in the folder containing the stop file (if one exists)
- **Stop** – it will not continue to any parent folders above that point

The stop file itself has no content. Its presence alone is the signal.

> [!NOTE]
> The `.system-block-stop` file only blocks **upward** inheritance. System blocks at the stop folder level and in child folders below it still function normally.

## When to Use a Stop File

Stop files are useful when a section of your vault needs to operate independently from the broader system block hierarchy:

- **Project folders** – A project subfolder with its own metadata conventions that shouldn't inherit vault-wide defaults
- **Isolated template sets** – Templates designed for a specific workflow that require a controlled, minimal set of YAML fields
- **Overriding without accumulation** – When you don't just want to override specific YAML keys (which [[Using System Blocks and YAML|last-wins merging]] handles), but want to prevent parent content and fields from appearing at all

## Example

Consider this folder structure:

```
Templates/
├── .system-block.md              ← vault-wide defaults
├── Projects/
│   ├── .system-block.md          ← project-level settings
│   ├── .system-block-stop        ← stops inheritance here
│   └── Research/
│       ├── .system-block.md      ← research-specific settings
│       └── Paper.md              ← template
```

When creating a note from `Paper.md`, the plugin collects system blocks from:

1. `Templates/Projects/Research/.system-block.md` – included
2. `Templates/Projects/.system-block.md` – included (same folder as the stop file)
3. `Templates/.system-block.md` – **blocked** by the stop file in `Projects/`

Without the stop file, all three levels would merge. With it, `Paper.md` only receives settings from `Projects/` and `Research/`.

## Creating a Stop File

The `.system-block-stop` file is a hidden dot-file, so you'll need to create it outside of Obsidian:

- **macOS/Linux** – In a terminal, navigate to the target folder and run:
  ```bash
  touch .system-block-stop
  ```
- **Windows** – In Command Prompt or PowerShell, navigate to the target folder and run:
  ```powershell
  New-Item .system-block-stop -ItemType File
  ```

The file must be named exactly `.system-block-stop` – no extension, no content required.

> [!WARNING]
> Because the file starts with a dot, it won't be visible in Obsidian's file explorer or in most OS file browsers by default. You may need to enable "show hidden files" in your file manager to see or manage it.

## Interaction with Other Boundaries

The stop file is one of two things that halt the upward traversal of system blocks:

- **`.system-block-stop`** – an explicit boundary you place wherever you want
- **Templates root folder** – the natural boundary; traversal always stops at the root of your configured templates folder

If no stop file is present, the plugin walks all the way up to the templates root, collecting every `.system-block.md` it finds along the way.

The stop file has no effect on the [[Global Block Settings|Global Block]], which is applied separately and always included regardless of stop files.

## See Also

- [[Intro to System Blocks]] for an overview of how system blocks work
- [[Using System Blocks and YAML]] for details on how YAML merges across levels
- [[Template Folder Hierarchies]] for how the plugin traverses folder structures
- [[Global Block Settings]] for the distinction between system blocks and the global block

> [!DANGER] Notes for Review
> - The existing doc referenced GitHub issue #4 (https://github.com/z2k-studios/z2k-plugin-templates/issues/4) as the origin of this feature. That issue was not fetched, so the doc is based purely on code behavior. If the issue contains additional design intent or edge cases, those should be incorporated.
> - The code checks for the stop file **after** reading the current folder's `.system-block.md`. This means the stop folder's own system block is always included. This behavior is documented above, but worth confirming it matches design intent.
> - `sidebar_position: 100` was preserved from the original file. The formula would give `60` (entry 6 in section 17). The high value may be intentional to keep this page last in the section – ==confirm whether 100 or 60 is correct==.
> - There is no UI or command for creating `.system-block-stop` files. The doc instructs users to use terminal commands. If a plugin command for this is planned, that section should be updated.
> - The stop file has no required extension or content. The code only checks `exists()`. ==Confirm that any file at that path triggers the stop – e.g., would a file with content also work?== (Based on code: yes, any file named `.system-block-stop` triggers it regardless of content.)
