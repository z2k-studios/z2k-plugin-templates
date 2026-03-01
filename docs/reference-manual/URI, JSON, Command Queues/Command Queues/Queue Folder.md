---
sidebar_position: 20
aliases:
- Queue Folder
- Command Queue Folder
- Queue Directory
- Command Queue Directory
---
# Queue Folder
The Queue Folder is where the Command Queue watches for new command files. Any `.json` or `.jsonl` file placed here will be picked up and processed by the plugin on the next scan cycle.

## Contents
- [[#Default Location]]
- [[#Alternative Locations]]
- [[#Directory Structure]]
- [[#Placing Files in the Queue]]

## Default Location
The default queue folder is:
```
.obsidian/plugins/z2k-plugin-templates/command-queue/
```

This path is vault-relative – it lives inside the plugin's own configuration folder. The plugin creates the folder automatically if it doesn't exist when the queue processor first runs.

> [!NOTE] Show System Folders
> The default folder can be difficult to find given that it is inside the hidden Obsidian system folder (`.obsidian`). For this reason, we recommend changing the default location to a more accessible folder.

## Alternative Locations
You can change the queue folder to any location via [[Queue Settings]]. Just be aware that the folder must be in a location accessible to the application and have read/write access. For sandboxed devices like mobile phones, this may limit your options.

### Can I Use a Folder in My Vault?
Yes – and this is often the most convenient option. A vault-relative path like `_queue` or `System/command-queue` keeps everything in one place and makes the queue folder easy to find.

If you use a vault folder, exclude it from sync services (Obsidian Sync, iCloud, Dropbox, etc.) to prevent race conditions and duplicate processing. When multiple devices sync the same queue folder, you risk:
- Two devices processing the same command simultaneously
- Commands being re-synced after archival, causing re-execution
- Conflict files from sync services confusing the queue processor

To exclude a folder from Obsidian Sync, go to Settings → Sync → Excluded folders.

Also be aware that Obsidian may scan and index files placed in vault folders. Depending on your configured file extensions, command files could appear in search results or the file explorer. Check your excluded files settings if this causes noise.

### Can I Use a Cloud Service Folder?
Yes – you can point the queue folder to a folder managed by iCloud, Dropbox, OneDrive, or similar services. This enables workflows where one device writes commands and another processes them.

When using cloud storage:
- Set a significantly longer [[Queue Settings#Scan Frequency|scan frequency]] (e.g., `5m` or longer) to allow sync operations to complete
- Accept that timing is less predictable – sync latency varies
- Be aware that partial file syncs can cause JSON parse errors; the [[Retry and Error Handling|retry system]] can help recover from these

## Directory Structure
The queue folder contains command files at the top level and uses two subfolders to organize completed and failed commands:

```
command-queue/
├── my-command.json              ← Ready to process
├── batch-import.jsonl           ← Batch file, ready to process
├── report.2025-06-15.delay.json ← Delayed until June 15
├── my-command.retry.json        ← Retry metadata (sidecar)
├── done/
│   └── my-command.2025-01-15_14-30-00.done.json
└── failed/
    └── bad-command.2025-01-15_14-31-00.failed.json
```

- **Top level** – command files waiting to be processed. This is where you place new commands.
- **`done/`** – successfully processed commands are moved here with a timestamp appended. These are automatically cleaned up after the configured [[Queue Settings|archive duration]].
- **`failed/`** – commands that failed permanently (either no retries configured, or all retries exhausted) are moved here with a timestamp. Failed files are *not* automatically cleaned up – they persist for inspection.

The plugin creates the `done/` and `failed/` subfolders automatically when needed.

## Placing Files in the Queue
To queue a command, write a `.json` or `.jsonl` file into the queue folder. How you create that file depends on your workflow:
- **Shell script** – use `echo` or `cat` to write JSON into the folder
- **Apple Shortcuts** – use the "Save File" action to write to the vault's queue folder
- **Python / Node.js** – write the file programmatically
- **AI agents** – point an AI agent (like Claude Code) to this reference manual and let it generate commands to import data into your vault
- **Manual** – create the file in any text editor and save it to the folder

The file must be a valid [[JSON Packages Overview|JSON Package]]. The filename can be anything, with two exceptions:
- Files ending in `.retry.json` are treated as retry metadata sidecars and are ignored during processing
- Files ending in `.processing.jsonl` are treated as in-progress batch files from a previous crash recovery

For commands that should execute at a future date, use the [[Delayed Commands|`.delay.json` filename pattern]].

### Example: Shell Script
```bash
cat > "/path/to/vault/.obsidian/plugins/z2k-plugin-templates/command-queue/new-note.json" << 'EOF'
{
  "cmd": "new",
  "templatePath": "Templates/Daily Log.md",
  "prompt": "none",
  "finalize": true,
  "mood": "cautiously optimistic"
}
EOF
```

> [!DANGER] INTERNAL NOTES
> - #TEST Absolute paths on mobile (iOS, Android): the platform sandbox may prevent the plugin from accessing paths outside the vault. Needs testing to confirm whether external absolute paths work on mobile.
> - The `updateQueueDirPath()` function has a TODO comment for moving existing files when the folder path changes. This is currently unimplemented.
> - The path resolution logic (`resolveQueueFilePath()`) checks for `/` or drive letter prefixes to distinguish absolute from vault-relative paths. There is no validation that the path actually exists – the queue processor silently skips if the folder is missing.
> - Confirm whether the plugin creates the top-level queue folder on first run, or only when the first command is archived. The `done/` and `failed/` subfolders are created on demand in `getTimestampedPath()`, but the root folder creation behavior should be verified.
