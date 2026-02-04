---
aliases:
- URI
- URI Action
- URI Call
sidebar_position: 1
sidebar_folder_position: 20
---
# URI Actions
URI Actions let you trigger Z2K Templates commands from outside Obsidian — through links, browser bookmarks, shell scripts, or automation tools like Apple Shortcuts. Each URI encodes a command and its parameters as URL query params, which the plugin receives, decodes, and executes. The data format for these parameters follows the [[JSON Packages]] specification.

## Contents
For more information, please see:
1. [[URI Syntax]] — The structure of a Z2K Templates URI and how parameters are encoded
2. [[URI Action - new]] — Trigger the creation of a new note from a template
3. [[URI Action - insertBlock]] — Insert a block template into an existing note
4. [[json Command]] — The `json` meta-command for passing a full JSON Package as a single URI parameter
