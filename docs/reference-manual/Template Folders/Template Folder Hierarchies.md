---
sidebar_position: 20
---
# Overview
The simplest way to begin using Z2K Templates is to use a single [[Templates Folder]] located in the [[Templates Root Folder]] (typically the root of your vault). This [[What is a Template Folder#Design Approach Single Root Templates Folder|single Templates Folder design]] is simple and works well for vaults with a small number of Templates. All templates will be globally visible. 

As your vault grows, however, so too will the number of templates in your vault. Even in relatively flat vault structures, the number of templates can balloon quickly. 

To address this, Z2K Templates supports the use of *hierarchical* template folders, where template folders exist within the multiple layers of subfolders within the vault structure. The plugin then uses the knowledge of where in your vault a new file is being created in order to [[Template Discovery|construct a list of relevant templates]] for that particular destination. It limits the list of discovered template to be those existing within the path of the chosen destination. This powerful tool will then give you a list of templates that are only relevant to that particular folder destination. 


> [!INFO] Context Sensitive Templating
> To emphasize, with this feature, your workflow for creating files becomes *context sensitive*. When creating a new file in your vault, you first give it the general context of the file you are creating (inferred by the destination folder) and then the template plugin will only present templates relevant to that context. 

## More Details
Specifically, when a new file is created with the [[Create new note]] command, it will first ask for a destination context (folder). Once the plugin knows the destination, it can then step through the path and build a list of viable templates by looking within any template folders that exist along the way up the path, folder by folder, all the way to the [[Templates Root Folder]].

For example, creating a note under `/Projects/Work/2025/` will include templates from:

```text
/Projects/Work/2025/Templates/
/Projects/Work/Templates/
/Projects/Templates/
/Templates/
```

## Advanced Template Configurations
A further nuanced detail for advanced users: if you are using [[Template Requirements#Advanced Method Use the Template YAML Setting|more advanced techniques]] for identifying template files like [[Template File Extensions]] or [[YAML Configuration Properties]], then you have the ability to store templates directly alongside final content files. In this event, template hierarchies continues to perform as expected. The plugin not only looks for [[Template Folders]] as it traverses up the path of the destination folder, but it also looks for template files directly in the path that are stored with these advanced methods. 

## Template Hierarchies Example

For instance, here is how a vault might look that uses three popular second brain configurations: PARA, LYT and Z2K:

```text
my-vault/                           ← Root Vault Folder
├── Me.md
├── PARA/
├── LYT/
├── Z2K/
│   ├── Thoughts/
│   │   ├── Templates/              ← Templates Folder for Z2K/Thoughts
│   ├── Information/
│   │   ├── Templates/              ← Templates Folder for Z2K/Information
│   │   │   └── Template - Book.md  ← Template only visible in Z2K/Information
│   │   │   └── Partial - Quote.md  ← Template only visible in Z2K/Information
│   ├── Interactions/
│   │   ├── Templates/              ← Templates Folder for Z2K/Interactions
│   │   │   └── Lunch Meeting.md    ← Template only visible in Z2K/Interactions
│   ├── Templates/                  ← Templates Folder for all of Z2K
│   │   ├── Generic Z2K File.md     ← Sample Template File, visible globally
├── Templates/                      ← Templates Folder global for the vault
│   ├── Generic File.md             ← Sample Template File, visible globally
└── ...
```

In the above configuration, the `Templates` folder at the root vault folder contains a "`Generic File`" template. Because this is in a Templates Folder at the very root, it will be visible globally throughout the vault, including within the PARA and LYT folders.

Then, in the `Z2K` folder, there is also a `Templates` folder. Templates store in this folder (e.g. `Generic Z2K File`) will be visible without all Z2K subfolders.

## Additional Examples
Please see [[Template Discovery#Discovery Example|Template Discovery]] for more details and additional examples.

