---
sidebar_position: 20
aliases:
- error log level
- log level
- logging level
---
# Error Log Level
The minimum severity level a message must have to be written to the log. Each level includes all levels above it.

- **Default:** `warn`
- **Type:** Dropdown

| Level       | What Gets Logged                                                                 |
| ----------- | -------------------------------------------------------------------------------- |
| **None**    | Logging disabled – nothing is written                                            |
| **Error**   | Only errors – template processing failures, file I/O errors                      |
| **Warning** | Errors + warnings – missing fields, fallback values used, deprecated usage       |
| **Info**    | Errors + warnings + informational – template rendering events, command execution |
| **Debug**   | Everything – full diagnostic output including internal state                     |

Start with `warn` (the default) for normal use. Switch to `debug` when troubleshooting a specific template or command queue issue, then set it back – debug-level logging can produce a large volume of output.

> [!DANGER] INTERNAL NOTES
> - Verify that the log level descriptions above match the actual log statements in the source code. The descriptions are inferred from the setting's own description text and standard logging conventions. ==In particular, check to make sure it is successive - i.e. Warning covers warnings + Errors==
