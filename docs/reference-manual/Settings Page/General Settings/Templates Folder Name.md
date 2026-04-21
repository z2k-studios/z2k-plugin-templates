---
sidebar_position: 30
aliases:
- templates folder name
- template folder name
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
