---
sidebar_position: 110
sidebar_class_name: z2k-code
aliases:
- make .template and .block templates visible
- make .template and .block templates hidden
- toggle template visibility
---
# Make .template and .block Templates Visible-Hidden
Toggles whether `.template` and `.block` files appear in Obsidian's file explorer. This is a visibility switch – it doesn't change the files themselves, only whether you see them while working.

> [!NOTE] Advanced Feature
> This command is part of the advanced [[Template File Extensions]] feature, which must be [[Use Template File Extensions|enabled]] in order for this command to even be seen. 

## What It Does
This is a toggle command. Its name changes based on current state:

- **Make .template and .block Templates Visible** – Shows template files in the file explorer
- **Make .template and .block Templates Hidden** – Hides template files from the file explorer

When **visible:**
- `.template` and `.block` files appear in the file explorer
- You can open and edit them like any other file
- They may appear in searches and some plugin views

When **hidden:**
- `.template` and `.block` files are hidden from the file explorer
- Z2K Templates still uses them internally for file creation and block insertion
- Your navigation focuses on content files only

## When to Make Templates Visible
Set templates to **visible** when:

- Designing or editing document templates or block templates
- Refactoring template folders or renaming templates
- Debugging field or helper function behavior
- Inspecting how templates interact with other plugins

Expect more [[Template Pollution]] in this mode – template files appear in the explorer, searches, and some plugin views.

## When to Make Templates Hidden
Set templates to **hidden** when:

- You're done editing templates
- You want the file explorer to show only content files
- You're sharing the vault with others who shouldn't see the template layer

Hidden mode is a good default for mature systems where templates change infrequently.

## Typical Workflow

1. **Reveal templates** – Run **Make .template and .block Templates Visible**
2. **Edit or refactor** – Find and modify your `.template` and `.block` files
3. **Hide templates again** – Run **Make .template and .block Templates Hidden**

This keeps template maintenance explicit and bounded.

## What Visibility Does NOT Change
Toggling visibility does not affect:

- File names
- YAML frontmatter (including [[z2k_template_type]])
- Folder structure
- Template functionality

It only controls whether these files appear in Obsidian's navigation UI.

## Practical Example
You need to update templates for your person cards:

1. Run **Make .template and .block Templates Visible**
2. Navigate to your [[Template Folders]] and open:
   - `Person – Base.template`
   - `Person – Contact Info.block`
3. Make your changes, test them
4. Run **Make .template and .block Templates Hidden** to return to a content-focused workspace

## Related Commands

- [[Convert to Document Template]] – Create or convert to `.template` files
- [[Convert to Block Template]] – Create or convert to `.block` files


> [!DANGER]
> - Check if hidden templates still appear in Obsidian's search, quick switcher, or graph view
