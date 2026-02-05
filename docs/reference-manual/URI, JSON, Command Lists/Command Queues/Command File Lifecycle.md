---
sidebar_position: 50
aliases:
- File Lifecycle
- Command File Lifecycle
- File States
---
# Command File Lifecycle
A command file in the [[Queue Directory]] moves through several states as the queue processes it. Understanding this lifecycle is essential for troubleshooting and for building robust automation scripts.

## Contents
- [[#State Diagram]]
- [[#File States]]
- [[#Timestamp Format]]
- [[#Archive Cleanup]]
- [[#Crash Recovery]]

## State Diagram
```
                    ┌─────────────────────┐
                    │   Ready to Process  │
                    │   command.json      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │     Processing      │
                    │   (in memory)       │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
    ┌─────────▼─────────┐             ┌────────▼────────┐
    │      Success      │             │     Failure     │
    └─────────┬─────────┘             └────────┬────────┘
              │                                 │
   ┌──────────▼──────────┐         ┌───────────▼───────────┐
   │   Archive or Delete │         │  Retries configured?  │
   │   done/command.     │         └───────────┬───────────┘
   │   TIMESTAMP.done.   │                     │
   │   json              │         ┌───────────┴───────────┐
   └─────────────────────┘         │                       │
                          ┌────────▼────────┐    ┌────────▼────────┐
                          │   No retries    │    │  Has retries    │
                          │   or exhausted  │    │  remaining      │
                          └────────┬────────┘    └────────┬────────┘
                                   │                      │
                          ┌────────▼────────┐    ┌────────▼────────┐
                          │   Move to       │    │  Create/update  │
                          │   failed/       │    │  .retry.json    │
                          └─────────────────┘    │  sidecar        │
                                                 └────────┬────────┘
                                                          │
                                                 ┌────────▼────────┐
                                                 │  Back to Ready  │
                                                 │  (skip until    │
                                                 │  nextRetryAfter)│
                                                 └─────────────────┘
```

## File States
Command files appear in the [[Queue Directory]] with various filename patterns that indicate their current state:

| Pattern | Location | State |
| --- | --- | --- |
| `command.json` | Top level | **Ready** – waiting to be processed |
| `command.json` + `command.retry.json` | Top level | **Retry wait** – failed, will retry after timestamp in sidecar |
| `command.YYYY-MM-DD.delay.json` | Top level | **Delayed** – waiting for the specified date |
| `batch.processing.jsonl` | Top level | **In-progress** – JSONL file currently being processed (crash marker) |
| `command.TIMESTAMP.done.json` | `done/` | **Archived** – successfully processed |
| `command.TIMESTAMP.failed.json` | `failed/` | **Permanently failed** – no retries remaining or no retries configured |
| `batch.TIMESTAMP.failed.jsonl` | `failed/` | **Batch failures** – lines from a JSONL file that failed without retries |

### Ready State
A command file with a plain `.json` extension at the top level is ready for the next scan cycle. If it has no `.retry.json` sidecar and no `.delay.json` date pattern, it will be picked up immediately.

### Retry Wait State
A failed command with `maxRetries > 0` stays at the top level. A companion file with the same base name plus `.retry.json` contains metadata:

```json
{
  "attempts": 2,
  "nextRetryAfter": 1705934400000
}
```

- `attempts` – how many times this command has been tried (and failed)
- `nextRetryAfter` – Unix timestamp (milliseconds) when the next attempt is allowed

The queue processor skips this file until the current time exceeds `nextRetryAfter`. See [[Retry and Error Handling]] for details.

### Delayed State
A file whose name includes a `.delay.json` pattern (e.g., `report.2025-06-15.delay.json`) is held until that date arrives. See [[Delayed Commands]] for the full specification.

### In-Progress State (JSONL only)
When a `.jsonl` file is picked up for processing, it is immediately renamed to `.processing.jsonl`. This serves as a crash recovery marker – if Obsidian crashes mid-batch, this file will be detected and re-processed on the next startup.

### Archived State
Successfully processed commands are moved to the `done/` subfolder with a timestamp inserted into the filename:
```
done/command.2025-01-15_14-30-00.done.json
```

The original filename is preserved (minus any `.delay` portion). These files are automatically deleted after the [[Queue Settings#Archive Duration|archive duration]] expires.

### Permanently Failed State
Commands that fail and have no retries remaining (or were not configured for retries) are moved to the `failed/` subfolder:
```
failed/command.2025-01-15_14-31-00.failed.json
```

Any `.retry.json` sidecar is deleted when the file moves to `failed/`. Failed files are **never** automatically cleaned up – they persist for inspection.

## Timestamp Format
Timestamps in archived and failed filenames use the format:
```
YYYY-MM-DD_HH-mm-ss
```

For example: `2025-01-15_14-30-00` for January 15, 2025 at 2:30:00 PM.

If a file with the calculated timestamp already exists, the plugin increments by one second until it finds a unique name. This collision avoidance ensures no files are overwritten even if multiple commands complete in rapid succession.

## Archive Cleanup
The `done/` subfolder is scanned at the start of each processing cycle. Files older than the [[Queue Settings#Archive Duration|archive duration]] are deleted. The age is determined by the timestamp embedded in the filename, not by filesystem metadata – this ensures consistent behavior even if files are copied or synced.

If the archive duration is blank (immediate delete), successful commands never reach the `done/` folder – they are deleted directly after processing.

## Crash Recovery
The `.processing.jsonl` pattern exists specifically for crash resilience. The sequence:
1. JSONL file is renamed from `.jsonl` to `.processing.jsonl` before any lines are executed
2. Lines are processed one by one
3. If all lines complete (success or handled failure), the `.processing.jsonl` file is deleted
4. If the plugin crashes mid-processing, the `.processing.jsonl` file remains

On next startup, the plugin's `recoverFromCrash()` function:
1. Scans the queue directory for any `.processing.jsonl` files
2. Re-processes each one from the beginning

> [!WARNING]
> Crash recovery re-processes the **entire** JSONL file from line 1. There is no line-level checkpoint. Commands that succeeded before the crash will execute again. Design batch commands to be idempotent (safe to run twice) when possible.

Individual `.json` files do not have this issue – if a crash occurs during processing, the file simply remains in place and is retried on the next scan. Since it hasn't been moved or renamed yet, there's no ambiguity about its state.




> [!DANGER] Internal Notes
> - The timestamp extraction for cleanup uses a regex on the filename (`/\.(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\./`). Files with unexpected naming patterns in `done/` are silently ignored.
> - The `getTimestampedPath()` function strips any `.delay` portion from the filename before adding the archive timestamp. This prevents filenames like `command.2025-06-15.delay.2025-06-15_14-30-00.done.json`.
> - There is no mechanism to resume a partially-processed JSONL file. If exactly-once execution matters, use individual `.json` files with retry support rather than JSONL batches.
