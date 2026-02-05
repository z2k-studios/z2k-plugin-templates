---
aliases:
- URI
- URI Action
- URI Actions
- URI Call
sidebar_position: 1
sidebar_folder_position: 20
---
# URI Actions
URI Actions let you trigger Z2K Templates commands from outside Obsidian – through links, browser bookmarks, shell scripts, or automation tools like Apple Shortcuts. Each URI encodes a command, a set of directives, and optional field data into a single clickable link.

If you're unfamiliar with URIs, [MDN's URI reference](https://developer.mozilla.org/en-US/docs/Web/URI) provides a clear introduction to how they work in general. In short, a URI is a structured string that tells your operating system what application to open and what to do – similar to how a web URL tells your browser which page to load. 

For Z2K Templates, this means opening Obsidian, connecting with the Z2K Templates, performing a specific command, providing directives for how to perform the command, and passing field data to be used. 

## Contents
For more information, please see:
1. [[URI Syntax]] – The structure of a Z2K Templates URI and how its parts fit together
2. [[URI Commands]] – The commands available via URI (`new`, `continue`, `insertblock`, `fromJson`)
3. [[URI Directives]] – Parameters that control command behavior
4. [[URI Field Data]] – How to supply values for template fields
5. [[URI Encoding]] – How special characters are handled in URI values
6. [[URIs with JSON Data]] – Advanced methods for passing field data as JSON
7. [[URI Type Handling]] – How string values from URIs are converted to typed data
8. [[Building URIs]] – Practical guidance for constructing URIs from shell scripts, Apple Shortcuts, and bookmarks

