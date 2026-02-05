---
sidebar_position: 20
sidebar_class_name: z2k-code
aliases:
- URI Action - new
- URI new
---
# URI Action: new
The `new` action creates a note from a template via URI. It is the URI equivalent of the [[JSON Command - new|JSON `new` command]] — same directives, same behavior, different transport.

This page covers URI-specific considerations and examples. For the full directive reference, see [[JSON Command - new]].

## Quick Reference
A minimal URI to create a note from a template:

```
obsidian://z2k-templates?cmd=new&templatePath=Templates%2FMeeting%20Notes.md
```

The user will be prompted for field values and a title interactively — the same behavior as running the template from the command palette.

## Parameters
All parameters from [[JSON Command - new#Directive Summary]] apply. When passed as URI query parameters:
- All values are strings — the plugin converts them based on [[JSON Type Conversion|field type declarations]]
- Vault-relative paths must be URL-encoded (spaces → `%20`, slashes → `%2F`)
- Field data keys are passed as additional query parameters alongside directives

| Parameter | Required | URI Notes |
|-----------|----------|-----------|
| `cmd` | Yes | Always `new` |
| `templatePath` | Yes | URL-encode the vault-relative path |
| `destDir` | No | URL-encode if the path contains spaces |
| `prompt` | No | `none`, `remaining`, or `all` |
| `finalize` | No | `true` or `false` |
| `fileTitle` | No | URL-encode — determines the output filename |
| Field data | No | Any additional `key=value` pairs become template field data |

## Examples

### Minimal — Just a Template
```
obsidian://z2k-templates?cmd=new&templatePath=Templates%2FDaily%20Note.md
```

Opens the Daily Note template interactively. The user picks field values and enters a title — indistinguishable from creating the note through the UI.

### The Princess Bride — Fully Automated
Vizzini needs dossiers on his crew, and he needs them now. No prompts, no delays.

```
obsidian://z2k-templates?cmd=new&templatePath=Templates%2FCharacter%20Dossier.md&prompt=none&finalize=true&fileTitle=Inigo%20Montoya&characterName=Inigo%20Montoya&role=Swordsman&specialty=Left-handed%20fencing&motivation=Avenge%20father&catchphrase=Hello.%20My%20name%20is%20Inigo%20Montoya.%20You%20killed%20my%20father.%20Prepare%20to%20die.
```

All fields are supplied, `prompt` is `none`, and `finalize` is `true`. The note appears fully formed — no human interaction required.

### Transcendentalist Field Notes — Prompt for the Rest
Thoreau has the essentials but wants to fill in the rest at the pond.

```
obsidian://z2k-templates?cmd=new&templatePath=Templates%2FField%20Notes.md&prompt=remaining&fileTitle=Walden%20Pond%20Observations&observer=Henry%20David%20Thoreau&location=Walden%20Pond&date=1845-07-04
```

`observer`, `location`, and `date` are pre-filled. Any other fields in the template — `weather`, `species_observed`, `reflections` — will be prompted interactively. Thoreau can deliberate in his own time.

### Custom Output Folder
```
obsidian://z2k-templates?cmd=new&templatePath=Templates%2FContact%20Card.md&destDir=People%2FPhilosophers&prompt=none&fileTitle=Socrates&name=Socrates&role=Philosopher&method=Socratic%20questioning&knownFor=Knowing%20that%20he%20knows%20nothing
```

The note is created in `People/Philosophers/` instead of the template's default folder. The folder is created automatically if it doesn't exist.

### With templateJsonData
When field data gets complex, pass it as a single JSON parameter instead of encoding every field individually:

```
obsidian://z2k-templates?cmd=new&templatePath=Templates%2FDinner%20Party.md&prompt=none&finalize=true&fileTitle=Warhol%20Factory%20Dinner&templateJsonData=%7B%22host%22%3A%22Andy%20Warhol%22%2C%22venue%22%3A%22The%20Factory%22%2C%22guests%22%3A%22Edie%20Sedgwick%2C%20Lou%20Reed%2C%20Nico%22%2C%22menu%22%3A%22Campbell%27s%20Soup%20(obviously)%22%2C%22dress_code%22%3A%22Silver%22%7D
```

The `templateJsonData` value decodes to:
```json
{"host":"Andy Warhol","venue":"The Factory","guests":"Edie Sedgwick, Lou Reed, Nico","menu":"Campbell's Soup (obviously)","dress_code":"Silver"}
```

This is more practical for automation tools that can URL-encode a single JSON string rather than encoding each field separately. See [[templateJsonData]] for details.

### Using the json Command
For maximum control, wrap the entire command as a JSON string using the [[json Command]]:

```
obsidian://z2k-templates?cmd=json&json=%7B%22cmd%22%3A%22new%22%2C%22templatePath%22%3A%22Templates%2FQuote.md%22%2C%22prompt%22%3A%22none%22%2C%22finalize%22%3Atrue%2C%22fileTitle%22%3A%22Churchill%20on%20Persistence%22%2C%22speaker%22%3A%22Winston%20Churchill%22%2C%22quote%22%3A%22If%20you%27re%20going%20through%20hell%2C%20keep%20going.%22%2C%22year%22%3A1940%7D
```

The `json` parameter decodes to:
```json
{
  "cmd": "new",
  "templatePath": "Templates/Quote.md",
  "prompt": "none",
  "finalize": true,
  "fileTitle": "Churchill on Persistence",
  "speaker": "Winston Churchill",
  "quote": "If you're going through hell, keep going.",
  "year": 1940
}
```

The key advantage: `year` arrives as the number `1940`, not the string `"1940"`. The `json` command preserves native JSON types. See [[JSON Type Conversion]] for why this matters.

## Shell Script Example
A reusable shell function for creating notes — useful for cron jobs, Raycast scripts, or Alfred workflows:

```bash
#!/bin/bash
# Create a meeting note with pre-filled attendees
TEMPLATE="Templates%2FMeeting%20Notes.md"
TITLE=$(python3 -c "import urllib.parse; print(urllib.parse.quote('Standup $(date +%Y-%m-%d)'))")
ATTENDEES=$(python3 -c "import urllib.parse; print(urllib.parse.quote('Alice, Bob, Charlie'))")

open "obsidian://z2k-templates?cmd=new&templatePath=${TEMPLATE}&prompt=remaining&fileTitle=${TITLE}&attendees=${ATTENDEES}&meetingType=standup"
```

The `open` command (macOS) launches the URI. On Windows, use `start`; on Linux, use `xdg-open`.

> [!DANGER] Internal Notes
> - The examples above use heavy percent-encoding for readability. In practice, automation tools handle encoding automatically — users rarely construct these strings by hand.
> - Confirm the behavior when `fileTitle` is not provided and `prompt` is `none`. The JSON Command - new page notes this as an open question (code path through `createCard` → title resolution). The same uncertainty applies to URI invocation.
> - The `vault` parameter is not explicitly handled by the plugin, but Obsidian may support it natively at the protocol level (as it does for the Advanced URI plugin). If so, a URI like `obsidian://z2k-templates?vault=MyVault&cmd=new&...` would work without any plugin changes. Needs testing.
