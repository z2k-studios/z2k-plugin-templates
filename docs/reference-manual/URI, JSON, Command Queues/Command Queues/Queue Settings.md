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

> [!INFO] For more information…
> For complete documentation on each setting, see [[Command Queue Settings]] in the Settings Page section.

## Settings Reference

| Setting | Default | Description |
| --- | --- | --- |
| [[Enable Command Queue]] | `false` | Turns the queue system on or off. When off, no files are processed and the manual trigger is hidden from the Command Palette. |
| [[Queue Folder (Settings)\|Queue Folder]] | `.obsidian/plugins/z2k-plugin-templates/`<br/>`command-queue` | Path to the folder watched for incoming command files. Accepts vault-relative or absolute paths. |
| [[Scan Frequency]] | `60s` | How often the queue folder is checked for new files. Leave blank for manual-only mode. Minimum: `5s`. |
| [[Pause Between Commands]] | `1s` | Optional delay between consecutive commands in a single cycle. Leave blank for no pause. |
| [[Archive Duration]] | `1w` | How long processed commands remain in `done/` before automatic cleanup. Leave blank to delete immediately. |

Duration settings accept a number followed by a unit suffix (e.g., `30s`, `5m`, `1w`). See [[Duration Format]] for all supported units.

> [!WARNING]
> Changing the Queue Folder path does not move existing files from the old folder. Unprocessed commands in the previous location must be moved manually.

> [!NOTE]
> Failed commands in the `failed/` subfolder are *never* automatically cleaned up regardless of the Archive Duration setting. They persist until manually deleted.


> [!DANGER] Internal Notes
> - The duration parser (`parseDuration()`) accepts a `defaultOnError` parameter. In the settings UI, invalid inputs show a validation error message rather than silently falling back. But in the queue processor itself, some calls use a default of `0` on error – meaning an invalid frequency setting silently disables automatic scanning rather than throwing.
> - The minimum frequency of 5 seconds is enforced in the settings UI but not in `startQueueProcessor()` itself. A manually edited `data.json` could bypass this minimum.
> - The `offlineCommandQueueEnabled` default is `false` as of issue #154. The queue is opt-in.
