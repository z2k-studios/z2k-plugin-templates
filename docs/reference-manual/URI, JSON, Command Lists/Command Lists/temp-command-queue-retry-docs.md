# Command Queue Retry System Documentation

## Overview

The Z2K Templates Plugin implements an offline command queue system that processes command files (`.json` and `.jsonl`) with built-in retry support for transient failures.

## Retry Configuration

Each command can specify retry behavior via two parameters:

```json
{
  "cmd": "new",
  "templatePath": "Templates/MyTemplate.md",
  "maxRetries": 3,
  "retryDelayMs": 5000
}
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `maxRetries` | number | 0 | Maximum retry attempts (0 = no retries) |
| `retryDelayMs` | number | 0 | Delay in milliseconds before next retry attempt |

## Retry State Machine

When a command fails:

1. **No retries configured** (`maxRetries === 0`):
   - Command file is moved to `failed/` subfolder as `.TIMESTAMP.json`
   - Processing continues to next command

2. **Retries configured** (`maxRetries > 0`):
   - A sidecar file (`.retry.json`) is created/updated with retry metadata
   - Metadata tracks `attempts` count and `nextRetryAfter` timestamp
   - If `attempts >= maxRetries`: file moved to `failed/` subfolder, sidecar deleted
   - Otherwise: `nextRetryAfter` is set to `Date.now() + retryDelayMs`

### Retry Metadata Sidecar

When a command with retries fails, a companion file is created:

- Command file: `my-command.json`
- Sidecar file: `my-command.retry.json`

Sidecar contents:
```json
{
  "attempts": 1,
  "nextRetryAfter": 1705934400000
}
```

## Queue Processing

The queue processor (`checkAndProcessQueue()`) runs periodically based on `offlineCommandQueueFrequency` setting:

1. Lists all files in queue directory
2. Filters out special files (`.retry.json`, `.processing.jsonl`)
3. Cleans up old archives in `done/` subfolder
4. Sorts by creation time (oldest first)
5. For each `.json` file with a `.retry.json` sidecar:
   - Checks if `nextRetryAfter > Date.now()`
   - If true, **skips** the file (not ready yet)
6. Processes eligible files

## JSONL (Batch) Handling

Batch files (`.jsonl`) have different retry behavior:

1. File is renamed to `.processing.jsonl` during processing (crash recovery)
2. Each line is processed independently
3. On line failure:
   - **If `maxRetries > 0`**: Line is extracted to individual `.json` file, then handled via normal retry logic
   - **If `maxRetries === 0`**: Line is collected into a failed batch
4. File is deleted when complete; failed lines go to `failed/.TIMESTAMP.jsonl`

## File State Lifecycle

| Pattern | State |
|---------|-------|
| `command.json` | Ready to process |
| `command.retry.json` | Retry metadata sidecar |
| `done/command.TIMESTAMP.json` | Archived (auto-cleaned after configured duration) |
| `failed/command.TIMESTAMP.json` | Failed after all retries exhausted |
| `commands.jsonl` | Batch ready to process |
| `commands.processing.jsonl` | Batch being processed (lock/crash recovery) |
| `failed/commands.TIMESTAMP.jsonl` | Batch with failed lines |

## What Constitutes a Failure

A "failure" is any exception thrown during command processing. Failures fall into two categories:

### Validation Errors (before execution)

| Error | Cause |
|-------|-------|
| Missing `cmd` | No command specified |
| Empty `cmd` | Command is whitespace |
| Unknown `cmd` | Not `new`, `continue`, `insertblock`, or `json` |
| Invalid `templateJsonData` | Not valid JSON, file not found, or not an object |
| Invalid `prompt` mode | Not `none`, `remaining`, or `all` |
| Invalid `finalize` | Not boolean or `true`/`false` string |
| Invalid `location` | Not a valid position string or line number |
| Template not found | `templatePath`/`blockPath` doesn't resolve to a file |
| File not found | `existingFilePath` doesn't exist |
| Missing required params | e.g., `new` without `templatePath` |

### Execution Errors (during operation)

- Template parsing/rendering errors (invalid Handlebars syntax, missing partials)
- File system errors (permissions, disk full)
- YAML merge conflicts
- Any exception thrown by the template engine

## What Does NOT Cause a Failure

### Missing Field Data (Template has field, command doesn't provide it)

**Not an error.** The plugin has explicit "miss handling" logic:

- Default: Field placeholder is **preserved** in output (`{{Field}}` stays)
- Configurable via `z2k_template_default_miss_handling`:
  - `finalize-preserve` (default): Keep the placeholder
  - `finalize-clear`: Remove the placeholder
- Per-field overrides via `clear`/`preserve` helpers or `miss` parameter

This supports "deferred resolution" where fields can remain unfilled and completed later via "Continue filling note."

### Extra Field Data (Command provides field, template doesn't use it)

**Not an error.** Extra data in the command context is silently ignored by Handlebars. The template only consumes the fields it references.

## Summary Table

| Scenario | Triggers Retry? |
|----------|-----------------|
| Template has `{{Field}}`, command doesn't provide it | No (miss handling) |
| Command provides `Field`, template doesn't use it | No (silently ignored) |
| Template file not found | **Yes** |
| Invalid JSON in command file | **Yes** |
| Bad Handlebars syntax in template | **Yes** |
| `existingFilePath` doesn't exist | **Yes** |
| Invalid command params | **Yes** |
| File system errors | **Yes** |

## Design Implications

The retry system is most useful for **transient failures**:
- Timing issues
- Temporary file locks
- External resource availability
- Network hiccups when reading external JSON

It is less useful for **permanent failures** (which will just fail again):
- Bad JSON syntax
- Missing template files
- Invalid parameter values

## Code References

- Retry configuration: `main.tsx:85-87`
- RetryMetadata interface: `main.tsx:92-95`
- Queue processing: `main.tsx:1528-1603`
- JSON file processing: `main.tsx:1605-1644`
- JSONL file processing: `main.tsx:1646-1709`
- Failure handling: `main.tsx:1711-1764`
- Command processing/validation: `main.tsx:1237-1462`
