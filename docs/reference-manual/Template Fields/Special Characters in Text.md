---
sidebar_position: 70
aliases:
- Special Characters in Text
- Escape Sequences
- Newlines in Fields
- String Escapes
---
# Special Characters in Text
Template fields can hold more than plain words — but getting special characters like newlines and tabs into a field value depends on how the data is being supplied. The rules differ between JSON, URI, and template expressions.

## Contents
- [[#String Escape Sequences]]
- [[#Behavior by Transport]]
- [[#Percent-Encoding for URIs]]
- [[#Literal Curly Braces]]

## String Escape Sequences
Z2K Templates recognizes the following escape sequences in field values:

| Sequence | Character | Notes |
| -------- | --------- | ----- |
| `\n` | Newline | |
| `\t` | Tab | |
| `\\` | Literal backslash | |

Whether these sequences are expanded depends on *where* the value is coming from.

## Behavior by Transport

### JSON Field Data
When field values arrive in a [[JSON Packages Overview|JSON Package]] (`.json` file, `.jsonl` file, or the [[URI Command - fromJson|fromJson command]]), the JSON parser expands escape sequences before the plugin ever sees the value. A string written as `"Line 1\nLine 2"` contains an actual newline character when it reaches the template engine. This is standard JSON behavior — the plugin does nothing extra.

```json
{
  "cmd": "new",
  "templatePath": "Templates/Poem.md",
  "verse": "Shall I compare thee\nto a summer's day?"
}
```

`{{verse}}` will contain an actual newline between the two lines.

### URI Field Data
[[URI Actions|URI]] parameters are plain strings — URL decoding does not expand escape sequences. A parameter written as `verse=Line+1\nLine+2` arrives as the literal characters `\` and `n`, not a newline.

To pass a real newline in a URI, use percent-encoding:
- Newline → `%0A`
- Tab → `%09`
- Backslash → `%5C`

Alternatively, pass the data via `fieldData` or the `fromJson` command — both parse values as JSON, so `\n` expands normally. See [[URIs with JSON Data]].

### Template Expressions
Escape sequences inside `{{fieldInfo}}` parameters — `value`, `fallback`, `suggest`, and `prompt` — are always expanded by the template engine, regardless of transport.

```handlebars
{{fieldInfo verse fallback="To be or not to be,\nThat is the question."}}
```

The fallback will contain an actual newline between the two sentences, whether the template is triggered by URI, JSON, or the command palette.

### Summary Table

| Source | `\n` in a string | To get a real newline |
| ------ | ---------------- | --------------------- |
| JSON field data | Expanded by `JSON.parse()` | Write `\n` directly |
| URI field data | Left as `\` + `n` | Use `%0A` |
| `fieldInfo` expressions | Expanded by template engine | Write `\n` directly |

## Percent-Encoding for URIs
Any character can be passed in a URI using its percent-encoded form (`%XX`, where `XX` is the hexadecimal Unicode code point). Common ones for text data:

| Character | Percent-Encoded |
| --------- | --------------- |
| Newline (LF) | `%0A` |
| Tab | `%09` |
| Space | `%20` or `+` |
| Backslash | `%5C` |
| Double quote | `%22` |

Most tools that construct URIs (Apple Shortcuts, Raycast, scripts) handle percent-encoding automatically. If you're writing a URI by hand, encode any non-alphanumeric characters that appear in field values.

## Literal Curly Braces
If you need to output a literal `{{` in a field value — so it is not interpreted as a template expression — use a backslash escape in the template itself:

```handlebars
\{{not a field}}
```

This outputs `{{not a field}}` verbatim. This applies inside template files, not in externally supplied field data (which is plain text and never parsed as Handlebars expressions).

> [!DANGER] INTERNAL NOTES
> - Escape expansion for template expressions (`\n`, `\t`, `\\`) is handled by `processStringEscapes()` in the template engine. It runs on the output of `reducedRenderContent()` when `processEscapes=true`. Confirm that it does NOT run on externally supplied field data (field overrides from URI/JSON) — the data passes through as-is after being substituted into the template during rendering.
> - ==**#AR** Confirm whether `\n` inside a JSON field value that gets substituted into a YAML frontmatter property causes issues (YAML multiline syntax). A raw newline in a YAML scalar value may be valid but could also silently corrupt the frontmatter.==
