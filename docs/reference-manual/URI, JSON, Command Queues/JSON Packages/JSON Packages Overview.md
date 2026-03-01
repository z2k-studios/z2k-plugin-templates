---
sidebar_position: 10
aliases:
  - JSON Package
  - JSON Packages Overview
  - Z2K Templates JSON Package
---
# Z2K Templates JSON Package Overview
A Z2K Templates JSON Package (or just referred to as "JSON Package") is a structured data object that tells Z2K Templates what to do. It contains **directives** that control the command and **field data** that supplies values for the template's fields. 

Most external integration points with Z2K Templates — whether a URI link, a queued command file, or an automation script — can use JSON packages to communicate with the Z2K Templates Plugin.

## Contents
- [[#What is a Z2K Templates JSON Package?]]
- [[#Where Z2K Templates JSON Packages Are Used]]
- [[#What Happens Next]]

## What is a Z2K Templates JSON Package?
First, we will assume you have read at least a good primer for what JSON objects are - [here](https://stackoverflow.blog/2022/06/02/a-beginners-guide-to-json-the-data-format-for-the-internet/) is a good one for instance.

A Z2K Templates JSON Package (or just "JSON Package" henceforth) is a single JSON object whose keys fall into two categories:
- **Directive keys** — recognized parameters like `cmd`, `templatePath`, `prompt`, and `finalize` that control how the command executes
- **Field data keys** — everything else, treated as template field names mapped to their values

The plugin separates these automatically. Any key that matches a known directive is pulled out; the rest become field data passed to the template engine.

```json
{
  "cmd": "new",
  "templatePath": "Templates/Meeting Notes.md",
  "prompt": "remaining",
  "attendees": "Alice, Bob",
  "meetingType": "standup"
}
```

In this example, `cmd`, `templatePath`, and `prompt` are directives. `attendees` and `meetingType` are field data — they'll fill in `{{attendees}}` and `{{meetingType}}` in the template.

## Where Z2K Templates JSON Packages Are Used
JSON Packages are the shared language across three integration points:
- **[[URI Actions]]** — A JSON Package is encoded as URL query parameters in an Obsidian URI. Each key-value pair becomes a query param. Because URIs are flat strings, all values arrive as text and are converted to their appropriate types based on the template's field definitions. See [[JSON Type Conversion]] for details. URIs also support the [[URI Command - fromJson|fromJson command]], which wraps an entire JSON Package as a single string parameter for cases where encoding nested data as individual query params would be unwieldy.
- **[[Command Queues]]** — A JSON Package is written directly as a `.json` file (one command) or as a line in a `.jsonl` file (one command per line). Values preserve their native JSON types — numbers stay numbers, booleans stay booleans. The [[Command Queue]] processes these files automatically.

## What Happens Next
Once a Z2K Templates JSON Package reaches the plugin — whether through a URI, a command file, or the `fromJson` command — the same processing pipeline handles it:
1. Directive keys are separated from field data keys
2. `fieldData` (if present) is parsed and merged with top-level field data
3. The specified command is executed with the resolved directives and field values
4. Field values are applied to the template, with [[JSON Type Conversion]] rules determining how values are interpreted

The format of the JSON Package is the same regardless of how it arrives. What differs is the *transport* — and each transport has its own page covering the specifics.

> [!DANGER] INTERNAL NOTES
> - There is currently no UI-based command for importing a JSON file into a template (e.g., a command palette action to select a `.json` file and apply it). This would be a useful addition — file a feature request.
> - Verify that the Apple Shortcuts how-to guide title matches: `[[How-to Pass Create Files from Templates in Apple Shortcuts]]`
