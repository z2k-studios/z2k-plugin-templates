---
sidebar_position: 40
aliases:
- Hiding Template Folders
- Hide Template Folders
---
# Hiding Template Folders
So you've embraced the world of templates and now have a ton of [[Template Folders]] located throughout your vault. **Wonderful**! You are now a Z2K Templates power user.

But… the proliferation of these `Templates` subfolders is beginning to feel like an uncomfortable itch. Do you find yourself wishing you could just hide these Template folders so that they are not visible inside Obsidian?

This page is meant to scratch that exact itch by providing a couple of options to reduce the visibility of `Templates` folders. It presents several options:
- [[#Method 0 - Embrace It]]
- [[#Method 1 - Change The Templates Folder Name]]
- [[#Method 2 - Embed Templates Directly in Folders]]
- [[#Method 3 - Hide the Templates Folders]]
- [[#Method 4 - Use Templates Subfolders]]

> [!INFO] Recommended Approach
> If your goal is to fully hide template files from Obsidian's file explorer, **Method 2 with [[Template File Extensions]]** is the cleanest solution. It lets you store templates anywhere without needing special folder names, and the plugin provides a built-in command to toggle their visibility. **Method 3** (dot-prefix folders) is a lighter-weight alternative that hides the folder itself but requires working outside of Obsidian to manage template files.


> [!WARNING] Advanced Users Only
> Please note that these methods are presented for advanced users only. We highly encourage not pursuing these advanced methods until your collections of templates files have stabilized. Making Template files less visible in your vault also means that they are more difficult to modify. Thus, please exercise some caution.

## Method 0 - Embrace It
The first option, like many options in life, is to actually do nothing. Take pride in your templates and let them reside with prominence in Template Folders throughout your vault.

If you are actively still editing and refining your repertoire of template files, this is likely the best course of action.

## Method 1 - Change The Templates Folder Name
The easiest option is to change the name of the templates folder to be less prominent, for example "`_templates`", or "`_t`". You can change the name of the templates folder in the [[Settings Page]]. This, of course, does not solve the itch, but at least makes it less visible.

## Method 2 - Embed Templates Directly in Folders
One option is to move your [[Template Files]] out of the [[Template Folders|Template Folder]] and embed them directly within each content folder, thereby allowing you to remove the template folder completely. You will still need to mark your template files to be recognized as templates and the plug-in offers two ways to do this:
- Use [[Template File Extensions]]
- Use [[YAML Configuration Properties]]

The difficulty with this approach, however, is that you can easily trade one problem for another. Now, instead of having a proliferation of template folders, your template files will be proliferated within your content files. If you use the [[Template File Extensions]] approach, you are able to hide the template files from Obsidian using the [[Make .template and .block Templates Visible-Hidden|Make .template and .block templates hidden]] command.

## Method 3 - Hide the Templates Folders
Another approach is to rename your template folders with a dot prefix (e.g. for the default naming, you can rename your template folders to  `.Templates`). Obsidian treats any folder whose name begins with `.` as a system folder and excludes it from the file explorer and search. The Z2K Templates plugin explicitly supports this convention — it always checks for a dot-prefixed version of your template folder name at each level of your vault hierarchy, even when that folder is invisible to Obsidian.

### Naming Convention
The hidden folder name follows a fixed pattern: a `.` prepended to the [[Settings Page|configured template folder name]].

| Template Folder Setting | Hidden Folder Name |
| ----------------------- | ------------------ |
| `Templates` (default)   | `.Templates`       |
| `_t`                    | `._t`              |
| `My Templates`          | `.My Templates`    |

This means if you rename your template folder setting from `Templates` to anything else, the dot-prefix convention follows automatically — just prepend `.` to whatever name you configured.

> [!WARNING] Advanced File System Knowledge Required
> Knowing how to rename folders to be prefixed with `.` typically requires familiarity with your operating system's file manager or terminal. On macOS and Linux, dot-prefixed files and folders are hidden by default. On Windows, they are visible in File Explorer but hidden from Obsidian.

## Method 4 - Use Templates Subfolders
A third approach is to use subfolders inside a root-level templates folder. This is not recommended for vaults that are still in flux as it requires manual updating whenever the folder structure is modified. Please see [[Template Folder Subfolders]] for more details.

> [!DANGER] Internal Notes
> - Method 3 is confirmed in code (`getAllTemplates`, `getBlockCallbackFunc`): the plugin constructs `dotTfn = '.' + this.settings.templatesFolderName` and uses the file adapter to scan for it at each folder level. This bypasses Obsidian's metadata cache entirely.
> - ==**#TEST** Verify that system blocks inside `.Templates` folders are also discovered correctly. The system block walk (`getSystemBlocks`) should follow the same dot-prefix logic — confirm.==
> - ==**#TEST** Verify behavior on Windows where dot-prefixed folders are visible in File Explorer but not in Obsidian's explorer. The adapter-based scan should work regardless of OS.==
> - The `INFO` callout recommending File Extensions over dot-prefix is a soft recommendation — confirm with the team that this is the preferred guidance before publication.
