---
sidebar_position: 20
---

# External Template Folders

## Overview


## Configuration Details
When you have configured the plugin to use External Template Folders, you have requested the plugin to search for templates inside a dedicate separate folder within your vault. By default, an External Template Folder uses the root folder `/Templates`.

For instance, here is how a vault might look for an external template folder configuration:

```text
my-vault/                           ← Root Vault Folder
├── Me.md
├── PARA/
├── LYT/
├── Z2K/
│   ├── Thoughts/
│   ├── Information/
│   ├── Interactions/
├── Templates/                      ← External Templates Folder
│   ├── Generic Memory.md           ← Sample Template File
│   └── Template - Book Review.md   ← Sample Template File
│   └── Partial - Quotation.md      ← Sample Partial File
└── ...
```

With an External Template Folder, all Templates will need to be stored in the External Template Folder or its subfolders (see [[#External Template Hierarchies]] below on subfolders).

If you are looking to store multiple External Template Folders, then that is a sign you should consider using [[Embedded Template Folders]].

> [!BESTPRACTICE] Best Practices: Place External Template Folders in the Root
> A best practice is to store your External Templates Folder as close to the Root for ease of access. This is particularly important if you are using [[#External Template Hierarchies]] to make more context aware templates. 

---
## External Template Hierarchies
Using a single folder to store all of your templates files can quickly balloon out of control, with tens or even hundreds of templates being saved in the same directory. This makes the process of choosing templates more time consuming. 

To alleviate this issue, External Template Folders allows you to use subfolders in your `Templates` that mirror the folder structure of your vault. In this way, you can specify the templates that apply only to each folder and its subfolders within your vault. Now, when you specify a Template to use for a new file, it presents a much more limited list of matching Templates based on the folder you are creating a file. 


> [!NOTE] Tree Traversal
> When constructing a list of available Templates that a user can use, the plugin will use the matching folder tree location in the External Templates folder. *It will also traverse all parent folders, offering any files found in parent folders as well*. This allows you to create more complex context sensitive templates and [[Block Templates]] in your vault. 

### Example External Template Hierarchy
To demonstrate how External Template Hierarchies work, take our previous example vault folder structure:

```text
my-vault/                           ← Root Vault Folder
├── Me.md
├── PARA/
├── LYT/
├── Z2K/
│   ├── Thoughts/
│   ├── Information/
│   ├── Interactions/
├── Templates/                      ← External Templates Folder
│   ├── Generic File.md             ← Sample Template File visible everywhere
│   ├── Z2K/
│   │   ├── Information/
│   │   │   └── Template - Book.md   ← Template only visible in Z2K/Information
│   │   │   └── Partial - Quote.md   ← Template only visible in Z2K/Information
│   │   ├── Interactions/
│   │   │   └── Lunch Meeting.md     ← Template only visible in Z2K/Interactions
└── ...
```

Notice in this new vault structure that the `\Templates` root folder now contains subfolders that mirror the folder structure in the root of the vault. Now, if you are creating a new template inside the `/Z2K/Information/` folder, it will show three templates to choose from:

1. `Template - Book.md` -- because it is located in `Templates/Z2K/Information`
2. `Partial - Quote.md` -- also because it is located in `Templates/Z2K/Information`
3. `Generic - File.md` -- because of tree traversal, it will also present this template for use.