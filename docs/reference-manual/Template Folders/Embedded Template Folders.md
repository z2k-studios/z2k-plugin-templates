---
sidebar_position: 34
---
If you elect to use Embedded Template Folders, then the plugin will search for Templates to use by looking inside the current folder for a Templates subfolder. This method of storing Template Files is called "embedded" because the template folders are store throughout your system on a folder by folder basis. 

For instance, here is how a vault might look for an embedded template folder configuration:

```text
my-vault/                           ← Root Vault Folder
├── Me.md
├── PARA/
├── LYT/
├── Z2K/
│   ├── Thoughts/
│   │   ├── Templates/              ← Embedded Templates Folder
│   ├── Information/
│   │   ├── Templates/              ← Embedded Templates Folder
│   │   │   └── Template - Book.md  ← Template only visible in Z2K/Information
│   │   │   └── Partial - Quote.md  ← Template only visible in Z2K/Information
│   ├── Interactions/
│   │   ├── Templates/              ← Embedded Templates Folder
│   │   │   └── Lunch Meeting.md    ← Template only visible in Z2K/Interactions
├── Templates/                      ← External Templates Folder
│   ├── Generic File.md             ← Sample Template File, visible globally
└── ...
```

## Embedded Template Hierarchies
By storing Templates on a per-folder basis, you associate the templates directly with the corresponding destination folder that they will be used. This allows for context awareness when creating a new file from a template by limiting the available templates that can be used. 

> [!NOTE] Tree Traversal
> When constructing a list of available Templates that a user can use, the plugin will use the current folder location and look for a `Templates` subfolder. *It will also traverse all parent folders, looking again for `Templates` subfolders, and offer any files found in parent folders as well*. 

> [!NOTE] Global Templates
> When using Embedded Template Folders, any templates placed in the root `Templates` folder will be visible throughout the entire vault.



