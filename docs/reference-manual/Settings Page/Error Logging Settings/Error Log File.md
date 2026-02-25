---
sidebar_position: 10
aliases:
- error log file
- error log path
- log file path
---
# Error Log File
The path to the file where log entries are written.

- **Default:** `.obsidian/plugins/z2k-plugin-templates/error-log.md`
- **Accepts:** Vault-relative or absolute path
- **Disallowed characters:** `* ? " < > |`

A vault-relative path is relative to the root of your Obsidian vault. The default places the log inside the plugin's data directory, keeping it out of your regular vault files. 

The log file is created automatically if it does not exist. Because it uses the `.md` extension, you can open and read it directly in Obsidian.
## Alternative Locations
You can set the error log file to be visible directly by Obsidian (e.g. by setting it to a `System` area in your vault, e.g. `System/Z2K-Templates/error-log.md`). Because the file is a markdown file, please note that the file will be indexed alongside your other vault files and may cause some pollution of search results. 

Finally, you can set an absolute system path if you prefer logs outside the vault. Do note, however, that some operating systems are heavily sandboxed (e.g. mobile systems like iOS), making some if not all external folders not supported.

