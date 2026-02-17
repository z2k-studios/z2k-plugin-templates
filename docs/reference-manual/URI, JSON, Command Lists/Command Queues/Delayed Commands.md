---
sidebar_position: 70
aliases:
- Delayed Commands
- Scheduled Commands
- .delay.json
---
# Delayed Commands
Delayed Commands let you schedule a command for future execution by encoding the target date in the filename. The command file sits in the [[Queue Directory]] until its scheduled time arrives, at which point it becomes eligible for processing.

## Contents
- [[#Filename Pattern]]
- [[#Date-Only vs. Date and Time]]
- [[#How Delay Processing Works]]
- [[#Use Cases]]
- [[#Limitations]]

## Filename Pattern
To delay a command, add a date pattern before `.delay.json`:

```
<name>.<date>.delay.json
```

The date can be in one of two formats:
- **Date only**: `YYYY-MM-DD`
- **Date and time**: `YYYY-MM-DD_HH-mm-ss`

### Examples
| Filename | Executes After |
| --- | --- |
| `reminder.2025-06-15.delay.json` | June 15, 2025 at midnight |
| `report.2025-12-31_09-00-00.delay.json` | December 31, 2025 at 9:00 AM |
| `weekly-sync.2025-02-01_14-30-00.delay.json` | February 1, 2025 at 2:30 PM |

The `<name>` portion can be anything – it's preserved for identification and used when archiving.

## Date-Only vs. Date and Time
When only a date is provided (no time component), the command becomes eligible at **midnight** (00:00:00) on that date, in the local timezone of the system running Obsidian.

```
quarterly-review.2025-04-01.delay.json
```
This executes on or after April 1, 2025 at 00:00:00 local time.

When a time is included, the command waits until that specific moment:
```
standup-notes.2025-01-15_09-30-00.delay.json
```
This executes on or after January 15, 2025 at 9:30:00 AM local time.

## How Delay Processing Works
The delay check happens during each [[Queue Processing|scan cycle]]:

1. The queue processor lists all `.json` files (including `.delay.json` files)
2. For each file, it checks if the filename matches the delay pattern
3. If the pattern matches, it extracts the date (and optional time) and converts to a timestamp
4. If `Date.now() < delayTimestamp`, the file is skipped
5. Once the delay has passed, the file is processed normally

This is a **poll-based** system – the file doesn't execute at precisely the scheduled time. It becomes *eligible* at that time and is picked up on the next scan. The actual execution time is bounded by the [[Queue Settings#Scan Frequency|scan frequency]]:
- Scheduled for 9:00 AM
- Scan frequency is 60 seconds
- Scan runs at 8:59:30 AM – file is skipped
- Next scan at 9:00:30 AM – file is processed

For time-sensitive scheduling, reduce the scan frequency. For most use cases, the default 60-second interval is sufficient.

## Use Cases

### Scheduled Reports
Create notes on specific dates – end of quarter, project milestones, recurring reviews:

```json
{
  "cmd": "new",
  "templatePath": "Templates/Quarterly Review.md",
  "prompt": "none",
  "quarter": "Q4 2025",
  "reviewType": "financial"
}
```

Save as `q4-review.2025-12-31.delay.json`. The note is created on December 31st.

### Future Reminders
Generate reminder notes that appear on a specific day:

```json
{
  "cmd": "new",
  "templatePath": "Templates/Reminder.md",
  "prompt": "none",
  "finalize": true,
  "reminderText": "Renew domain registration",
  "urgency": "high"
}
```

Save as `domain-renewal.2025-08-15.delay.json`.

### Staggered Batch Operations
Process commands at different times to spread load or create notes in sequence:

```
batch-part-1.2025-02-01_08-00-00.delay.json
batch-part-2.2025-02-01_12-00-00.delay.json
batch-part-3.2025-02-01_16-00-00.delay.json
```

Each batch executes at a different time on the same day.

### Coordination with External Systems
Queue commands that depend on external data that will be available at a known future time:

```json
{
  "cmd": "new",
  "templatePath": "Templates/Data Import.md",
  "prompt": "none",
  "templateJsonData": "Data/exports/nightly-export.json"
}
```

Save as `nightly-import.2025-01-16_06-00-00.delay.json` to run after a 5 AM export completes.

## Limitations

### Poll-Based Timing
The delay system does not use system schedulers or timers. It relies on the scan loop, which means:
- Execution is not instantaneous when the time arrives
- If Obsidian is closed at the scheduled time, the command runs on next launch
- High-precision scheduling (sub-minute) requires a very short scan frequency which we do not recommend. 

### No Recurring Schedules
A delayed command executes **once**. There is no built-in mechanism for recurring schedules like "every Monday at 9 AM." For recurring commands, use external tools (cron, Windows Task Scheduler, Apple Shortcuts) to write new command files into the queue at the desired interval.

### Timezone Handling
Dates are interpreted in the **local timezone** of the machine running Obsidian. There is no way to specify a timezone in the filename. If you sync a queue directory across machines in different timezones, the command will execute at the local time of whichever machine scans it first.

### Archival Naming
When a delayed command is archived after successful execution, the `.delay` portion is stripped from the filename:
- Original: `report.2025-06-15.delay.json`
- Archived: `done/report.2025-06-15_14-30-00.done.json` (execution timestamp replaces delay date)

This prevents confusing filenames like `report.2025-06-15.delay.2025-06-15_14-30-00.done.json`.

> [!DANGER] Internal Notes
> - The date parsing regex is: `/\.(\d{4}-\d{2}-\d{2})(?:_(\d{2}-\d{2}-\d{2}))?\.delay\.json$/i`
> - The pattern match is case-insensitive, so `.DELAY.json` works the same as `.delay.json`
> - There is no validation that the date is in the future. A past date simply means the command is immediately eligible – it won't fail or warn.
> - Malformed dates (e.g., `2025-13-45`) will cause `parseDelayFromFilename()` to return `null`, treating the file as a regular `.json` file without delay – this could lead to unexpected immediate execution if the filename was intended to be delayed but had a typo.
> - The delay check runs **before** the retry sidecar check. A delayed command that also has retries configured will wait for the delay date, then follow the retry schedule if it fails.
