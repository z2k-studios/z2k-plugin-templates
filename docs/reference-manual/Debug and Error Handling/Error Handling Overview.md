---
sidebar_position: 10
aliases:
- Error Handling Overview
- error handling overview
---
# Error Handling Overview
Z2K Templates handles errors at three levels, each designed for a different class of problem. Validation catches mistakes while you're still editing. Modal dialogs report failures during template processing. And the [[Error Log]] silently records everything for later inspection. Most error behavior is documented alongside the feature it belongs to – this page maps out where to find what.

## Contents
- [[#How Errors Surface]]
- [[#Inline Validation]]
- [[#Error Dialogs]]
- [[#Silent Logging]]
- [[#Missing Field Data]]
- [[#Where Feature-Specific Errors Are Documented]]

## How Errors Surface
When something goes wrong, the plugin chooses one of three channels based on the severity and context of the problem:
- **Inline validation** – Field-level errors shown directly in the prompting form
- **Error dialogs** – Modal popups for errors that prevent a template from being processed
- **Silent logging** – Entries written to the [[Error Log]] file (and optionally the browser console)

Interactive commands (creating a note, continuing a note) use all three channels. Background operations like [[Command Queues|command queue processing]] only log to the error log – no popups or modals appear.

## Inline Validation
The [[Prompting]] form validates field values as you type. When a field has an invalid value, the plugin:
- Highlights the field's input with a red border
- Displays an error message directly below the field
- Scrolls to the first invalid field if you attempt to submit

Validation runs on every change, focus, and blur event – you don't have to submit the form to see problems. Some validations only block submission during [[Finalization|finalization]] (for example, fields marked as `required`).

### What Gets Validated
| Condition | Error Message | Blocks Submission? |
| --- | --- | --- |
| Number field with non-numeric value | "Please enter a valid number" | Always |
| `required` field left empty | "This field is required to finalize" | Only during finalization |
| Title field containing `\ / : * ? " < > \|` | "Contains invalid characters" | Always |
| Title field that is only dots (e.g., `...`) | "Cannot be just dots" | Always |
| Title field ending with a space or dot | "Cannot end with a space or dot" | Always |

Title validation applies to the `fileTitle` field and any field with the `titleText` type – these rules match the file naming restrictions enforced by most operating systems.

> [!INFO]
> Validation errors are purely local to the form. They are not written to the [[Error Log]] and do not appear in the browser console.

## Error Dialogs
When a template cannot be parsed or processed, the plugin opens an error dialog with:
- A description of the problem
- For template syntax errors, additional detail about the nature of the issue
- A **Copy Full Error** button that copies the message and technical details to your clipboard (useful for reporting issues)

Error dialogs appear for problems like:
- Invalid Handlebars syntax in a template (unmatched braces, unknown expressions)
- Circular dependencies between computed fields
- File system errors during note creation

## Silent Logging
Every error (and optionally warnings, info, and debug messages) is recorded in the [[Error Log]] file regardless of whether a dialog was shown. This is the only error channel used during [[Command Queues|command queue]] processing – background operations never show popups.

For details on configuring and reading the error log, see [[Error Log]].

## Missing Field Data
When a template field has no data provided for it, this is **not an error**. The plugin applies [[Fallback Behavior|fallback behavior]] instead – by default, the field placeholder is preserved in the output for later resolution. See the [[Fallback Behavior]] page for the full explanation of how missing data is handled.

## Where Feature-Specific Errors Are Documented
Most error behaviors are documented alongside the feature they belong to. Here's where to find them:
- **Command queue failures and retries** – [[Retry and Error Handling]] covers retry configuration, failure classification, and the JSONL batch error pipeline
- **Helper function errors** – [[Helper Functions Overview]] and [[Custom Helper Functions]] describe what happens when a helper throws an error (including the `[Error in helperName]` inline output)
- **Fallback behavior** – [[Fallback Behavior]] explains what happens when a field has no value
- **Template syntax** – [[Handlebars Support]] covers the template language and its constraints

> [!DANGER] INTERNAL NOTES
> - The error dialog uses the `TemplateError` class from the engine to show richer descriptions for syntax errors. For other error types, it shows a raw message. This distinction is internal and not documented to users.
> - The `UserCancelError` class suppresses all error handling when a user cancels a dialog – no logging, no modal, no notice. This is intentional but not surfaced anywhere in docs.
> - The inline validation for `fileTitle` and `titleText` types share the same rules, but `fileTitle` is always validated regardless of type setting. If these diverge in future, this page will need updating.
> - The "Blocks Submission?" column in the validation table reflects current code: `required` fields use a separate `hasFinalizeError` flag that only blocks during finalization, while other errors block unconditionally.
