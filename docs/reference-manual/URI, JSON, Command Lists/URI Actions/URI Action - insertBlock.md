---
sidebar_position: 40
sidebar_class_name: z2k-code
aliases:
- URI Action - insertBlock
- URI insertBlock
- URI insertblock
---
# URI Action: insertBlock
The `insertblock` action inserts a [[Block Templates|block template]] into an existing note via URI. It is the URI equivalent of the [[JSON Command - insertblock|JSON `insertblock` command]] — same directives, same insertion logic, different transport.

This page covers URI-specific considerations and examples. For the full directive reference — including insertion locations and destHeader matching — see [[JSON Command - insertblock]].

## Quick Reference
A minimal URI to insert a block at a specific header:

```
obsidian://z2k-templates?cmd=insertblock&blockPath=Templates%2FBlocks%2FTask%20List.block&existingFilePath=Notes%2FProject%20Plan.md&destHeader=Tasks
```

The block template is rendered and inserted at the top of the `Tasks` section in the target file.

## Parameters
All parameters from [[JSON Command - insertblock#Directive Summary]] apply. When passed as URI query parameters:
- Both `blockPath` and `templatePath` work — they're aliases for the same directive
- The `location` and `destHeader` parameters control placement. See [[JSON Directives#Location Values]] and [[JSON Directives#destHeader Matching]] for the full rules.
- Field data keys supply values for the block template's fields

| Parameter | Required | URI Notes |
|-----------|----------|-----------|
| `cmd` | Yes | Always `insertblock` |
| `blockPath` | Yes | URL-encode the vault-relative path to the block template. `templatePath` also works. |
| `existingFilePath` | Conditional | URL-encode the vault-relative path. Required for automated use. If omitted, the block inserts at the cursor position in the active file (editor mode). |
| `destHeader` | Conditional | Required when `location` is `header-top` or `header-bottom`. URL-encode if the header text contains spaces. |
| `location` | No | `file-top`, `file-bottom`, `header-top`, `header-bottom`, or a line number. See [[JSON Directives#Location Values]]. |
| `prompt` | No | `none`, `remaining`, or `all` |
| `finalize` | No | `true` or `false` |
| Field data | No | Any additional `key=value` pairs become template field data |

> [!NOTE]
> When `existingFilePath` and `location` are both omitted, the plugin falls through to **editor mode** — it inserts the block at the cursor position in the currently active file. This is a valid use case for URI-triggered insertion when you want the user to control placement: click the URI while editing a file, and the block appears at the cursor. However, for automated or batch workflows, always specify `existingFilePath` and `location` explicitly — there is no guarantee about which file is active or where the cursor sits.

## Examples

### Insert at a Header — Churchill's War Room
The war room briefing document needs a new section under "Operations." Churchill doesn't do things halfway.

```
obsidian://z2k-templates?cmd=insertblock&blockPath=Templates%2FBlocks%2FOperation%20Brief.block&existingFilePath=War%20Room%2FDaily%20Briefing.md&destHeader=Operations&location=header-bottom&prompt=none&operationName=Overlord&status=Planning&commander=Eisenhower&note=We%20shall%20fight%20on%20the%20beaches
```

The block is inserted at the bottom of the "Operations" section. `operationName`, `status`, `commander`, and `note` fill the block template's fields.

### Insert at a Specific Header Level
If the target file has multiple headers with the same text at different levels, use the `#` prefix to target a specific level:

```
obsidian://z2k-templates?cmd=insertblock&blockPath=Templates%2FBlocks%2FNote.block&existingFilePath=Notes%2FJournal.md&destHeader=%23%23%23%20Morning&location=header-top
```

The `destHeader` value decodes to `### Morning` — matching only H3 headers. An `## Morning` or `# Morning` header would not match. See [[JSON Directives#destHeader Matching]] for the full matching rules.

### Insert at the Top of a File — Warhol's Exhibition Catalog
Every piece in the exhibition gets a status banner at the top of its page. The automation runs nightly.

```
obsidian://z2k-templates?cmd=insertblock&blockPath=Templates%2FBlocks%2FExhibition%20Banner.block&existingFilePath=Exhibitions%2FCampbell%27s%20Soup%20Cans.md&location=file-top&prompt=none&finalize=true&status=On%20Display&gallery=MoMA&lastVerified=2024-01-15
```

The block is inserted after the file's frontmatter, before any existing content.

### Insert at a Line Number
For surgical precision — insert at a specific line:

```
obsidian://z2k-templates?cmd=insertblock&blockPath=Templates%2FBlocks%2FDivider.block&existingFilePath=Notes%2FLong%20Note.md&location=42
```

The block is inserted at line 42 of the file. No destHeader needed.

### Princess Bride — Adding Miracle Workers
The roster of miracle workers grows. Each new entry is a block appended under the "Personnel" section.

```
obsidian://z2k-templates?cmd=insertblock&blockPath=Templates%2FBlocks%2FPersonnel%20Entry.block&existingFilePath=Guilder%2FMiracle%20Max%27s%20Shop.md&destHeader=Personnel&location=header-bottom&prompt=none&finalize=true&name=Miracle%20Max&title=Miracle%20Worker%20(Mostly%20Retired)&specialty=Resurrection%20(with%20limitations)&notable_client=Westley&status=He%27s%20only%20MOSTLY%20dead
```

Each invocation appends another personnel entry at the bottom of the section. Run it again for Valerie:

```
obsidian://z2k-templates?cmd=insertblock&blockPath=Templates%2FBlocks%2FPersonnel%20Entry.block&existingFilePath=Guilder%2FMiracle%20Max%27s%20Shop.md&destHeader=Personnel&location=header-bottom&prompt=none&finalize=true&name=Valerie&title=Miracle%20Worker%27s%20Wife&specialty=Motivation%20%26%20Quality%20Assurance&notable_client=Also%20Westley&status=Have%20fun%20storming%20the%20castle
```

This pattern — repeated `insertblock` calls targeting `header-bottom` on the same section — is how you build up a list or log over time.

### Editor Mode — Insert at the Cursor
When both `existingFilePath` and `location` are omitted, the block inserts at the cursor position in whatever file you're currently editing. This turns a URI into a quick-insert button — click it while writing, and the block appears right where you are.

```
obsidian://z2k-templates?cmd=insertblock&blockPath=Templates%2FBlocks%2FQuote.block&prompt=remaining
```

This is useful for browser bookmarks or toolbar buttons that insert a frequently used block — a callout, a table scaffold, a code snippet — at the current editing position. The user controls placement by positioning their cursor before clicking.

### With templateJsonData — Dining Philosophers Seating Chart
The seating algorithm has produced its results. Rather than encoding a dozen fields as individual parameters, pass them as a single JSON payload:

```
obsidian://z2k-templates?cmd=insertblock&blockPath=Templates%2FBlocks%2FSeating%20Assignment.block&existingFilePath=Events%2FPhilosophers%20Dinner.md&destHeader=Seating%20Chart&location=header-bottom&prompt=none&finalize=true&templateJsonData=%7B%22philosopher%22%3A%22Kant%22%2C%22seat%22%3A3%2C%22leftNeighbor%22%3A%22Hume%22%2C%22rightNeighbor%22%3A%22Descartes%22%2C%22dietaryRestriction%22%3A%22Categorical%20imperative%20against%20dessert%20before%20dinner%22%7D
```

See [[templateJsonData]] for details on passing field data as a separate object.

> [!DANGER] Internal Notes
> - When `existingFilePath` is omitted in a URI context, the plugin falls through to editor mode (insert at cursor). This is fragile for URI use since the user may not have the expected file open. Consider whether the plugin should throw an error when `existingFilePath` is missing in a URI context rather than silently falling through. Currently the code does not distinguish between URI and interactive invocation at this point.
> - The block template's YAML frontmatter is merged into the existing file's frontmatter using a "last wins" strategy. This could silently overwrite existing YAML properties. Worth a cross-reference to YAML merging behavior documentation if/when it exists.
> - Confirm behavior when `location` is a line number that exceeds the file's total lines. The JSON Command - insertblock page notes this as an open question.
> - The `destHeader` parameter requires URL-encoding when the header text contains spaces or the `#` prefix. The `#` character encodes to `%23`. This is easy to get wrong — `### Morning` becomes `%23%23%23%20Morning`. Consider noting this more prominently, or providing a helper/example in the how-to guide.
