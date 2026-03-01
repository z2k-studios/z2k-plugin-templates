---
sidebar_position: 20
sidebar_label: "continue"
sidebar_class_name: z2k-code
aliases:
- URI Command - continue
- URI continue
---
# URI Command: continue
The URI `continue` command fills remaining fields in an existing note – pick up where a previous creation left off, supplying data for any unresolved `{{fields}}`. This is intended for content files in the [[WIP Stage]]. I

## Quick Reference
A minimal URI to continue filling an existing note:

```
obsidian://z2k-templates?vault=MyVault&cmd=continue&existingFilePath=Notes%2FMeeting.md
```

The user is prompted for any remaining unresolved fields in the note.

## JSON Consistency
The URI `continue` command is equivalent to the [[JSON Command - continue|JSON `continue` command]] – same directives, same behavior, different transport. For the full command reference, see [[JSON Command - continue]].

## Supported Directives
The table below summarizes the [[URI Directives]] relevant to the `continue` command.

| Directive          | Required | Notes                                        |
| ------------------ | -------- | -------------------------------------------- |
| `existingFilePath` | Yes      | Vault-relative path to the existing note     |
| `prompt`           | No       | `none`, `remaining`, or `all`                |
| `finalize`         | No       | `true` or `false`                            |

> [!NOTE]
> Because the `continue` command works on a [[WIP Stage|WIP Content File]], the command will ignore anything passed in via the `templatePath` directive. The file being modified is a content file and will not be using a template (which presumably has already been done). 

## Field Data
All remaining parameters that do not match a [[URI Directives|URI Directive]] keyword are treated as field data. As such, the plugin fills the matching `{{fields}}` in the WIP content file with the data value provided. See [[URI Field Data]].

If any of the fields in the [[URI Field Data]] have already been previously filled in, then the new values will be ignored. If there are fields that are still remaining besides those list in the URI Field Data, then they will be left as is (unless you use the `finalize=true` directive, in which case they will be removed.)

All values arrive as strings. The plugin converts them based on [[URI Type Handling|field type declarations]].

## Examples

### Example - Supply Missing Fields
*Task:* Fill specific unresolved fields in a WIP note, suppressing the prompt UI.

*Pre-encoded:*
```
vault            = MyVault
cmd              = continue
existingFilePath = Events/Dinner.md
prompt           = none
seating          = Resolved
dessert          = Tiramisu
topic            = Epistemology
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=continue&existingFilePath=Events%2FDinner.md&prompt=none&seating=Resolved&dessert=Tiramisu&topic=Epistemology
```

This continues filling the note `Events/Dinner.md`. The fields `{{seating}}`, `{{dessert}}`, and `{{topic}}` are replaced with the provided values. With `prompt=none`, no interactive prompt appears – only the supplied fields are filled. 

### Example - Prompt for the Remainder
*Task:* Supply some values and let the user fill in the rest interactively.

*Pre-encoded:*
```
vault            = MyVault
cmd              = continue
existingFilePath = Essays/Draft.md
prompt           = remaining
thesis           = Self-reliance
epigraph         = Ne te quaesiveris extra
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=continue&existingFilePath=Essays%2FDraft.md&prompt=remaining&thesis=Self-reliance&epigraph=Ne%20te%20quaesiveris%20extra
```

`{{thesis}}` and `{{epigraph}}` are pre-filled and won't be prompted. Any other unresolved fields – e.g. `{{audience}}`, `{{date}}`, `{{dedication}}` – are prompted interactively.

### Example - Finalize Only
*Task:* Finalize a note without supplying any new data. All remaining fields resolve to their fallback values.

*Pre-encoded:*
```
vault            = MyVault
cmd              = continue
existingFilePath = Notes/Draft.md
prompt           = none
finalize         = true
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=continue&existingFilePath=Notes%2FDraft.md&prompt=none&finalize=true
```

Every unresolved field gets its default value, and the note is finalized. No interaction required.

### Example - Staged Automation – Two-Pass Creation
*Task:* Create a note with partial data, then fill in the rest later. This two-pass pattern is the core use case for [[JSON Command - continue#When to Use|deferred field resolution]].

**Pass 1** – create the note (see [[URI Command - new]]):
```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FScreen%20Test.md&prompt=none&fileTitle=Edie&subject=Edie&date=1965-03-15&camera=Bolex
```

**Pass 2** – fill in the results via `continue`:
```
obsidian://z2k-templates?vault=MyVault&cmd=continue&existingFilePath=Screen%20Tests%2FEdie.md&prompt=none&finalize=true&duration=4m33s&stock=16mm&notes=Remarkable
```

The first URI creates the note with basic info. The second fills in the remaining fields after the work is done.

### Example - Advanced - With JSON Field Data
*Task:* Bundle many fields into a single `fieldData` parameter instead of encoding each field individually. See [[URIs with JSON Data]] for details.

*Pre-encoded:*
```
vault            = MyVault
cmd              = continue
existingFilePath = Events/Dinner.md
prompt           = none
finalize         = true
fieldData        = {"seating":"Resolved","dessert":"Tiramisu","topic":"Epistemology","wine":"Chianti"}
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=continue&existingFilePath=Events%2FDinner.md&prompt=none&finalize=true&fieldData=%7B%22seating%22%3A%22Resolved%22%2C%22dessert%22%3A%22Tiramisu%22%2C%22topic%22%3A%22Epistemology%22%2C%22wine%22%3A%22Chianti%22%7D
```

The `fieldData` value is a URL-encoded JSON object. Once decoded, its keys (`{{seating}}`, `{{dessert}}`, `{{topic}}`, `{{wine}}`) fill the corresponding template fields.

> [!DANGER] INTERNAL NOTES
> - The plugin determines the original template from the existing file's frontmatter metadata (likely `z2k_template_name` or `z2k_template_type`). Confirm the exact property name and what happens if it's missing – does the command fail gracefully or throw?
> - Confirm whether `continue` via URI can target a file that is currently open in the editor. Does it modify the in-memory buffer, or does it write to disk and require a reload?
