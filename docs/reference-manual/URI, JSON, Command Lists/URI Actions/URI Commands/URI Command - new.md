---
sidebar_position: 10
sidebar_label: "new"
sidebar_class_name: z2k-code
aliases:
- URI Command - new
- URI new
---
# URI Command: new
The URI `new` command creates a note from a template. 

## Quick Reference
A minimal URI to create a note from a template:

```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FMeeting.md
```

The user is prompted for field values and a title interactively – the same behavior as creating the note through the command palette.

The absolute minimum – no template file needed at all:

```
obsidian://z2k-templates?cmd=new&templateContents=Hello%20World!&fileTitle=Hello%20World&prompt=none&finalize=true
```

This is the "hello world" of Z2K Templates URI calls. No vault, no template file, no pre-existing setup. If this works, the plugin is installed and responding.

## JSON Consistency
The URI `new` command is equivalent to the [[JSON Command - new|JSON `new` command]] – same directives, same behavior, different transport. For the full command reference, see [[JSON Command - new]].

## Supported Directives
The table below summarizes the [[URI Directives]] relevant to the `new` command.

| Directive            | Required    | Notes                                                                                                              |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `templatePath`       | Conditional | Vault-relative path to the template file. Either `templatePath` or `templateContents` is required — not both.     |
| `templateContents`   | Conditional | Inline template text. No template file needed. Destination defaults to vault root; override with `destDir`.       |
| `destDir`            | No          | Override the default output folder.                                                                                |
| `prompt`             | No          | `none`, `remaining`, or `all`                                                                                      |
| `finalize`           | No          | `true` or `false`                                                                                                  |
| `fileTitle`          | No          | Set the output filename.                                                                                           |
## Field Data
All remaining parameters that do not match a [[URI Directives|URI Directive]] keyword are treated as field data. As such, the plugin fills the matching `{{fields}}` in the template with the data value provided. See [[URI Field Data]].

All values arrive as strings. The plugin converts them based on [[URI Type Handling|field type declarations]].

## Examples

### Example - Minimal - New File with Interactive Prompting
*Task:* Create a note from a template with full interactive prompting.

*Pre-encoded:*
```
vault        = MyVault
cmd          = new
templatePath = Templates/Daily.md
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FDaily.md
```

This opens the template interactively. The user picks field values and enters a title – indistinguishable from creating the note through the UI.

### Example - Fully Automated – New File with Finalized Field Data
*Task:* Create a character dossier with all fields supplied, no prompting, and immediate finalization.

*Pre-encoded:*
```
vault        = MyVault
cmd          = new
templatePath = Templates/Character.md
prompt       = none
finalize     = true
fileTitle    = Inigo Montoya
name         = Inigo
role         = Swordsman
specialty    = Fencing
motivation   = Vengeance
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FCharacter.md&prompt=none&finalize=true&fileTitle=Inigo%20Montoya&name=Inigo&role=Swordsman&specialty=Fencing&motivation=Vengeance
```

All fields are supplied, `prompt` is `none`, and `finalize` is `true`. The note appears fully formed – no interaction required. The fields `{{name}}`, `{{role}}`, `{{specialty}}`, and `{{motivation}}` are filled with the provided values.

### Example - Prompt for the Rest
*Task:* Supply some fields upfront and let the user fill in the rest interactively.

*Pre-encoded:*
```
vault        = MyVault
cmd          = new
templatePath = Templates/Observation.md
prompt       = remaining
fileTitle    = Pond Notes
observer     = H Thoreau
location     = Walden
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FObservation.md&prompt=remaining&fileTitle=Pond%20Notes&observer=H%20Thoreau&location=Walden
```

`{{observer}}` and `{{location}}` are pre-filled. Any other fields in the template – e.g. `{{weather}}`, `{{species}}`, `{{notes}}` – will be prompted for interactively.

### Example - Custom Output Folder
*Task:* Override the template's default destination folder when creating a new file.

*Pre-encoded:*
```
vault        = MyVault
cmd          = new
templatePath = Templates/Contact.md
destDir      = People/Philosophers
prompt       = none
fileTitle    = Socrates
name         = Socrates
method       = Questioning
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FContact.md&destDir=People%2FPhilosophers&prompt=none&fileTitle=Socrates&name=Socrates&method=Questioning
```

The note is created in `People/Philosophers/` instead of the template's default folder. The folder is created automatically if it doesn't exist. The fields `{{name}}` and `{{method}}` are filled with the provided values.

==TODO: What system blocks does it use in this instance, the destdir or the template?==

### Example - Advanced - With JSON Field Data
*Task:* When many fields need complex values, bundle them into a single `fieldData` parameter instead of encoding each field individually. See [[URIs with JSON Data]] for details.

*Pre-encoded:*
```
vault        = MyVault
cmd          = new
templatePath = Templates/Dinner.md
prompt       = none
finalize     = true
fileTitle    = Factory Dinner
fieldData    = {"host":"Warhol","venue":"Factory","guests":"Edie, Lou, Nico","dress_code":"Silver"}
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FDinner.md&prompt=none&finalize=true&fileTitle=Factory%20Dinner&fieldData=%7B%22host%22%3A%22Warhol%22%2C%22venue%22%3A%22Factory%22%2C%22guests%22%3A%22Edie%2C%20Lou%2C%20Nico%22%2C%22dress_code%22%3A%22Silver%22%7D
```

The `fieldData` value is a URL-encoded JSON object. Once decoded, its keys (`{{host}}`, `{{venue}}`, `{{guests}}`, `{{dress_code}}`) fill the corresponding template fields.

### Example - Inline Template — No File Required
*Task:* Create a note without any pre-existing template file on disk.

*Pre-encoded:*
```
cmd               = new
templateContents  = Hello {{Recipient}}!
prompt            = none
finalize          = true
fileTitle         = Hello World
Recipient         = Emerson
```

*Encoded URI:*
```
obsidian://z2k-templates?cmd=new&templateContents=Hello%20%7B%7BRecipient%7D%7D!&prompt=none&finalize=true&fileTitle=Hello%20World&Recipient=Emerson
```

The note is created in the vault root with the text "Hello Emerson!" and no prompting. No template file is needed anywhere in the vault. System blocks are not applied; the global block YAML still is.

> [!DANGER] Internal Notes
> - ==**#TEST** Confirm the behavior when `fileTitle` is not provided and `prompt` is `none`. The JSON Command - new page notes this as an open question (code path through `createCard` → title resolution). The same uncertainty applies to URI invocation.==
> - ==**#TEST** Confirm that `{{Recipient}}` in `templateContents` survives URI encoding/decoding intact. The `{` and `}` characters encode to `%7B` and `%7D` — verify these round-trip correctly through Obsidian's URI handler.==
