---
sidebar_position: 30
sidebar_label: "insertBlock"
sidebar_class_name: z2k-code
aliases:
- URI Command - insertBlock
- URI insertBlock
- URI insertblock
---
# URI Command: insertBlock
The URI `insertblock` command inserts a [[Block Templates|block template]] into an existing note.

## Quick Reference
A minimal URI to insert a block at a specific header:

```
obsidian://z2k-templates?vault=MyVault&cmd=insertblock&blockPath=Templates%2FBlocks%2FTask.block&existingFilePath=Notes%2FPlan.md&destHeader=Tasks
```

The block template is rendered and inserted at the top of the `Tasks` section in the target file.

## JSON Consistency
The URI `insertblock` command is equivalent to the [[JSON Command - insertblock|JSON `insertblock` command]] – same directives, same insertion logic, different transport. For the full command reference – including insertion locations and `destHeader` matching – see [[JSON Command - insertblock]].

## Supported Directives
The table below summarizes the [[URI Directives]] relevant to the `insertblock` command.

| Directive          | Required    | Notes                                                                                                                          |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `blockPath`        | Yes         | Vault-relative path to the block template. `templatePath` also works.                                                          |
| `existingFilePath` | Conditional | Vault-relative path to the target file. Required for automated use. If omitted, the block inserts at the cursor (editor mode). |
| `destHeader`       | Conditional | Required when `location` is `header-top` or `header-bottom`.                                                                   |
| `location`         | No          | `file-top`, `file-bottom`, `header-top`, `header-bottom`, or a line number. See [[JSON Directives#Location Values]].           |
| `prompt`           | No          | `none`, `remaining`, or `all`                                                                                                  |
| `finalize`         | No          | `true` or `false`                                                                                                              |

> [!NOTE]
> When `existingFilePath` and `location` are both omitted, the plugin enters **editor mode** – it inserts the block at the cursor position in the currently active file. This is useful for URI-triggered insertion when you want the user to control placement. For automated or batch workflows, always specify both `existingFilePath` and `location`.

## Field Data
All remaining parameters that do not match a [[URI Directives|URI Directive]] keyword are treated as field data for the block template. As such, the plugin fills the matching `{{field}}` in the block with the data value provided. See [[URI Field Data]].

All values arrive as strings. The plugin converts them based on [[URI Type Handling|field type declarations]].

## Examples

### Example - Insert at a Header
*Task:* Insert an operation brief block at the bottom of the "Operations" section.

*Pre-encoded:*
```
vault            = MyVault
cmd              = insertblock
blockPath        = Templates/Blocks/Brief.block
existingFilePath = WarRoom/Briefing.md
destHeader       = Operations
location         = header-bottom
prompt           = none
operation        = Overlord
status           = Planning
commander        = Eisenhower
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=insertblock&blockPath=Templates%2FBlocks%2FBrief.block&existingFilePath=WarRoom%2FBriefing.md&destHeader=Operations&location=header-bottom&prompt=none&operation=Overlord&status=Planning&commander=Eisenhower
```

The block is rendered with `{{operation}}`, `{{status}}`, and `{{commander}}` filled in, then inserted at the bottom of the "Operations" section in `WarRoom/Briefing.md`.

### Example - Insert at a Specific Header Level
*Task:* Target a header at a specific Markdown level by prefixing with `#` characters.

*Pre-encoded:*
```
vault            = MyVault
cmd              = insertblock
blockPath        = Templates/Blocks/Note.block
existingFilePath = Notes/Journal.md
destHeader       = ### Morning
location         = header-top
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=insertblock&blockPath=Templates%2FBlocks%2FNote.block&existingFilePath=Notes%2FJournal.md&destHeader=%23%23%23%20Morning&location=header-top
```

The `destHeader` value `### Morning` matches only H3 headers. An `## Morning` or `# Morning` header would not match. Note that `#` encodes to `%23`. See [[JSON Directives#destHeader Matching]] for the full matching rules.

### Example - Insert at the Top of a File
*Task:* Insert a status banner *after* the file's frontmatter, before existing content.

*Pre-encoded:*
```
vault            = MyVault
cmd              = insertblock
blockPath        = Templates/Blocks/Banner.block
existingFilePath = Exhibits/SoupCans.md
location         = file-top
prompt           = none
finalize         = true
status           = Displayed
gallery          = MoMA
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=insertblock&blockPath=Templates%2FBlocks%2FBanner.block&existingFilePath=Exhibits%2FSoupCans.md&location=file-top&prompt=none&finalize=true&status=Displayed&gallery=MoMA
```

The block is inserted after frontmatter, before any existing content. The fields `{{status}}` and `{{gallery}}` are filled with the provided values.

### Example - Insert at a Line Number
*Task:* Insert a block at a specific line in the file.

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=insertblock&blockPath=Templates%2FBlocks%2FDivider.block&existingFilePath=Notes%2FLong.md&location=42
```

The block is inserted at line 42. No `destHeader` needed.

### Example - Repeated Insertion – Building a List
*Task:* Append entries to a section over time. Each `insertblock` call targeting `header-bottom` on the same section appends another entry.

*Pre-encoded:*
```
vault            = MyVault
cmd              = insertblock
blockPath        = Templates/Blocks/Person.block
existingFilePath = Guilder/MiracleMax.md
destHeader       = Personnel
location         = header-bottom
prompt           = none
finalize         = true
name             = Max
title            = Retired
specialty        = Resurrection
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=insertblock&blockPath=Templates%2FBlocks%2FPerson.block&existingFilePath=Guilder%2FMiracleMax.md&destHeader=Personnel&location=header-bottom&prompt=none&finalize=true&name=Max&title=Retired&specialty=Resurrection
```

Run it again with different field values to add Valerie:
```
obsidian://z2k-templates?vault=MyVault&cmd=insertblock&blockPath=Templates%2FBlocks%2FPerson.block&existingFilePath=Guilder%2FMiracleMax.md&destHeader=Personnel&location=header-bottom&prompt=none&finalize=true&name=Valerie&title=Wife&specialty=Motivation
```

Each invocation appends a new personnel entry at the bottom of the "Personnel" section. This pattern is how you build up a list or log over time.

### Example - Editor Mode – Insert at the Cursor
*Task:* Insert a block at the cursor position in the currently active file.

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=insertblock&blockPath=Templates%2FBlocks%2FQuote.block&prompt=remaining
```

When `existingFilePath` and `location` are both omitted, the block inserts at the cursor position in whatever file is currently open. This is useful for browser bookmarks or toolbar buttons that insert a frequently used block at the current editing position.

### Example - Advanced - With JSON Field Data
*Task:* Bundle many fields into a single `fieldData` parameter. See [[URIs with JSON Data]] for details.

*Pre-encoded:*
```
vault            = MyVault
cmd              = insertblock
blockPath        = Templates/Blocks/Seating.block
existingFilePath = Events/Dinner.md
destHeader       = Seating
location         = header-bottom
prompt           = none
finalize         = true
fieldData        = {"philosopher":"Kant","seat":3,"left":"Hume","right":"Descartes"}
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=insertblock&blockPath=Templates%2FBlocks%2FSeating.block&existingFilePath=Events%2FDinner.md&destHeader=Seating&location=header-bottom&prompt=none&finalize=true&fieldData=%7B%22philosopher%22%3A%22Kant%22%2C%22seat%22%3A3%2C%22left%22%3A%22Hume%22%2C%22right%22%3A%22Descartes%22%7D
```

The `fieldData` value decodes to a JSON object whose keys fill the corresponding template fields:
```json
{"philosopher": "Kant", "seat": 3, "left": "Hume", "right": "Descartes"}
```

> [!DANGER] Internal Notes
> - When `existingFilePath` is omitted in a URI context, the plugin falls through to editor mode (insert at cursor). This is fragile for URI use since the user may not have the expected file open. Consider whether the plugin should throw an error when `existingFilePath` is missing in a URI context rather than silently falling through. Currently the code does not distinguish between URI and interactive invocation at this point.
> - The block template's YAML frontmatter is merged into the existing file's frontmatter using a "last wins" strategy. This could silently overwrite existing YAML properties. Worth a cross-reference to YAML merging behavior documentation if/when it exists.
> - Confirm behavior when `location` is a line number that exceeds the file's total lines. The JSON Command - insertblock page notes this as an open question.
> - The `destHeader` parameter requires URL-encoding when the header text contains spaces or the `#` prefix. The `#` character encodes to `%23`. This is easy to get wrong – `### Morning` becomes `%23%23%23%20Morning`. Consider noting this more prominently, or providing a helper/example in the how-to guide.
