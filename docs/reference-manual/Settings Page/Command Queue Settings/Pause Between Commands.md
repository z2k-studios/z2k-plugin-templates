---
sidebar_position: 40
aliases:
- pause between commands
- command queue pause
- inter-command delay
---
# Pause Between Commands
An optional delay inserted between processing each command in a batch.

- **Default:** Empty (no pause)
- **Accepts:** A duration value (see [[Duration Format]]), or blank

Leave blank for no pause – commands process as fast as possible. Set a duration when commands create files that subsequent commands depend on, or to avoid overwhelming Obsidian with rapid sequential file operations.

This setting is only visible when [[Enable Command Queue]] is on.

## Time Units
This setting uses the standard [[Duration Format]] (a number followed by a unit suffix, e.g. `500ms`, `1s`). See [[Duration Format]] for the full list of valid units.

## Disabling the Pause
Leave the field blank to disable the inter-command pause entirely. Alternatively, `0s` is also accepted and is functionally equivalent to blank – both result in no delay.

## Value Range
- **Minimum:** None enforced. Blank or `0s` = no pause.
- **Maximum:** No enforced upper limit.
- **Practical range:** `100ms` to `30s`

Very short pauses (`100ms`–`500ms`) are enough to give Obsidian's file indexer breathing room between commands. Pauses longer than a few seconds will make large batches noticeably slow without additional benefit. Values above `30s` are rarely appropriate – if commands need that much time between them, consider whether they should be batched at all.

> [!DANGER] NOTES
> - See [GitHub issue #154](https://github.com/z2k-studios/z2k-plugin-templates/issues/154) for a proposal to change the default to `1s`.
