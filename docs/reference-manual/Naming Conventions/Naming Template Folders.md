---
sidebar_position: 50
aliases:
- naming template folders
- template folder naming conventions
- folder naming
---
# Template Folder Naming
[[Template Folders]] hold your template files and determine which templates are available in a given context.

## The Default Folder Name
The default embedded template folder name is `Templates`. For most users, this is all you need to know.

## Changing the Folder Name
If `Templates` doesn't suit your vault, you can configure a different name in [[General Settings]]. There are no conventions or restrictions on style – use whatever makes sense for your vault.

The one requirement: **the name must be consistent across your entire vault.** The plugin searches for folders with that exact name at every level of your vault's hierarchy to build the [[Template Folder Hierarchies|template folder hierarchy]]. A name mismatch – including case – means the plugin won't recognize that folder as a template folder.

For example, if you configure the name as `_templates`:

```
Vault/
├── _templates/          ← root template folder
│   └── Note.md
├── Projects/
│   ├── _templates/      ← recognized: name matches
│   │   └── Project Brief.md
│   └── Active/
│       └── _templates/  ← recognized: name matches
│           └── Status Update.md
```

> [!NOTE]
> The folder name must be a valid folder name for your operating system. The plugin will warn you if the name contains characters that would cause problems.
