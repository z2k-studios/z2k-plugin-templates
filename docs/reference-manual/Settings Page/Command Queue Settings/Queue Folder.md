---
sidebar_position: 20
aliases:
- queue directory
- command queue directory
- queue folder
---
# Queue Folder
The folder the plugin watches for incoming JSON and JSONL command files.

- **Default:** `.obsidian/plugins/z2k-plugin-templates/command-queue`
- **Accepts:** Vault-relative or absolute path
- **Disallowed characters:** `* ? " < > |`

A vault-relative path is relative to the root of your Obsidian vault. 

This setting is only visible when [[Enable Command Queue]] is on.

## Default Queue Folder
The default places the queue folder inside the plugin's own data directory. This folder makes the most sense from an Obsidian perspective, but can be difficult to access for some applications that may be writing to it. In particular, the plugin folder resides below the `.obsidian` folder which is treated as a "system area" on some operating systems, and thus may not be easily accessible.

## Alternative Queue Folder
Given some that some applications may have difficulty accessing the folder, you may wish to consider making the command queue folder be an actual folder inside your vault. For instance, you could create a root "`System/Z2K-Templates/Command-Queue`" folder to allow for quick monitoring within Obsidian. Do note, though, that the generated files may be scanned by Obsidian depending on your list of valid file extensions. 

## External Queue Folder
You can also use an absolute system path if you need the queue folder outside the vault – for example, if an external automation tool writes to a shared directory. 

Do note, however, that some operating systems (e.g. mobile OS's like iOS) are heavily sandboxed, which makes accessing external folders problematic if not impossible. 


> [!DANGER] NOTES
> - Not sure if you can specify a non-vault folder location (absolute path) on mobile platforms that are heavily sandboxed. Needs testing.
