---
sidebar_position: 40
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

The difficulty with this approach, however, is that you can easily trade one problem for another.  now, instead of having a proliferation of template folders, your template files will be proliferated within your content files. If you use the [[Template File Extensions]]  approach, you are able to hide  the template files from Obsidian using the [[Make .template and .block templates visible-hidden|Make .template and .block templates hidden]] command.

## Method 3 - Hide the Templates Folders
Another approach is to rename your template folders to be prefixed with a period. This will cause Obsidian to treat the folder as a system folder and not display it to the user. The Z2K Templates plugin, however, will always look for a `.` prefixed version of the template folder's name and support looking in that folder for templates as well. (This is even the case in the event you change the default name for a Templates Folder).

> [!WARNING] Advanced File System Knowledge Required
> Please be aware that this is for advanced users only. Knowing how to rename folders to be prefixed with a `.` typically requires advanced knowledge of how to use your operating system and file system browsers.

## Method 4 - Use Templates Subfolders
A third approach is to use subfolders inside a root-level templates folder. This is not recommended for vaults that are still in flux as it requires manual updating whenever the folder structure is modified. Please see [[Template Folder Subfolders]] for more details. 
