---
sidebar_position: 30
aliases:
- scan frequency
- queue scan frequency
- command queue frequency
---
# Scan Frequency
How often the plugin checks the [[Queue Folder]] for new command files.

- **Default:** `60s`
- **Accepts:** A duration value (see [[Duration Format]]), or blank
- **Minimum:** `5s`

Leave blank to disable automatic scanning – commands will only be processed when triggered manually via the Command Palette. Set a duration to enable automatic background processing.

This setting is only visible when [[Enable Command Queue]] is on.

## Time Units
This setting uses the standard [[Duration Format]] (a number followed by a unit suffix, e.g. `30s`, `5m`). See [[Duration Format]] for the full list of valid units.

## Value Range
- **Minimum:** `5s` – The plugin enforces this lower bound; any value below 5 seconds is rejected with an error.
- **Maximum:** No enforced upper limit.
- **Practical range:** `30s` to `1w`. 

A frequency shorter than 30 seconds creates constant disk activity with little benefit for most workflows. At the other extreme, setting this to `1w` or longer means the queue processes so rarely that you may forget it is enabled – and return to find a large backlog of commands executing all at once. A frequency in the range of one minute to one hour covers the vast majority of automation use cases.

> [!DANGER] NOTES
> - See [GitHub issue #154](https://github.com/z2k-studios/z2k-plugin-templates/issues/154) for a proposal to change the default.
