---
sidebar_position: 30
aliases:
- View Error Log
- Error Log Viewer
- Clear Log
---
# View Error Log
The **View Error Log** button opens a live viewer for the plugin's [[Error Log]] — a running record of warnings, errors, and diagnostic messages produced during template processing.

## Opening the Viewer
In **Settings → Error Logging**, click **View Error Log**. The modal opens immediately and begins displaying the current log contents.

![[error-log-viewer.png]]
*(Screenshot: the Error Log viewer modal, showing log entries and the Clear Log button)*

## Log Viewer Behavior
- **Live updates** – The viewer polls the log file frequently. New entries appear automatically without reopening the modal.
- **Auto-scroll** – The display scrolls to the bottom as new entries arrive. If you scroll up to read earlier entries, auto-scroll pauses until you return to the bottom.
- **Empty state** – If no entries have been written yet, the viewer shows "No log entries yet."

## Clearing the Log
Click **Clear Log** at the bottom of the viewer to erase all current log entries. A confirmation dialog appears before the log is cleared — this action cannot be undone.

The Clear Log button is disabled when the log is already empty.

## Log File Location
The log file is always written to:
```
.obsidian/plugins/z2k-plugin-templates/error-log.md
```
This location is fixed and not user-configurable. The file is inside Obsidian's hidden plugin folder and does not appear in your vault's regular file list.

## Auto-Truncation
To prevent unbounded growth, the log is automatically trimmed when it exceeds **1 MB**. Older entries are removed until the file is approximately 700 KB, keeping the most recent activity.

## Related Settings
- [[Error Log Level]] – Controls the minimum severity level that triggers a log entry

> [!DANGER] INTERNAL NOTES
> - Confirm the screenshot above matches the actual modal UI.
> - Verify the polling interval is perceivable as "real-time" in practice — 250ms should be imperceptible but worth noting if there are any observed lags.
