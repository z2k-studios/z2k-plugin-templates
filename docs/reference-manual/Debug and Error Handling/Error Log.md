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
The following settings are found under the **Error Logging** heading on the [[Settings Page]]. See [[Error Logging Settings]] for the full reference.

| Setting             | Default | Description                                                                     |
| ------------------- | ------- | ------------------------------------------------------------------------------- |
| **Error log level** | Warning | Minimum severity level to record. Everything at this level and above is logged. |
| **View Error Log**  | Button  | Opens the [[View Error Log\|live log viewer]] modal                             |

The log file is always written to `.obsidian/plugins/z2k-plugin-templates/error-log.md`. This location is fixed — it is not user-configurable. The file is created automatically on the first logged event; new entries are appended to the end.

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
The quickest way to view the log is the **[[View Error Log]]** button in **Settings → Error Logging**. It opens a live viewer modal that updates in real time and includes a **Clear Log** button (with confirmation).

The log file is also a standard Markdown file — open it in Obsidian like any other note. Each entry is separated by a horizontal rule (`---`), with the most recent entries at the bottom. For a targeted search, use `Ctrl/Cmd+F` within the file to find specific error messages or timestamps.

> [!NOTE]
> The log is automatically trimmed when it exceeds **1 MB** — older entries are removed until the file is approximately 700 KB. You can also clear the log manually at any time via the [[View Error Log|log viewer]].

> [!DANGER] Internal Notes
> - If the log file cannot be written (permissions, disk full), the error is silently logged to the browser console instead. There is no user-visible notification of log write failures.
> - The format check (`this.settings.errorLogLevel !== "debug"`) determines compact vs. verbose format. Changing the log level mid-session switches format for all subsequent entries but does not retroactively reformat earlier ones.
> - The log file is initialized with a `# Z2K Templates Error Log` heading when first created. This heading is not re-added if the file is manually cleared to empty — only if the file is deleted.
