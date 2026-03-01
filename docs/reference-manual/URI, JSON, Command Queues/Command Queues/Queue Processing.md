---
sidebar_position: 30
aliases:
- Queue Processing
- Command Queue Processing
- Processing Order
---
# Queue Processing
The Command Queue processor is the engine that watches the [[Queue Folder]], picks up command files, and executes them. This page covers how the scan loop operates, how files are ordered, and the two ways to trigger processing.

## Contents
- [[#Automatic Scanning]]
- [[#Manual Processing]]
- [[#Processing Order]]
- [[#How a File Is Processed]]
- [[#Pause Between Commands]]
- [[#JSONL Batch Processing]]

## Automatic Scanning
The plugin runs a background timer that checks the [[Queue Folder]] at a configurable interval. The default scan frequency is **60 seconds**.

Repeating with that interval, the Z2K Templates plugin will perform a full scan of the Queue Directory and look for any command queue file ready to be performed.

On plugin load, the first scan is deliberately delayed by one full frequency interval. If the frequency is 60 seconds, the first automatic scan happens roughly 60 seconds after Obsidian starts. This prevents a burst of activity during startup, and allows for any Obsidian Sync work to finish. 

> [!NOTE]
> If the scan frequency is left blank, automatic scanning is disabled entirely. The queue operates in **manual-only mode** – commands are only processed when you explicitly trigger them.

## Manual Processing
The Command Palette includes a dedicated command:

**[[Process Command Queue Now]]**

This triggers an immediate scan regardless of the timer. It's useful for:
- Testing a command you just placed in the queue
- Running in manual-only mode (frequency set to blank)
- Forcing a scan without waiting for the next automatic cycle

If the queue is already mid-processing, the command shows a notice and does nothing – it will not start a concurrent run.

![[command-queue-process-now.png]]
(==Screenshot: The "Process command queue now" command in the Command Palette==)

## Processing Order
When a scan runs, the processor:
1. Makes a list of all `.json` and `.jsonl` files in the [[Queue Folder]] top level
2. Filters out special files – `.retry.json` sidecars and `.processing.jsonl` crash recovery files
3. Sorts the remaining files by **creation time** (oldest first)
4. Processes each file in that order

Oldest-first ordering means commands are executed in the sequence they were placed in the queue. If you need a specific execution order within a batch, use a single `.jsonl` file instead – its lines are always processed top-to-bottom.

Before processing each file, two skip checks are applied:
- **[[Delayed Commands]]** – if the file has been marked for delaying , the file is skipped
	- (i.e. filename contains a `.delay.json` date pattern and that date hasn't arrived yet)
- **[[Retry and Error Handling#Retry Configuration|Retry Wait]]** – if the file has marked for retrying but is not yet ready for a retry, the file is skipped
	- (i.e. a `.retry.json` sidecar with a `nextRetryAfter` timestamp that hasn't passed)

## How a File Is Processed
Each `.json` file goes through this sequence:
1. The file contents are read and parsed as JSON
2. The resulting object is passed to the command processor – the same pipeline used by [[URI Actions]]
3. On success, the file is archived or deleted (see [[Command File Lifecycle]])
4. On failure, the file is handled by the [[Retry and Error Handling|retry system]]

If JSON parsing itself fails (malformed JSON), the file is moved directly to the `failed/` subfolder.

## Pause Between Commands
An optional pause can be inserted between consecutive commands. This is configured via the **Pause between commands** [[Queue Settings|setting]] (default: no pause).

The pause applies:
- Between `.json` files in a scan cycle
- Between lines within a `.jsonl` file
- But *not* after the last command in a cycle or batch

This is useful when commands create files that subsequent commands reference – the pause gives Obsidian's file indexer time to register newly created files.

## JSONL Batch Processing
`.jsonl` files follow a different processing path than individual `.json` files. See [[JSONL Format]] for the full specification, but here's a summary of the queue-specific behavior:

1. The `.jsonl` file is renamed to `.processing.jsonl` – this is a crash recovery marker (see [[Command File Lifecycle]])
2. Each non-empty line is parsed independently and executed as its own command
3. Lines are processed in order, top to bottom
4. A failed line does *not* stop the batch – processing continues with the next line
5. Failed lines are handled differently based on their retry configuration:
   - With `maxRetries > 0` – the line is extracted into a standalone `.json` file and enters the retry system individually
   - Without retries – the line is collected and written to a `failed/` batch file after all lines are processed
6. The `.processing.jsonl` file is deleted once all lines have been handled

> [!WARNING]
> If the plugin crashes mid-JSONL processing, the `.processing.jsonl` file is recovered on next startup and re-processed from the beginning. Lines that already succeeded will execute again. Design your batch commands to be safe for re-execution when possible, or use individual `.json` files with retry support for exactly-once semantics.

> [!DANGER] INTERNAL NOTES
> - The concurrency guard (`_processingQueue`) is an in-memory boolean, not a file lock. It prevents overlapping runs within one Obsidian instance but would not prevent conflicts if two Obsidian instances shared the same queue directory (an unusual but possible scenario with synced vaults).
> - The scan timer uses `setInterval(1000)` as a meta-timer that checks elapsed time, rather than setting the interval directly to the frequency. This is noted in the code but the user-facing reason is that it allows dynamic frequency changes without restarting the timer.
> - The `startQueueProcessor()` function is only called once at `onload()`. If `offlineCommandQueueDir` is initially empty and later set in settings, the timer doesn't start until Obsidian is restarted. Confirm whether this is a known limitation or a bug.
