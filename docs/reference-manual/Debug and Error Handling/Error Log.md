---
sidebar_position: 20
aliases:
- Error Log
- error log
- Error Logging
- error logging
---
# Error Log
Z2K Templates maintains an error log file inside your vault. The log captures errors, warnings, and diagnostic information from all plugin operations – both interactive commands and [[Command Queues|background queue processing]]. Two settings in the [[Settings Page]] control where the log is written and how much detail it captures.

## Contents
- [[#Settings]]
- [[#Severity Levels]]
- [[#Log Format]]
- [[#Reading the Log]]

## Settings
Both settings are found under the **Error Logging** heading on the [[Settings Page]].

| Setting             | Default                                               | Description                                                                                                                |
| ------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Error log file**  | `.obsidian/plugins/z2k-plugin-templates/error-log.md` | Path to the log file, relative to the vault root or absolute. By default, the log file is within the plugin's data folder. |
| **Error log level** | Warning                                               | Minimum severity level to record. Everything at this level and above is logged.                                            |

The log file is created automatically on the first logged event. If the file already exists, new entries are appended to the end.

> [!NOTE]
> The default log path places the file inside the plugin's own data folder, keeping it out of your working vault. You can move it anywhere – for example, a dedicated `Admin/Logs/` folder – by changing the path in settings.

## Severity Levels
The log level setting acts as a threshold. Setting it to "Warning" means errors *and* warnings are logged, but informational and debug messages are not.

| Level | What It Captures | When to Use |
| --- | --- | --- |
| **None** | Nothing | Disable logging entirely |
| **Error** | Errors only | You only care about failures |
| **Warning** | Errors + warnings | Default – good for normal use |
| **Info** | Errors + warnings + informational messages | Troubleshooting a specific issue |
| **Debug** | Everything | Maximum detail, including stack traces and context data |

Each level includes all levels above it. "Debug" is the most verbose – it captures everything.

## Log Format
Log entries are written as Markdown, which means you can open the log file directly in Obsidian and read it as a formatted note.

### Standard Format (Error, Warning, Info levels)
Each entry is a heading with the severity and timestamp, followed by the message:

```md
## [ERROR] 2025-06-15 14:23:07
Template parsing failed: unexpected closing tag

---

## [WARN] 2025-06-15 14:25:12
Target folder not found: Projects/Archive

---
```

### Debug Format
When the log level is set to **Debug**, entries include additional diagnostic information:

```md
## [ERROR] 2025-06-15 14:23:07
**Message:** Template parsing failed: unexpected closing tag
**Stack Trace:**
```
Error: unexpected closing tag
    at parseTemplate (plugin:z2k-plugin-templates:2115)
    at processCommand (plugin:z2k-plugin-templates:1045)
```
**Context:**
- templatePath: Templates/Daily Note.md
- command: new

---
```

The stack trace and context data are useful for reporting bugs or understanding exactly where a failure occurred.

## Reading the Log
The log file is a standard Markdown file – open it in Obsidian like any other note. Each entry is separated by a horizontal rule (`---`), with the most recent entries at the bottom.

For a quick look at recent errors, scroll to the end of the file. For a targeted search, use Obsidian's search or `Ctrl/Cmd+F` within the file to find specific error messages or timestamps.

> [!WARNING]
> At present, the log file grows indefinitely. If you use verbose logging levels over a long period, the file can become large. Periodically clear or archive the log by deleting its contents or the file itself – it will be recreated automatically on the next logged event.

> [!DANGER] Internal Notes
> - If the log file cannot be written (permissions, disk full, invalid path), the error is silently logged to the browser console instead. There is no user-visible notification of log write failures.
> - The format check (`this.settings.errorLogLevel !== "debug"`) determines compact vs. verbose format. This means changing the log level from Warning to Debug mid-session will switch format for all subsequent entries, but won't retroactively change earlier entries.
> - The `errorLogPath` setting accepts both vault-relative and absolute paths, but the settings UI validates against characters `* ? " < > |`. It does not validate that the path actually exists or is writable until the first log event.
> - The log file is initialized with a `# Z2K Templates Error Log` heading when first created. This heading is not re-added if the file is manually cleared to empty – only if the file is deleted.
> - We should have a way to clear the log after it reaches a certain size automatically - say 1 MB. 
