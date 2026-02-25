---
sidebar_position: 30
aliases:
- templates folder name
- template folder name
- embedded templates folder name
---
# Templates Folder Name
The folder name the plugin uses to identify [[Template Folders|template folders]] inside the vault. Any folder in your vault with this exact name is treated as a template folder – its contents appear as available templates.

- **Default:** `Templates`
- **Constraints:**
  - Cannot be empty
  - Cannot contain slashes (`/` or `\`)
  - Cannot be only dots (e.g., `.` or `..`)
  - Disallowed characters: `* ? " < > | :`

For example, if this is set to `Templates`, then a folder at `Projects/Blog/Templates/` would register its contents as templates scoped to `Projects/Blog/`. See [[Template Folders]] for the full discussion of how template folder [[Template Folder Hierarchies|hierarchies]] work.

> [!NOTE]
> The current settings UI labels this field "Embedded templates folder name." This name is outdated – see the bug note below.

> [!DANGER] NOTES
> - **BUG (source code):** The settings UI label and the source code key (`templatesFolderName`) still use the outdated term "Embedded templates folder name." This should be renamed to "Templates Folder Name" to match the [[Template Folders]] reference manual page. The source code key should also be updated from `templatesFolderName` to `templatesFolderName` (or `templateFolderName`). See GitHub issue #151 and `src/main.tsx` lines 227–248.
