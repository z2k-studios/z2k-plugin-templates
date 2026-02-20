---
sidebar_position: 80
aliases:
- Debugging Command Queues
- Troubleshooting Command Queues
- Command Queue Debugging
---
# Debugging Command Queues
When a queued command doesn't behave as expected – it doesn't run, produces the wrong output, or ends up in `failed/` – this page walks through how to diagnose the problem.

## Contents
- [[#Diagnostic Checklist]]
- [[#Testing with a Basic Command]]
- [[#Inspecting File State]]
- [[#Reading Error Information]]
- [[#Common Problems and Solutions]]
- [[#Advanced Debugging]]

## Diagnostic Checklist
When a command isn't processing as expected, work through these checks in order:

1. **Is the queue enabled?**
   - Open Settings → Z2K Templates → Command Queue
   - Confirm "Enable command queue" is toggled on

2. **Have you verified that a basic command works?**
   - Before debugging a complex command, confirm the queue system itself is functioning
   - See [[#Testing with a Basic Command]] below for a minimal test case

3. **Is the file in the right directory?**
   - Check that your command file is in the configured [[Queue Directory]]
   - The default is `.obsidian/plugins/z2k-plugin-templates/command-queue/`

4. **Is the filename correct?**
   - Must end in `.json` or `.jsonl`
   - Avoid `.retry.json` (reserved for retry sidecars)
   - Check for typos in `.delay.json` patterns

5. **Is the JSON valid?**
   - Open the file and verify it parses as valid JSON
   - Use a JSON validator if unsure
   - Check for trailing commas, unquoted keys, or missing braces

6. **Has enough time passed?**
   - Automatic scans run at the configured frequency (default: 60s)
   - The first scan after startup is delayed by one full interval
   - Use "Process command queue now" from the Command Palette to force immediate processing

7. **Is the file delayed?**
   - Check if the filename contains a `.delay.json` date pattern
   - Verify the date/time has actually passed

8. **Is the file waiting for retry?**
   - Look for a companion `.retry.json` sidecar file
   - Check its `nextRetryAfter` timestamp

## Testing with a Basic Command
Before debugging a complex command, verify that the Command Queue system is working at all. This requires creating a minimal test template and command.

### Step 1: Create a Test Template
Create a simple template file in your vault. For example, create `Templates/Queue Test.md` with this content:

```md
---
tags: queue-test
---
# Queue Test Note
This note was created by the Command Queue at {{date}} {{time}}.

Test value: {{testValue}}
```

### Step 2: Create a Test Command
Save this JSON as `queue-test.json` in your [[Queue Directory]]:

```json
{
  "cmd": "new",
  "templatePath": "Templates/Queue Test.md",
  "prompt": "none",
  "finalize": true,
  "testValue": "Hello from the queue!"
}
```

Adjust `templatePath` to match where you saved the template.

### Step 3: Trigger Processing
Either wait for the next automatic scan or run **Process command queue now** from the Command Palette.

### Expected Result
- The `queue-test.json` file should move to the `done/` subfolder
- A new note should appear in your vault with the test value filled in
- The note's content should show "Hello from the queue!" where `{{testValue}}` was

### If This Test Fails
If even this minimal test doesn't work:
- The queue system itself has a configuration problem
- Check that the queue is enabled in settings
- Check that the queue directory path is correct and accessible
- Look for errors in the Developer Console

If the basic test succeeds but your actual command fails, the problem is specific to your command – not the queue system. Focus on the command's JSON structure, template path, or field data.

## Inspecting File State
The [[Command File Lifecycle]] determines what's happening with each command. Here's how to interpret what you see:

### File Is Still at Top Level
| Observation | Likely Cause |
| --- | --- |
| Just placed, no sidecar | Waiting for next scan cycle |
| Has `.retry.json` sidecar | Failed previously, waiting for retry time |
| Filename has `.delay.json` pattern | Waiting for scheduled date |
| Has been there for multiple scan cycles | Check JSON validity, check if queue is enabled, check directory path |

### File Moved to `done/`
The command succeeded. Check the resulting note in your vault. If the output is wrong, the issue is with the template or the field data – not the queue.

### File Moved to `failed/`
The command failed permanently. See [[#Reading Error Information]] below.

### JSONL File Renamed to `.processing.jsonl`
The plugin crashed mid-batch. On next startup, it will resume from the beginning. See [[Command File Lifecycle#Crash Recovery]].

## Reading Error Information
When a command fails, the error details are logged to the **Obsidian Developer Console**:

1. Open the Developer Tools:
   - macOS: `Cmd + Option + I`
   - Windows/Linux: `Ctrl + Shift + I`
2. Click the **Console** tab
3. Look for error messages from `z2k-plugin-templates`

Errors include:
- JSON parsing failures
- Missing template files
- Invalid parameter values
- Template rendering errors (Handlebars syntax)
- File system errors

> [!NOTE]
> The failed command file itself does not contain error information – it's identical to the original command. Error details are only available in the console.

### Example Console Output
```
z2k-plugin-templates: Failed to process command file: /path/to/command.json
Error: Template not found: Templates/Missing Template.md
```

## Common Problems and Solutions

### Command Never Executes

**Symptom**: File sits in the queue directory indefinitely.

**Possible causes**:
- Queue is disabled → Enable in settings
- Wrong directory → Move file to correct location
- Invalid JSON → Fix syntax errors
- Delayed → Wait for scheduled time or remove `.delay.json` pattern
- Waiting for retry → Check `.retry.json` sidecar timestamp

### Command Fails Immediately

**Symptom**: File moves to `failed/` on first scan.

**Possible causes**:
- Template file doesn't exist → Check `templatePath`
- Required parameter missing → Add missing `cmd`, `templatePath`, etc.
- Invalid parameter value → Check `prompt`, `finalize`, `location` values
- JSON syntax error in `templateJsonData` → Validate nested JSON

### Note Created But Fields Wrong

**Symptom**: Note appears in vault but field values are incorrect or missing.

**Possible causes**:
- Field name mismatch → Field names are case-sensitive; `AuthorName` ≠ `authorName`
- Extra fields ignored → Template doesn't have a matching `{{field}}`
- Fallback behavior applied → Field not provided, placeholder preserved or cleared

This is not a queue error – it's a template/data mismatch. Test the template manually first.

### Note Created Multiple Times

**Symptom**: Duplicate notes appear in the vault.

**Possible causes**:
- JSONL crash recovery → Plugin restarted mid-batch; use individual `.json` files for exactly-once semantics
- Multiple command files → Check for duplicate files in the queue
- External script running multiple times → Verify your automation logic

### Retry Never Succeeds

**Symptom**: File keeps failing and eventually moves to `failed/` after all retries.

**Possible causes**:
- Permanent error (wrong template path, bad syntax) → Retries won't help; fix the underlying issue
- Retry delay too short → Increase `retryDelay` if the issue needs time to resolve
- External dependency never available → Verify the external resource will actually become available

## Advanced Debugging

### Verify Scan Timing
To confirm the queue is scanning:
1. Open the Developer Console
2. Place a valid test command in the queue
3. Watch for processing messages

If nothing appears after the expected scan interval, check:
- Is `offlineCommandQueueFrequency` blank? (manual-only mode)
- Did the plugin load correctly? (check for startup errors)

### Inspect Retry Sidecar
Read the `.retry.json` file to see:
```json
{
  "attempts": 2,
  "nextRetryAfter": 1705934400000
}
```

Convert `nextRetryAfter` to human-readable time:
```javascript
new Date(1705934400000).toLocaleString()
// "1/22/2025, 2:00:00 PM"
```

### Force a Fresh Retry
To retry a failed command immediately:
1. Move it from `failed/` back to the queue top level
2. Delete any associated `.retry.json` sidecar
3. Run "Process command queue now"

### Test Template Independently
Before blaming the queue, verify the template works:
1. Use the standard "Create new note" command
2. Manually fill in the fields with the same values from your JSON
3. If it fails here, the issue is with the template – not the queue

### Check File Permissions
On some systems, file permission issues can prevent reading/writing:
- Ensure the queue directory is writable
- Ensure command files are readable
- Check for sync service locks (Dropbox, iCloud, OneDrive)

> [!DANGER] Internal Notes
> - **Feature gap**: There is no UI for viewing queue status, pending commands, retry state, or recent failures. All diagnostics require manual file inspection or console reading. A "Queue Status" panel would significantly improve the debugging experience.
> - **Feature gap**: Failed files do not include error information. Adding an `_error` field or companion `.error.json` file would make diagnosis much easier without requiring console access.
> - **Feature gap**: There is no "dry run" mode to validate a command without executing it. This would help catch errors before they result in failed files.
> - **Feature gap**: There is no notification when commands fail. Users must actively check the `failed/` folder or console to discover problems.
> - **Logging verbosity**: The current logging is minimal. A "verbose queue logging" setting that logs each scan cycle, file pickup, and processing step would help diagnose timing and ordering issues.
> - Status bar shows "Processing commands..." during active processing but provides no other queue status feedback.
