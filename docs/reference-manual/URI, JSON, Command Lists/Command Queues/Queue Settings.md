---
sidebar_position: 40
sidebar_class_name: z2k-code
aliases:
- Queue Settings
- Command Queue Settings
---
# Queue Settings
The Command Queue is configured through the Z2K Templates [[Settings Page]] under the **Command Queue** section. Five settings control how the queue operates.

![[command-queue-settings.png]]
==(Screenshot: The Command Queue section of the Z2K Templates settings page)==

## Settings Reference

### Enable Command Queue
Turns the entire Command Queue system on or off.

| Property | Value |
| --- | --- |
| Default | `true` (enabled) |
| Effect when off | The queue timer stops, the "Process command queue now" command is hidden from the Command Palette, and no files are processed |

When toggled off, existing files in the [[Queue Directory]] are left in place. They will be processed if the queue is re-enabled.

### Queue Directory
The path to the folder where command files are placed.

| Property | Value |
| --- | --- |
| Default | `.obsidian/plugins/z2k-plugin-templates/command-queue` |
| Format | Vault-relative path or absolute path |
| Validation | Rejects characters: `*`, `?`, `"`, `<`, `>`, `\|` |

A vault-relative path (e.g., `Scripts/queue`) resolves from the vault root. An absolute path (starting with `/` on macOS/Linux or a drive letter on Windows) is used as-is.

See [[Queue Directory]] for details on directory structure and file placement.

> [!WARNING]
> Changing this path does not move existing files from the old directory. Unprocessed commands in the previous location must be moved manually.

### Scan Frequency
How often the plugin checks the [[Queue Directory]] for new files.

| Property | Value |
| --- | --- |
| Default | `60s` |
| Minimum | `5s` |
| Format | Duration string (see [[#Duration Format]]) |
| Blank | Manual-only mode – no automatic scanning |

Setting a very short frequency (e.g., `5s`) increases responsiveness but adds overhead. For most workflows, the default 60-second interval is sufficient. We do not recommend using intervals less than 60 seconds.

### Pause Between Commands
An optional delay inserted between consecutive commands during a single processing cycle.

| Property | Value |
| --- | --- |
| Default | (blank – no pause) |
| Format | Duration string (see [[#Duration Format]]) |
| Blank | No pause between commands |

This applies between individual `.json` files and between lines within a `.jsonl` file. It does not apply after the last command. A pause is useful when one command creates a file that a subsequent command needs to reference – it gives Obsidian's indexer time to register the new file.

### Archive Duration
How long successfully processed command files are kept in the `done/` subfolder before automatic cleanup.

| Property | Value |
| --- | --- |
| Default | `1d` |
| Format | Duration string (see [[#Duration Format]]) |
| Blank | Delete immediately on success (no archiving) |

The archive serves as a processing receipt. Setting a longer duration (e.g., `1w`) gives you more time to verify that commands executed correctly. Setting it blank means successful commands are deleted immediately after processing – no `done/` subfolder is created.

> [!NOTE]
> Failed commands in the `failed/` subfolder are *never* automatically cleaned up regardless of this setting. They persist until manually deleted.

## Duration Format
All duration settings accept human-readable strings. Supported units:

| Unit | Meaning | Example |
| --- | --- | --- |
| `ms` | Milliseconds | `500ms` |
| `s` | Seconds | `30s` |
| `m` | Minutes | `5m` |
| `h` | Hours | `2h` |
| `d` | Days | `1d` |
| `w` | Weeks | `1w` |
| `mo` | Months (30 days) | `1mo` |
| `y` | Years (365 days) | `1y` |
Only one unit per value is supported – `1h30m` is not valid. Use `90m` instead.


> [!DANGER] Internal Notes
> - The duration parser (`parseDuration()`) accepts a `defaultOnError` parameter. In the settings UI, invalid inputs show a validation error message rather than silently falling back. But in the queue processor itself, some calls use a default of `0` on error – meaning an invalid frequency setting silently disables automatic scanning rather than throwing.
> - The minimum frequency of 5 seconds is enforced in the settings UI but not in `startQueueProcessor()` itself. A manually edited `data.json` could bypass this minimum.
> - The `offlineCommandQueueEnabled` default is `true`. This means a fresh install of the plugin has the queue active and scanning. Confirm whether this is the intended shipping behavior.
