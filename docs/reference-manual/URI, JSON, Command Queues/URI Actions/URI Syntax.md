---
sidebar_position: 10
aliases:
- URI Syntax
- URI Format
- URI Structure
---
# URI Syntax
Z2K Templates exposes a URI scheme that lets you trigger template commands from outside Obsidian. A URI consists of three parts: a **command** that says what to do, **directives** that configure how to do it, and **field data** that supplies values for the template.

## Contents
- [[#Base Format]]
- [[#URI Syntax Elements]]
- [[#Quick URI Example]]
- [[#Vault]]
- [[#Commands]]
- [[#Directives]]

## Base Format
Every Z2K Templates URI follows this structure:

```
obsidian://z2k-templates?vault=<vault>&cmd=<command>&<directive>=<value>&<field>=<value>
```


## URI Syntax Elements
To break the above structure down:

| URI Component         | Description                                                         | Required?            | See Also           |
| --------------------- | ------------------------------------------------------------------- | -------------------- | ------------------ |
| `obsidian://`         | Tells the operating system to open Obsidian                         | True                 |                    |
| `z2k-templates`       | Routes the request to the Z2K Templates plugin                      | True                 |                    |
| `vault`               | The name of the vault to target                                     | Optional             | [[#Vault]]         |
| `cmd`                 | The command to execute: `new`, `continue`, `insertblock`, or `json` | True                 | [[URI Commands]]   |
| `<directive>=<value>` | Directives that configure the command's behavior                    | (Conditional on cmd) | [[URI Directives]] |
| `<field>=<value>`     | Values for template fields                                          | (Conditional on cmd) | [[URI Field Data]] |

Parameters are separated by `&`. The first parameter is preceded by `?` – this is standard URI syntax, not specific to Z2K Templates.


## Quick URI Example
Here is a simple example, shown pre-encoding for readability:

```
obsidian://z2k-templates?
  vault        = MyVault
  cmd          = new
  templatePath = Templates/Meeting Notes.md
  prompt       = remaining
  topic        = Budget
  priority     = high
```

This tells the plugin: open the vault "MyVault", create a new note from `Templates/Meeting Notes.md`, pre-fill `{{topic}}` with "Budget" and `{{priority}}` with "high", and prompt the user for any remaining fields.

The actual URI, with values encoded for transport:

```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FMeeting%20Notes.md&prompt=remaining&topic=Budget&priority=high
```

See [[URI Encoding]] for how special characters like spaces and slashes are handled.

## Vault
The `vault` parameter specifies which vault Obsidian should target. Obsidian switches to this vault before executing the command.

- If `vault` is omitted, the URI is routed to whichever vault was last active.
- The value is the vault's display name (e.g., `My Vault`), URL-encoded if it contains spaces.
- Make sure the destination vault actually has Z2K Templates installed, otherwise the URI call will go to deaf ears.

> [!WARNING]
> When a URI is triggered from outside Obsidian – a shell script, browser bookmark, Apple Shortcut – there is no guarantee which vault is active. We recommend that you always include `vault` in URIs intended for external use. Omitting it is safe only when you have a single vault - *and never will have more than one* to prevent it breaking in the future - and who wouldn't want more vaults?! 
> 
> For more critical command processing with debugging abilities, you may consider using [[Command Queues]] instead.

## Commands
The `cmd` parameter determines what the plugin does. Four commands are available:

| Command       | Purpose                                                     |
| ------------- | ----------------------------------------------------------- |
| `new`         | Create a new note from a template                           |
| `continue`    | Fill remaining fields in an existing WIP note               |
| `insertblock` | Insert a block template into an existing note               |
| `fromJson`    | Execute a full command packaged as a JSON string (advanced) |

Each command has its own page with details and examples. See [[URI Commands]] for more details.

## Directives
Directives are parameters that control the command's behavior – which template to use, where to put the output, whether to prompt the user. They are distinct from field data.

For example, `templatePath`, `prompt`, `finalize`, and `destDir` are all directives. The plugin recognizes a fixed set of directive keys; anything else is treated as field data.

For the full list, see [[URI Directives]].

## Field Data
Any parameter that isn't a recognized directive is treated as **field data** – it fills a template field. For details on how to provide field data, see [[URI Field Data]].



> [!DANGER] INTERNAL NOTES
> - **Vault parameter** – Obsidian handles `vault` at the app level before routing to plugin handlers via `registerObsidianProtocolHandler()`. The Advanced URI plugin confirms this pattern – it includes `vault` in its documented URI schema but has zero vault-handling code; Obsidian switches vaults before the plugin's handler fires. The Z2K Templates plugin likewise does not need to handle `vault`. **Needs manual testing:** confirm that `vault` is stripped from the params object before reaching the handler (or if it passes through, that it is harmlessly ignored as template field data). If it passes through, consider adding `'vault'` to `knownKeys` and discarding it.
> - **URI key casing risk** – The plugin normalizes directive keys (case-insensitive, strips non-alphanumeric), but field data keys preserve their original casing because they must match template field names exactly. If any platform or intermediary lowercases the entire URI before Obsidian receives it, field data keys like `meetingType` would arrive as `meetingtype` and fail to match. **Action:** Test URI key casing on macOS, Windows, and iOS to confirm keys are passed through verbatim.
