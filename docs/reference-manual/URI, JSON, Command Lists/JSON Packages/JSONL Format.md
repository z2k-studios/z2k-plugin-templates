---
sidebar_position: 60
aliases:
- JSONL
- JSONL File
- .jsonl
- JSONL Format
---
# JSONL Format
A `.jsonl` file packs multiple [[JSON Packages Overview|JSON Package]] commands into a single file — one command per line. Each line is a complete, self-contained JSON object following the same structure as a [[JSON Structure|.json file]]. The plugin processes each line sequentially, making `.jsonl` the format of choice for batch operations.

## Contents
- [[#Purpose]]
- [[#File Structure]]
- [[#Processing Behavior]]
- [[#Error Handling]]
- [[#Examples]]

## Purpose
A `.jsonl` file is used exclusively by [[Command Queues]]. Unlike a [[JSON Structure|.json file]] which holds a single command, a `.jsonl` file holds multiple commands — one per line — enabling batch operations. When a `.jsonl` file is placed in the [[Command Queue]] directory, the plugin processes every line in sequence, executing each as an independent [[JSON Packages Overview|JSON Package]].

## File Structure
A `.jsonl` (JSON Lines) file contains one JSON object per line. Each line is a complete [[JSON Packages Overview|JSON Package]] — it must be valid JSON and must be a single object (not an array or primitive).

```jsonl
{"cmd": "new", "templatePath": "Templates/Note.md", "title": "First Note"}
{"cmd": "new", "templatePath": "Templates/Note.md", "title": "Second Note"}
{"cmd": "new", "templatePath": "Templates/Note.md", "title": "Third Note"}
```

Rules:
- Each line must be a complete, valid JSON object
- Empty lines and whitespace-only lines are ignored
- There is no separator between entries — the newline itself is the delimiter
- Each line is parsed and executed independently

## Processing Behavior
When the [[Command Queues]] picks up a `.jsonl` file, it follows this sequence:
1. The file is renamed from `.jsonl` to `.processing.jsonl` — this prevents re-processing if the plugin restarts mid-batch, and serves as a crash-recovery mechanism
2. Each non-empty line is parsed as a JSON object and passed through the same command processing pipeline as a `.json` file
3. Lines are processed in order, top to bottom
4. A configurable pause can be inserted between commands (set via the [[Command Queue]] pause setting)
5. Once all lines are processed, the `.processing.jsonl` file is deleted

The rename-to-processing step is atomic — if the plugin crashes or restarts, it will find the `.processing.jsonl` file on the next scan and resume processing from the beginning. Lines that already succeeded will re-execute, so commands should be designed to be safe for re-execution when possible.

> [!WARNING]
> Because crash recovery re-processes the entire file, idempotent commands (those safe to run twice) are preferred in `.jsonl` batches. A `new` command will create a duplicate note if re-executed. Consider using individual `.json` files with retry support if exactly-once execution matters.

## Error Handling
Errors in a `.jsonl` file are handled per-line, not per-file. A single bad line does not stop the rest of the batch.
- **Invalid JSON on a line** — the line is logged as an error and added to a list of failed lines. Processing continues with the next line.
- **Command execution failure** — depends on the line's retry configuration:
  - If the command has `maxRetries > 0` (or `-1`), the failed line is extracted into its own individual `.json` file and handed off to the [[Command Queue]]'s retry system
  - If `maxRetries` is 0 or absent, the line is added to the failed lines list
- **After processing** — if any lines failed, they are written to a new file in the `failed/` subdirectory as `<original-name>.<timestamp>.failed.jsonl`

For full details on retry behavior and failure states, see the [[Retry and Error Handling]] page under [[Command Queues]].

## Examples

### Batch-Create Multiple Notes
```jsonl
{"cmd": "new", "templatePath": "Templates/Contact.md", "name": "Alice", "role": "Engineer"}
{"cmd": "new", "templatePath": "Templates/Contact.md", "name": "Bob", "role": "Designer"}
{"cmd": "new", "templatePath": "Templates/Contact.md", "name": "Charlie", "role": "PM"}
```

### Mixed Commands in One Batch
```jsonl
{"cmd": "new", "templatePath": "Templates/Project.md", "projectName": "Z2K v2", "prompt": "none"}
{"cmd": "insertblock", "blockPath": "Templates/Blocks/Milestone.block", "existingFilePath": "Projects/Z2K v2.md", "destHeader": "Milestones", "location": "header-bottom", "milestone": "Alpha Release"}
{"cmd": "continue", "existingFilePath": "Projects/Z2K v2.md", "status": "active"}
```

### With Retry Configuration
```jsonl
{"cmd": "new", "templatePath": "Templates/Report.md", "title": "Q4 Report", "maxRetries": 3, "retryDelay": "5s"}
{"cmd": "new", "templatePath": "Templates/Report.md", "title": "Q1 Forecast", "maxRetries": 3, "retryDelay": "5s"}
```

If the first line fails, it will be extracted to its own `.json` file and retried up to 3 times with a 5-second delay between attempts.

> [!DANGER] Internal Notes
> - Crash recovery re-processes the entire `.processing.jsonl` file from the top. There is no line-level checkpoint. This could lead to duplicate notes if `new` commands succeed before a crash. Worth confirming whether this is intended behavior or a known limitation.
> - The pause between commands is configured globally via the `offlineCommandQueuePause` setting, not per-file or per-line.
