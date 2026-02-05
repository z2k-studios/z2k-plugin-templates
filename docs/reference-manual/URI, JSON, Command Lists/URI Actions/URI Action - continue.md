---
sidebar_position: 30
sidebar_class_name: z2k-code
aliases:
- URI Action - continue
- URI continue
---
# URI Action: continue
The `continue` action fills remaining fields in an existing note via URI. It is the URI equivalent of the [[JSON Command - continue|JSON `continue` command]] — pick up where a previous instantiation left off, supplying data for any unresolved `{{fields}}`.

This page covers URI-specific considerations and examples. For the full directive reference, see [[JSON Command - continue]].

## Quick Reference
A minimal URI to continue filling an existing note:

```
obsidian://z2k-templates?cmd=continue&existingFilePath=Notes%2FMeeting%202024-01-15.md
```

The user will be prompted for any remaining unresolved fields in the note.

## Parameters
All parameters from [[JSON Command - continue#Directive Summary]] apply. When passed as URI query parameters:
- The `existingFilePath` must point to a note that was originally created from a Z2K template
- Field data keys supply values for unresolved fields in the note
- All values arrive as strings — see [[JSON Type Conversion]] for how the plugin handles conversion

| Parameter | Required | URI Notes |
|-----------|----------|-----------|
| `cmd` | Yes | Always `continue` |
| `existingFilePath` | Yes | URL-encode the vault-relative path to the existing note |
| `prompt` | No | `none`, `remaining`, or `all` |
| `finalize` | No | `true` or `false` |
| Field data | No | Any additional `key=value` pairs fill unresolved fields |

> [!NOTE]
> The `templatePath` directive is not used — the plugin determines the original template from the existing file's metadata. You don't need to (and shouldn't) specify it again.

## Examples

### Supply Missing Fields — The Dining Philosophers
The philosophy department created a note for tonight's dinner, but left the hard questions for later. Now the answers are in.

```
obsidian://z2k-templates?cmd=continue&existingFilePath=Events%2FPhilosophers%20Dinner.md&prompt=none&seating_paradox=Resolved%20%E2%80%93%20Descartes%20gets%20two%20forks&dessert=Existential%20cr%C3%A8me%20br%C3%BBl%C3%A9e&topic=Whether%20a%20dining%20philosopher%20who%20never%20eats%20can%20be%20said%20to%20dine
```

The fields `seating_paradox`, `dessert`, and `topic` are filled in. No prompting occurs.

### Prompt for the Remainder — Emerson's Essay Draft
Emerson started a draft but left several fields blank. Supply what you know and let him fill in the rest at the lectern.

```
obsidian://z2k-templates?cmd=continue&existingFilePath=Essays%2FSelf-Reliance%20Draft.md&prompt=remaining&thesis=Trust%20thyself&epigraph=Ne%20te%20quaesiveris%20extra
```

`thesis` and `epigraph` are pre-filled and won't be prompted. Any other unresolved fields — `audience`, `publication_date`, `dedication` — are prompted interactively.

### Finalize Only — No New Data
Sometimes a note just needs to be finalized — all remaining fields resolved to their fallback values, no new data supplied.

```
obsidian://z2k-templates?cmd=continue&existingFilePath=Notes%2FDraft%20Note.md&prompt=none&finalize=true
```

This is the URI equivalent of saying "I'm done — close it out." Every unresolved field gets its default value, and the note is finalized.

### Staged Automation — Warhol's Screen Tests
Warhol's Factory runs on process. The first pass creates a Screen Test note with basic info. Hours later — after the camera has run and the footage is reviewed — a second URI fills in the results:

**Pass 1** — create the note (see [[URI Action - new]]):
```
obsidian://z2k-templates?cmd=new&templatePath=Templates%2FScreen%20Test.md&prompt=none&fileTitle=Screen%20Test%20%E2%80%93%20Edie%20Sedgwick&subject=Edie%20Sedgwick&date=1965-03-15&camera=Bolex
```

**Pass 2** — fill in the results via `continue`:
```
obsidian://z2k-templates?cmd=continue&existingFilePath=Screen%20Tests%2FScreen%20Test%20%E2%80%93%20Edie%20Sedgwick.md&prompt=none&finalize=true&duration=4%20minutes%2C%2033%20seconds&film_stock=16mm%20black%20and%20white&notes=Subject%20maintained%20eye%20contact%20for%20the%20full%20duration.%20Remarkable.
```

This two-pass pattern — create with partial data, continue with the rest — is the core use case for [[JSON Command - continue#When to Use|deferred field resolution]].

> [!DANGER] Internal Notes
> - The plugin determines the original template from the existing file's frontmatter metadata (likely `z2k_template_name` or `z2k_template_type`). Confirm the exact property name and what happens if it's missing — does the command fail gracefully or throw?
> - The `continue` command was not listed on the original URI Actions index page. It was added after confirming that the command works identically via URI transport — the code at lines 1427-1439 of main.tsx has no transport-specific checks.
> - Confirm whether `continue` via URI can target a file that is currently open in the editor. Does it modify the in-memory buffer, or does it write to disk and require a reload?
