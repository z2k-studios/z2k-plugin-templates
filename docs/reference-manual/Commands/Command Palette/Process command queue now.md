---
sidebar_position: 120
sidebar_class_name: z2k-code
aliases:
- process command queue now
- process queue
---
# Process command queue now
Immediately processes any pending commands in the offline [[Command Queues|command queue]]. This is an advanced command for users who have enabled command queuing for external integrations.

## Availability
Available in the Command Palette only when **[[Offline Command Queue]]** is enabled in [[Settings Page|settings]]. If you don't see this command, the command queue feature is not enabled.

## What It Does
When you run this command:
1. **Check the queue** – The plugin looks for any pending commands that were queued (e.g., from [[URI Actions]] or external triggers)
2. **Process sequentially** – Each queued command is executed in order
3. **Clear processed items** – Successfully processed commands are removed from the queue

## When to Use It
The command queue is designed for scenarios where template commands arrive while Obsidian is closed or when you want to batch process external requests:
- **Mobile sync workflows** – Commands queued via URI while the app was closed
- **Automation pipelines** – External scripts that queue template operations
- **Offline capture** – Commands stored for later processing

## Example Scenario
1. A shortcut on your phone triggers a URI that queues a "Quick Capture" template command
2. The command is stored because Obsidian wasn't running
3. Later, you open Obsidian and run **Process command queue now**
4. The queued capture command executes, creating the note you requested

## Tips
- The queue does **not** process immediately on startup. Instead, Obsidian waits for the configured poll frequency to elapse before the first automatic check. This command bypasses that wait and processes immediately.
- Check [[Command Queues]] for details on configuring the queue feature

## Related
- [[Command Queues]] – Full documentation on the queue system
- [[JSON Packages]] – Passing complex data to queued commands

