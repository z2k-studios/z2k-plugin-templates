---
sidebar_position: 10
aliases:
- templates root folder
- root folder
---
# Templates Root Folder
This allows you to specify the root folder that scopes the entire Z2K Templates plugin. Think of it as setting the root folder for the *operating area* for the Z2K Templates plugin. When set, the plugin confines all of its activity – template discovery, file creation, and contextual commands – to that folder and its subfolders.

- **Default:** Empty (uses the vault root)
- **Accepts:** A vault-relative path – that is, a path relative to the root of your Obsidian vault
- **Disallowed characters:** `* ? " < > | :`

Leave this blank to allow Z2K Templates to operate across your entire vault (the default, and for most, the correct setting). Set it to a path like `/Projects` or `/SecondBrain/Z2K` to restrict the plugin to that section of your vault only.

> [!NOTE] Leading Slashes Are Optional
> A leading `/` is accepted but stripped internally – `/Projects` and `Projects` are treated identically. All paths in this field are always vault-root relative, regardless of whether you include a leading slash. There is no way to enter an absolute filesystem path here (unlike [[Queue Folder]] and [[Error Log File]], which accept absolute paths).

## What the Root Folder Scopes
Setting a Templates Root Folder affects the following behaviors:

- **Template discovery**
	- Only [[Template Folders|template folders]] at or below the root are scanned. Templates stored outside the root are invisible to the plugin.
- **File creation** 
	- New files are created within the root folder hierarchy. The card-type folder selected during creation must be inside the root; the plugin blocks the operation if it is not.
- **Contextual commands** 
	- The [[Create new file here (Context Menu)|Create new file here]] right-click command will only succeed when invoked on a folder inside the root. (The menu item still appears on other folders, but clicking it outside the root produces an error.)
- **System block inheritance** 
	- The root is the ceiling for [[System and Global Blocks|system block]] walk-up. The plugin stops looking for `.system-block.md` files at the root and never goes above it.
- **Block reference paths** 
	- The leading-slash block reference syntax (e.g., `/MyBlock`) for [[How Do You Use Block Templates|Block Templates]] resolves paths relative to the root folder. ==Verify This==

> [!NOTE]
> File creation via [[URI Commands]] and [[Command Queues]] can specify a destination directory directly and may bypass the root folder restriction. All other creation paths enforce it.


> [!DANGER] NOTES
> - The contextual "create here" menu item appears on all folders regardless of root folder setting. It only fails at execution time if outside the root. This is a UX gap – ideally the item would be suppressed or grayed out for out-of-scope folders.
> 	- I believe this is [GitHub issue #152](https://github.com/z2k-studios/z2k-plugin-templates/issues/152)
