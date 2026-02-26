---
sidebar_position: 20
aliases:
- JSON Structure
- JSON Package Structure
---
# Structure of a Z2K Templates JSON Package
A Z2K Templates JSON Package is a simple JSON object.  The package may be provided as a `.json` file or as a string of characters.  The JSON object contains directive keys that control the operation and field data for the template.

## JSON Package Structure
At a high level, a Z2K Templates JSON Package has this shape:

```json
{
  "cmd": "<command>",
  "<directive>": "<value>",
  "<fieldName>": "<fieldValue>",
  "templateJsonData": { "<fieldName>": "<fieldValue>" }
}
```

- `cmd` is always required — it tells the plugin which operation to perform
	- See [[JSON Commands]] for details on commands
- Directive keys control execution behavior (prompting, finalization, output location)
	- See [[JSON Directives]] for details on known directives
- Field Data:
	- See [[JSON Field Data]] for details on how to add field data into a JSON Package
	- `templateJsonData` optionally nests field data in a separate object, as discussed in the next section. 


## Key Normalization
Directive keys are matched with flexible normalization — the plugin strips non-alphanumeric characters and compares case-insensitively. All of these resolve to `templatePath`:
- `templatePath`
- `template-path`
- `template_path`
- `TemplatePath`

Field data keys are *not* normalized — they preserve their original casing and format, since they must match the template's field names exactly.

## Examples
For detailed, command-specific examples, see the [[JSON Commands]] section. Below are a few quick reference examples.

### Create a New Note
```json
{
  "cmd": "new",
  "templatePath": "Templates/Meeting Notes.md",
  "prompt": "none",
  "finalize": true,
  "fileTitle": "Standup 2024-01-15",
  "attendees": "Alice, Bob, Charlie",
  "meetingType": "standup",
  "duration": 30
}
```

### Continue Filling a Note
```json
{
  "cmd": "continue",
  "existingFilePath": "Notes/Meeting 2024-01-15.md",
  "prompt": "remaining",
  "actionItems": "Review Q4 metrics"
}
```

### Insert a Block Template
```json
{
  "cmd": "insertblock",
  "blockPath": "Templates/Blocks/Task List.block",
  "existingFilePath": "Notes/Project Plan.md",
  "destHeader": "Tasks",
  "taskList": "- Birth\n- School\n- Work\n- Death",
  "location": "header-bottom",
  "projectName": "Z2K v2"
}
```

Note: the "\n" will be converted to newlines automatically. 
### With Field Data in a Separate File
```json
{
  "cmd": "new",
  "templatePath": "Templates/Contact Card.md",
  "prompt": "none",
  "templateJsonData": "Data/contacts/new-contact.json"
}
```

Here, `templateJsonData` is a vault-relative file path — the plugin reads the file and parses its contents as field data. See [[templateJsonData]] for the other input forms (inline JSON object, inline JSON string).

> [!DANGER] Internal Notes
> - The `templateJsonData64` and `json64` keys are declared in the `CommandParams` interface and included in the `knownKeys` list, but no decoding logic exists in `processCommand()`. They are documented as supported but are not yet implemented.
> - There is currently no way to pass an inline block template body via `insertblock` — it always requires a `templatePath` or `blockPath` pointing to an existing file. An inline block content parameter would be a useful addition. File as a feature request.
> - Confirm whether `destDir` creates the folder if it doesn't exist — the code calls `this.createFolder(cps.destDir)`, which suggests it does. Documented as auto-creating for now.
> - The key normalization behavior (stripping non-alphanumeric, case-insensitive matching) applies to all known keys equally, but the docs comment at line 1236 says to just document `templatePath` for simplicity. We've documented the normalization behavior as a general section since it applies uniformly.
> - The `destHeader` regex uses `escapeRegExp` on the header text and the `"mi"` flag (multiline, case-insensitive). Confirm edge cases: what happens with headers containing special regex characters in their text? `escapeRegExp` should handle this, but worth testing.
> - Confirm the exact default naming behavior when `fileTitle` is not provided and `prompt` is `"none"`. The code path through `createCard` eventually leads to `generateUniqueFilePath` — does it use the template name as a fallback?
