---
sidebar_position: 10
aliases:
- Command Queues Overview
- Command Queue Overview
---
# Command Queues Overview
Ever wanted to pass data in Obsidian from external sources, but you never know if Obsidian is running and ready to import the data into the vault? Enter Command Queues. 

Command Queues allows data to be queued up for insertion into your Obsidian vault without having Obsidian to be actively running at the time. When Obsidian launches, the Z2K Templates Plugin will detect the queued commands and then begin processing them automatically. 

The Command Queue is a file-based automation system built into Z2K Templates and uses [[JSON Packages]]. You drop a JSON Package into a watched directory as a `.json` or `.jsonl` file, and the plugin picks it up, executes it, and archives or discards the result – no manual interaction required.

> [!NOTE]
> Command Queues are **disabled by default**. To use them, enable the feature first in Settings → Z2K Templates → [[Command Queue Settings]].

## Why Command Queues Exist
[[URI Actions]] let you trigger Z2K Templates from outside Obsidian, but they require Obsidian to be running and listening at the moment the URI fires. That works for one-shot links and bookmarks. It does not work when:
- You want to queue commands while Obsidian is closed and have them processed on next launch
- An external script needs to batch-create dozens of notes without waiting for each one to finish
- A scheduled job (cron, Apple Shortcuts automation, Windows Task Scheduler) needs to hand off work reliably
- You want retry logic for commands that might fail due to timing or transient issues
- You have a NAS drive auto generating data that does not have direct access to your obsidian vault (or even be able to load it). It can write data to a local drive that then is detected by Command Queues for later direct importing. 
- You wish to serialize the importing of data from a variety of devices and push them into a single queue that will only be processed by a single device in order to prevent duplicate imports. You can share a cloud based folder for all devices to write to, and then designate one machine to handle the command queue processing. 

Command Queues solve this by decoupling *when a command is created* from *when it is executed*. The queue folder acts as a mailbox – anything dropped there will eventually be processed.

## How It Works
The system operates on a simple loop:
1. The plugin scans the [[Queue Folder]] at a configurable interval (default: every 60 seconds)
2. It picks up any `.json` and `.jsonl` files it finds, sorted oldest-first by creation time
3. Each file is parsed as a [[JSON Packages Overview|JSON Package]] and executed through the same command pipeline used by [[URI Actions]]
4. Successful commands are archived in a `done/` subfolder (or deleted immediately, depending on settings)
5. Some commands may be marked for reattempts and will be retried on the next cycle
6. Failed commands are either retried or moved to a `failed/` subfolder

The queue is also available on-demand through the **[[Process Command Queue Now]]** command in the Command Palette.

## Example
Suppose you have a template at `Templates/Reading Note.md` with fields for `{{bookTitle}}`, `{{author}}`, and `{{genre}}`. You can create a note without opening Obsidian's UI by writing this file into the queue directory:

```json
{
  "cmd": "new",
  "templatePath": "Templates/Reading Note.md",
  "prompt": "none",
  "finalize": true,
  "bookTitle": "Gödel, Escher, Bach",
  "author": "Douglas Hofstadter",
  "genre": "Cognitive Science"
}
```

Save it as `reading-note.json` in the queue directory. On the next scan cycle, the plugin creates the note, fills in the fields, finalizes it, and moves the command file to `done/`.

For multiple notes at once, use a `.jsonl` file – one command per line:

```jsonl
{"cmd": "new", "templatePath": "Templates/Reading Note.md", "prompt": "none", "finalize": true, "bookTitle": "Gödel, Escher, Bach", "author": "Douglas Hofstadter", "genre": "Cognitive Science"}
{"cmd": "new", "templatePath": "Templates/Reading Note.md", "prompt": "none", "finalize": true, "bookTitle": "The Phantom Tollbooth", "author": "Norton Juster", "genre": "Fiction"}
{"cmd": "new", "templatePath": "Templates/Reading Note.md", "prompt": "none", "finalize": true, "bookTitle": "Zen and the Art of Motorcycle Maintenance", "author": "Robert Pirsig", "genre": "Philosophy"}
```

See [[JSONL Format]] for the full specification on batch files.

## What's Next
The remaining pages in this section cover the command queueing system in detail:
- [[Queue Folder]] – where files go and how the directory is organized
- [[Queue Processing]] – how the scan loop works and how files are ordered
- [[Queue Settings]] – all configurable options
- [[Command File Lifecycle]] – the states a file passes through
- [[Retry and Error Handling]] – what happens when commands fail
- [[Delayed Commands]] – scheduling commands for a future date
- [[Debugging Command Queues]] – troubleshooting when things go wrong


> [!DANGER] Internal Notes
> - The queue is **disabled** by default as of issue #154 (`offlineCommandQueueEnabled: false`). Users must opt in via settings.
> - The first automatic scan is delayed by one full frequency interval after plugin load. This means if frequency is 60s, the first scan happens ~60s after Obsidian starts. This is by design to avoid a scan storm on startup, but it's worth noting for users who expect immediate processing.
> - There is currently no UI feedback (notification or toast) when a queued command succeeds. The user only sees the resulting note appear in the vault. Consider whether a summary notice ("Processed 3 commands from queue") would be useful.
