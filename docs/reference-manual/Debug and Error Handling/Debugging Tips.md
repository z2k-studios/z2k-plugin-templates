---
sidebar_position: 30
aliases:
- Debugging Tips
- debugging tips
- Troubleshooting
- troubleshooting
---
# Debugging Tips
When a template doesn't behave as expected, the plugin gives you several tools to figure out what went wrong. This page covers the practical steps for diagnosing issues, from the quick checks to the more involved investigation.

## Contents
- [[#Check the Error Log]]
- [[#Use the Developer Console]]
- [[#Inspect Failed Command Files]]
- [[#Increase the Log Level]]
- [[#Common Error Messages]]

## Check the Error Log
The [[Error Log]] is the first place to look. Open the log file in Obsidian (default location: `.obsidian/plugins/z2k-plugin-templates/error-log.md`) and scroll to the bottom for the most recent entries. Each entry includes a timestamp and severity level, so you can correlate it with the action that failed.

If the log is empty or doesn't contain the error you expected, check that the **Error log level** setting in [[Settings Page|Settings]] is set to at least **Warning** (the default).

## Use the Developer Console
For advanced users, some detailed diagnostic information is only written to Obsidian's developer console, not the error log. To open it:
- **Windows/Linux:** `Ctrl + Shift + I`, then click the **Console** tab
- **macOS:** `Cmd + Option + I`, then click the **Console** tab

The console is particularly useful for:
- Seeing the full stack trace of an error (even when the log level is not set to Debug)
- Diagnosing custom [[User Defined Helper Functions|helper function]] errors – loading failures are reported here with the specific JavaScript error
- Checking for template parsing errors that the error dialog didn't fully explain

> [!NOTE]
> The developer console shows output from all plugins, not just Z2K Templates. Look for entries prefixed with `TemplatePluginError`, `Template error`, or `Helper` to filter for relevant messages.

## Inspect Failed Command Files
When a [[Command Queues|command queue]] command fails, the plugin moves it to a `failed/` subfolder within your queue directory. The failed file keeps its original content – you can open it to see what command was attempted.

If the command had retries configured, a `.retry.json` sidecar file tracks how many attempts were made before the command was moved to `failed/`. See [[Retry and Error Handling]] for the full lifecycle.

To diagnose a failed command:
1. Open the file in `failed/` – the filename includes a timestamp showing when it failed
2. Check the JSON for obvious issues: missing `cmd` field, invalid `templatePath`, malformed data
3. Cross-reference with the [[Error Log]] – look for entries near the same timestamp

## Increase the Log Level
If the standard log entries don't provide enough detail, temporarily increase the **Error log level** to **Debug** in [[Settings Page|Settings]]. At the Debug level, log entries include:
- Full stack traces for every error
- Context data showing which template, command, or field was involved

Remember to set it back to **Warning** after diagnosing your issue – Debug logging is verbose and the log file grows quickly.

## Common Error Messages
The table below lists the error messages you're most likely to encounter and what to do about them.

| Error Message | Where It Appears | Cause | What to Do                                                                                               |
| ------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| "Please enter a valid number" | Inline (form field) | A number-type field contains non-numeric text | Enter a valid number or clear the field                                                                  |
| "This field is required to finalize" | Inline (form field) | A `required` field was left empty during finalization | Provide a value before finalizing                                                                        |
| "Contains invalid characters" | Inline (form field) | A title field contains `\ / : * ? " < > \|` | Remove the invalid characters from the title                                                             |
| "Cannot be just dots" | Inline (form field) | A title field contains only dots (e.g., `...`) | Enter a meaningful title                                                                                 |
| "Cannot end with a space or dot" | Inline (form field) | A title field ends with a trailing space or period | Remove the trailing space or dot                                                                         |
| "Circular dependency detected: a -> b -> a" | Error dialog | Computed fields reference each other in a loop | Break the cycle by removing one of the circular `value=` references in your `{{fieldInfo}}` declarations |
| `[Error in helperName]` | Template output | A [[User Defined Helper Functions\|custom helper function]] threw an error during execution | Check the developer console for the specific JavaScript error, then fix the helper code                  |
| "Failed to load custom helpers" | Notice popup | The custom helpers JavaScript could not be evaluated | Open the developer console for the specific error, then edit your helpers in [[Settings Page\|Settings]] |

> [!DANGER] Internal Notes
> - The error reference table is curated, not exhaustive. Command queue validation errors (missing `cmd`, invalid `prompt`, template not found, etc.) are fully documented in [[Retry and Error Handling]] and not duplicated here.
> - Template parsing errors from the Handlebars engine produce varied messages depending on the specific syntax issue (unmatched braces, unknown helpers, malformed expressions). These are shown in the error dialog but are not individually catalogued here because they come from the underlying Handlebars library.
> - The developer console prefixes mentioned in the "Use the Developer Console" section reflect current code behavior (`console.error("TemplatePluginError: ", ...)`, `console.error("Template error: ", ...)`, `console.error("Helper '${name}' threw:", ...)`). If these change in a future refactor, update this section.
> - The `[Error in helperName]` output format is hardcoded in the helper wrapper function. It appears inline in the rendered template output, which could be confusing if the user doesn't realize a helper failed. Consider whether a more prominent notification should accompany this.
