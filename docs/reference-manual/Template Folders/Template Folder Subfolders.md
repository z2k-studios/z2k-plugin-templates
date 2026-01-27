---
sidebar_position: 30
---
## Using Subfolders Inside Template Folders
[[Template Folders]] are designed to be flat folders with no subfolders. If you need to embed templates at different levels within the vault, then create `Templates` folders at the corresponding folder levels within your vault. See [[Template Folder Hierarchies]] for more details. 

## Advanced Feature :: Template Folders Subfolders
There is, however, a "secret" feature within Z2K Templates in which subfolders within a Templates folder is supported. We would call this "undocumented", except that… well, we are mentioning it right here in the documentation. **But at a minimum, the following feature has not been thoroughly tested and should be used with caution.** Further, it can quickly make for an extremely confusing vault configuration if not used with deliberate care. 

With those caveats aside, here is what happens when you use subfolders within your [[Template Folders]]. 

## An Alternative Folder Hierarchy
As discussed in the [[Template Folder Hierarchies]] page, the plugin uses the folder structure of the vault to help construct a more context aware list of available templates. It does this by traversing upwards along the path until it reaches the [[Templates Root Folder]].

A feature, though, exists where *if* you have subfolders in a Templates folder, *and* that subfolder exists in the same name and relative position in the parent folder, then the plugin will traverse down inside that subfolder. 

## Why Would This Be Useful?
This technique is particularly powerful when applied to a **root level Templates folder**. It allows you to create a "shadow" folder hierarchy / tree inside the templates folder to store all of your Templates files. The plugin will still smartly identify only those Templates relevant to the [[Template Discovery#Understanding Context|destination context]] by looking into subfolders that echo the folder structure of the destination. 

Thus, by using this technique, you can dispense with all of the "`Templates`" folders distributed throughout your vault and use just a single `Templates` folder in your [[Templates Root Folder]]. This makes the vault appear "cleaner", with templates fading away into the background of the vault structure. (See [[Hiding Template Folders]] for other solutions).

## But It Comes With Downsides
This approach is a great way to get rid of all those `Templates` folders embedded throughout your vault - but it comes at a price. 

The primary downside is that you must manually remember to make sure your "shadow" folder structure inside your root level Templates Folder matches *exactly* the same structure of your vault. Renaming a vault folder can cause all of its templates files to no longer be discoverable.

### Example Hierarchy Using Templates SubFolders
To demonstrate how a setup could exist with Template Folders Subfolders, take the [[Template Folder Hierarchies#Template Hierarchies Example|Template Hierarchies Example]], but move all of the templates into a single Templates root level folder, and use subfolders underneath it to add context sensitivity. 

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
│   │   ├── Generic Z2K File.md     ← Template only visible in Z2K & below
│   │   ├── Information/
│   │   │   └── Template - Book.md   ← Template only visible in Z2K/Information
│   │   │   └── Partial - Quote.md   ← Template only visible in Z2K/Information
│   │   ├── Interactions/
│   │   │   └── Lunch Meeting.md     ← Template only visible in Z2K/Interactions
└── ...
```

Notice in this new vault structure that the `\Templates` root folder now contains subfolders that mirror the folder structure in the root of the vault. If you are creating a new template inside the `/Z2K/Information/` folder, it will show four templates to choose from:

1. `Template - Book.md` -- because it is located in `Templates/Z2K/Information`
2. `Partial - Quote.md` -- also because it is located in `Templates/Z2K/Information`
3. `Generic - Z2K File.md` -- because of tree traversal, it will also present this template.
4. `Generic - File.md` -- because of tree traversal, it will also present this template for use.