---
sidebar_position: 60
aliases:
- Retry and Error Handling
- Retry Logic
- Error Handling
- maxRetries
- retryDelayMs
---
# Retry and Error Handling
The Command Queue includes a retry system for commands that fail due to transient issues – timing problems, temporary file locks, or external resources that weren't available at the moment of execution. This page covers how retries work, what counts as a failure, and how errors are surfaced.

## Contents
- [[#Retry Configuration]]
- [[#How Retries Work]]
- [[#What Is a Failure]]
- [[#What Is Not a Failure]]
- [[#JSONL Error Handling]]
- [[#Design Implications]]

## Retry Configuration
Retry behavior is controlled by two parameters in the [[JSON Packages Overview|JSON Package]]:

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `maxRetries` | number | `0` | Maximum retry attempts after initial failure |
| `retryDelayMs` | number | `0` | Milliseconds to wait before next retry |

These are [[JSON Directives|directive keys]] – they control the queue's behavior, not the template's field data.

### Example
```json
{
  "cmd": "new",
  "templatePath": "Templates/Daily Sync.md",
  "prompt": "none",
  "maxRetries": 3,
  "retryDelayMs": 5000,
  "syncSource": "external-api"
}
```

This command will be attempted up to 4 times total (1 initial + 3 retries), with a 5-second wait between each attempt.

## How Retries Work
When a command with `maxRetries > 0` fails:

1. The plugin creates (or updates) a sidecar file next to the command file:
   - Command: `daily-sync.json`
   - Sidecar: `daily-sync.retry.json`

2. The sidecar tracks retry state:
   ```json
   {
     "attempts": 1,
     "nextRetryAfter": 1705934400000
   }
   ```
   - `attempts` – how many times the command has failed
   - `nextRetryAfter` – Unix timestamp (ms) when the next retry is allowed

3. On subsequent scans, the processor checks the sidecar. If `Date.now() < nextRetryAfter`, the file is skipped.

4. When `nextRetryAfter` has passed, the command is re-executed. On failure, `attempts` is incremented and a new `nextRetryAfter` is set.

5. When `attempts >= maxRetries`, the command is moved to `failed/` and the sidecar is deleted.

### Retry Timing
If `retryDelayMs` is `0` (the default), the retry becomes eligible immediately on the next scan. The effective retry interval is then the [[Queue Settings#Scan Frequency|scan frequency]] setting.

If `retryDelayMs` is non-zero, it adds an additional wait on top of the scan interval. For example:
- Scan frequency: 60 seconds
- `retryDelayMs`: 5000 (5 seconds)
- Effective minimum retry interval: 60 seconds (next scan after the 5-second delay passes)

The delay is a *minimum* wait, not an exact scheduled time.

## What Is a Failure
A failure is any exception thrown during command processing. Failures fall into two categories:

### Validation Errors
These occur before the command executes, during parameter parsing:

| Error                              | Cause                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Missing `cmd`                      | No command specified in the JSON Package                               |
| Empty `cmd`                        | Command is whitespace or empty string                                  |
| Unknown `cmd`                      | Not `new`, `continue`, `insertblock`, or `json`                        |
| Invalid JSON in `templateJsonData` | Malformed JSON string or file not found                                |
| Invalid `prompt` value             | Not `none`, `remaining`, or `all`                                      |
| Invalid `finalize` value           | Not a boolean or recognized string (`true`/`false`/`yes`/`no`/`1`/`0`) |
| Invalid `location` value           | Not a recognized position or valid line number                         |
| Template not found                 | `templatePath` or `blockPath` doesn't resolve to a file                |
| File not found                     | `existingFilePath` doesn't exist (for `continue` and `insertblock`)    |
| Missing required parameter         | e.g., `new` without `templatePath`                                     |

### Execution Errors
These occur during template rendering or file operations:

| Error | Cause |
| --- | --- |
| Template parsing error | Invalid Handlebars syntax in the template |
| Missing partial | A block template reference that can't be resolved |
| File system error | Permission denied, disk full, path too long |
| YAML merge conflict | Incompatible frontmatter structures |

## What Is Not a Failure
Crucially, these scenarios do **not** cause a failure:

### Missing Field Data
If the template has a field `{{authorName}}` but the JSON Package doesn't provide `authorName`, this is **not an error**. The plugin's fallback behavior applies:
- By default, the placeholder `{{authorName}}` is preserved in the output
- The `finalize-clear` option removes the placeholder instead
- Per-field fallbacks can be specified via the [[field-info Helper]]

This design supports deferred resolution – fields can be left unfilled for later completion via the [[JSON Command - continue|continue command]].

### Extra Field Data
If the JSON Package provides `projectManager` but the template doesn't have a `{{projectManager}}` field, the extra data is silently ignored. Handlebars only renders fields that appear in the template. This is not considered to be an error. 

### Summary Table

| Scenario                                          | Triggers Failure?              |
| ------------------------------------------------- | ------------------------------ |
| Template has `{{Field}}`, JSON doesn't provide it | No – fallback behavior applies |
| JSON provides `Field`, template doesn't use it    | No – silently ignored          |
| Template file not found                           | **Yes**                        |
| Invalid JSON syntax in command file               | **Yes**                        |
| Invalid Handlebars syntax in template             | **Yes**                        |
| `existingFilePath` doesn't exist                  | **Yes**                        |
| Invalid command parameters                        | **Yes**                        |
| File system errors                                | **Yes**                        |

## JSONL Error Handling
Errors in a `.jsonl` batch file are handled per-line, not per-file. A bad line does not stop the batch.

When a line fails:
- **If `maxRetries > 0`** – the failed line is extracted into its own standalone `.json` file and handed off to the retry system. It becomes an independent command that will be retried separately from the original batch.
- **If `maxRetries` is absent or `0`** – the line is logged and added to a list of failed lines

After all lines are processed:
- If any lines failed without retries, they're written to `failed/<original-name>.<timestamp>.failed.jsonl`
- Successfully promoted lines (extracted for retry) are **not** written to the failed batch – they're being handled individually

This means a JSONL batch can result in:
- The original file being deleted (all lines processed)
- A `failed/*.failed.jsonl` with lines that had no retry config
- Multiple individual `.json` files in the queue for lines that are being retried

## Design Implications
The retry system is most useful for **transient failures**:
- Timing issues where a referenced file hasn't been indexed yet
- Temporary file locks from sync services
- Syncs with other devices have not yet occurred, blocked on the other device having not yet initiating their sync
- Network hiccups when loading external JSON data
- Resources that become available after a short delay

It is less useful for **permanent failures**:
- Bad JSON syntax in the command file
- Missing template files
- Invalid parameter values
- Template authoring errors (bad Handlebars)

Permanent failures will fail on every retry and eventually exhaust `maxRetries`. They end up in `failed/` regardless – retries just delay the inevitable.

### Recommendations
- Use retries for automation workflows where transient issues are expected
- Set `retryDelayMs` to match the expected recovery time of transient issues (e.g., 5-10 seconds for file indexing)
- Keep `maxRetries` modest (2-3) for transient issues; higher values rarely help for permanent failures
- Inspect the `failed/` folder periodically to catch configuration errors



> [!DANGER] Internal Notes
> - The retry system uses an in-memory check during processing – if a `.retry.json` sidecar is corrupted (invalid JSON), the behavior is undefined. The code reads and parses it but doesn't have explicit error handling for a malformed sidecar.
> - There is no backoff strategy – `retryDelayMs` is constant across all attempts. Exponential backoff would require tracking the current attempt count and calculating delay, which isn't implemented.
> - The failed file contents are identical to the original command – there's no added metadata about what error occurred. Error details are only available in the Obsidian developer console. Consider adding an `error` field to failed files or creating companion `.error` files.
> - JSONL line promotion creates a timestamped filename like `command-2025-01-15_14-30-00-123.json` (with milliseconds). This ensures uniqueness but makes it harder to correlate promoted files back to their source batch.
