---
sidebar_position: 40
sidebar_label: "fromJson"
sidebar_class_name: z2k-code
aliases:
- URI Command - fromJson
- fromJson command
- fromJson cmd
- URI Command - json
- json command
---
# URI Command: fromJson
The URI `fromJson` command is a meta-command – instead of executing a template operation directly, it unwraps a JSON-encoded string into a full [[JSON Packages Overview|JSON Package]] and performs the action specified within. The entire command, including its directives and field data, travels as a single `jsonData` parameter.

> [!NOTE] Advanced Feature
> This is an advanced feature. For most use cases, passing directives and field data as individual URI parameters is simpler and more readable. The `fromJson` command is designed for automation tools that generate commands programmatically.

For a detailed discussion of passing JSON data through URIs, see [[URIs with JSON Data]].

## Quick Reference
```
obsidian://z2k-templates?vault=MyVault&cmd=fromJson&jsonData=%7B%22cmd%22%3A%22new%22%2C%22templatePath%22%3A%22Templates%2FNote.md%22%7D
```

## JSON Consistency
The URI `fromJson` command executes any valid [[JSON Packages Overview|JSON Package]]. The JSON Package itself contains a `cmd` key that specifies which command to run (`new`, `continue`, or `insertblock`).

## How It Works
When the plugin encounters `cmd=fromJson`, it:
1. Reads the `jsonData` parameter (a JSON-encoded string)
2. Parses it into a JSON object
3. Executes the parsed object as a full command – as if it had arrived from a [[JSON Structure|.json file]]

Because the parsed result is treated as a JSON source, all values preserve their native types – numbers stay as numbers, booleans stay as booleans. See [[URI Type Handling]] for why this matters.

> [!NOTE]
> The `fromJson` command replaces the outer command entirely. Any other parameters alongside `cmd=fromJson` and `jsonData=...` are ignored – only the contents of the `jsonData` string are processed.

## Supported Directives

| Directive  | Required | Notes                                                                                                   |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `jsonData` | Yes      | A valid JSON string containing a complete [[JSON Packages Overview\|JSON Package]]. Must include its own `cmd` key. |

A Base64-encoded variant, `jsonData64`, can be used instead of `jsonData`. See [[URIs with JSON Data#Base64 Encoding]].

## Examples

### Example - Basic fromJson
*Task:* Create a new note by passing the full command as a JSON string.

*Pre-encoded:*
```
vault    = MyVault
cmd      = fromJson
jsonData = {"cmd":"new","templatePath":"Templates/Quote.md","prompt":"none","finalize":true,"speaker":"Churchill","quote":"Keep going","year":1940}
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=fromJson&jsonData=%7B%22cmd%22%3A%22new%22%2C%22templatePath%22%3A%22Templates%2FQuote.md%22%2C%22prompt%22%3A%22none%22%2C%22finalize%22%3Atrue%2C%22speaker%22%3A%22Churchill%22%2C%22quote%22%3A%22Keep%20going%22%2C%22year%22%3A1940%7D
```

The `jsonData` parameter decodes to:
```json
{
  "cmd": "new",
  "templatePath": "Templates/Quote.md",
  "prompt": "none",
  "finalize": true,
  "speaker": "Churchill",
  "quote": "Keep going",
  "year": 1940
}
```

The key advantage: `year` arrives as the number `1940`, not the string `"1940"`, and `finalize` arrives as the boolean `true`. The `fromJson` command preserves native JSON types.

### Example - With Base64 Encoding
*Task:* Avoid percent-encoding by using Base64.

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=fromJson&jsonData64=eyJjbWQiOiJuZXciLCJ0ZW1wbGF0ZVBhdGgiOiJUZW1wbGF0ZXMvTm90ZS5tZCIsInRpdGxlIjoiSGVsbG8ifQ==
```

The Base64 string decodes to:
```json
{"cmd":"new","templatePath":"Templates/Note.md","title":"Hello"}
```

Base64 is useful when the URI needs to be compact or when the generating tool struggles with percent-encoding. See [[URIs with JSON Data#Base64 Encoding]] for details.

> [!DANGER] INTERNAL NOTES
> - The recursive call to `processCommand` passes `isJsonSource = true`, meaning all values in the parsed JSON are treated as natively typed. This is correct – the data originates from a JSON string, not from URI parameters.
> - Confirm whether other top-level params (e.g., `templatePath` alongside `cmd=fromJson`) are truly ignored, or if they're merged somehow. The code at line 1320 returns immediately after the recursive call, so they appear to be ignored.
