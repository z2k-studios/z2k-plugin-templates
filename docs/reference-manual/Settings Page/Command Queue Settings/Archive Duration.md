---
sidebar_position: 50
aliases:
- archive duration
- command queue archive
- queue archive duration
---
# Archive Duration
How long processed command files are kept in an archive subfolder before being deleted.

- **Default:** `1w`
- **Accepts:** A duration value (see [[Duration Format]]), or blank

Leave blank to delete processed files immediately after execution. Set a duration to retain them for debugging or auditing purposes.

The archive serves as a processing receipt. Setting a longer duration (e.g., `1w`) gives you more time to verify that commands executed correctly. Setting it blank means successful commands are deleted immediately after processing – no `done/` subfolder is created.

This setting is only visible when [[Enable Command Queue]] is on.

## Time Units
This setting uses the standard [[Duration Format]] (a number followed by a unit suffix, e.g. `1d`, `1w`). See [[Duration Format]] for the full list of valid units.

## Disabling the Archive
Leave the field blank to skip archiving entirely – processed command files are deleted immediately after execution.

## Value Range
- **Minimum:** None enforced. Blank = delete immediately.
- **Maximum:** No enforced upper limit.
- **Practical range:** `1d` to `1mo`

The default one-week window gives a comfortable buffer for reviewing or debugging processed commands. A shorter window (e.g., `1d`) is sufficient if you check your vault daily. Archive files are small (JSON), so retaining them for a week has negligible storage impact. Values beyond a month are rarely useful – by then, any debugging value the archived files had is likely long gone.

> [!NOTE]
> Failed commands in the `failed/` subfolder are *never* automatically cleaned up regardless of this setting. They persist until manually deleted.

