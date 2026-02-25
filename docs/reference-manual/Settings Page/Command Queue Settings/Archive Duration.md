---
sidebar_position: 50
aliases:
- archive duration
- command queue archive
- queue archive duration
---
# Archive Duration
How long processed command files are kept in an archive subfolder before being deleted.

- **Default:** `1d`
- **Accepts:** A duration value (see [[Duration Format]]), or blank

Leave blank to delete processed files immediately after execution. Set a duration to retain them for debugging or auditing purposes.

This setting is only visible when [[Enable Command Queue]] is on.

## Time Units
This setting uses the standard [[Duration Format]] (a number followed by a unit suffix, e.g. `1d`, `1w`). See [[Duration Format]] for the full list of valid units.

## Disabling the Archive
Leave the field blank to skip archiving entirely – processed command files are deleted immediately after execution.

## Value Range
- **Minimum:** None enforced. Blank = delete immediately.
- **Maximum:** No enforced upper limit.
- **Practical range:** `1d` to `1mo`

A one-day window is enough if you check your vault daily. A one-week window gives a comfortable buffer for reviewing or debugging processed commands without concern that files have already been cleaned up. Archive files are small (JSON), so retaining them for a week has negligible storage impact. Values beyond a month are rarely useful – by then, any debugging value the archived files had is likely long gone.

> [!DANGER] NOTES
> - See [GitHub issue #154](https://github.com/z2k-studios/z2k-plugin-templates/issues/154) for a proposal to change the default from `1d` to `1w` (pending developer confirmation).
