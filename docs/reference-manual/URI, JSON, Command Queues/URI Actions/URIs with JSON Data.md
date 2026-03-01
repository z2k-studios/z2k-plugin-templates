---
sidebar_position: 50
aliases:
- URIs with JSON Data
- URI JSON
- fieldData URI
---
# URIs with JSON Data
By default, field data is passed as individual parameters on the URI – one `key=value` pair per field. This works well for a handful of simple values. When field data gets more complex – many fields, nested values, or characters that are painful to percent-encode – two advanced alternatives let you bundle data more efficiently.

## Contents
- [[#fieldData]]
- [[#The fromJson Command]]
- [[#Which to Use]]
- [[#Base64 Encoding]]

## fieldData
The `fieldData` directive bundles all field data into a single parameter. The directives (`cmd`, `templatePath`, `prompt`, etc.) stay as normal URI parameters; only the field data travels as JSON.

`fieldData` accepts two formats:
- **Inline JSON** – a JSON string containing field key-value pairs
- **File path** – a vault-relative path to a `.json` file containing field data

### Inline JSON
*Pre-encoded:*
```
vault     = MyVault
cmd       = new
templatePath = Templates/Character.md
prompt    = none
finalize  = true
fileTitle = Inigo
fieldData = {"name":"Inigo","role":"Swordsman","specialty":"Fencing","motivation":"Vengeance"}
```

*Encoded URI:*
```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FCharacter.md&prompt=none&finalize=true&fileTitle=Inigo&fieldData=%7B%22name%22%3A%22Inigo%22%2C%22role%22%3A%22Swordsman%22%2C%22specialty%22%3A%22Fencing%22%2C%22motivation%22%3A%22Vengeance%22%7D
```

The `fieldData` value decodes to:
```json
{
  "name": "Inigo",
  "role": "Swordsman",
  "specialty": "Fencing",
  "motivation": "Vengeance"
}
```

Each key in the JSON object fills the corresponding template field: `{{name}}`, `{{role}}`, `{{specialty}}`, `{{motivation}}`.

### File Path
Instead of inline JSON, point to a file in the vault:

```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FCharacter.md&prompt=none&fieldData=Data%2Finigo.json
```

The plugin detects that the value doesn't start with `{` and loads it as a vault-relative file path. The file must contain a valid JSON object.

### Mixing with Individual Parameters
You can use `fieldData` alongside individual field parameters. When both provide a value for the same field, the individual parameter wins.

*Pre-encoded:*
```
vault     = MyVault
cmd       = new
templatePath = Templates/Character.md
fieldData = {"name":"Inigo","role":"Swordsman"}
role      = Fencer
```

Here, `{{name}}` gets "Inigo" from `fieldData`, but `{{role}}` gets "Fencer" from the individual parameter – the individual parameter overrides.

## The fromJson Command
The `fromJson` command takes this a step further – instead of bundling just the field data, it bundles the *entire command* (directives and field data) into a single JSON string. See [[URI Command - fromJson]] for the full reference.

The key differences from `fieldData`:
- **`fieldData`** carries field data only. Directives are still individual URI parameters.
- **`fromJson` command** carries everything – directives and field data – in one JSON string. All other URI parameters are ignored.

The `fromJson` command also preserves native JSON types: numbers stay as numbers, booleans stay as booleans. With `fieldData`, the JSON values are typed, but directive values on the URI are still strings. See [[URI Type Handling]] for details.

## Which to Use

| Scenario                                         | Recommended Approach                    |
| ------------------------------------------------ | --------------------------------------- |
| A few simple fields                              | Individual parameters – most readable   |
| Many fields, simple values                       | `fieldData` with inline JSON            |
| Field data stored in a file                      | `fieldData` with a file path            |
| Full command generated programmatically          | `fromJson` command                      |
| Need native types for directives too             | `fromJson` command                      |
| Moderate data, no file access, need compactness  | `fromJson` with `jsonData64` (Base64)   |

For most interactive use, individual parameters are sufficient. `fieldData` and the `fromJson` command are designed for automation tools that construct commands programmatically.

## Base64 Encoding
Both `fieldData` and `jsonData` have Base64-encoded variants: `fieldData64` and `jsonData64`. These encode the JSON payload as Base64, avoiding percent-encoding entirely.

```
obsidian://z2k-templates?vault=MyVault&cmd=fromJson&jsonData64=eyJjbWQiOiJuZXciLCJ0ZW1wbGF0ZVBhdGgiOiJUZW1wbGF0ZXMvTm90ZS5tZCIsInRpdGxlIjoiSGVsbG8ifQ==
```

The Base64 string decodes to:
```json
{"cmd":"new","templatePath":"Templates/Note.md","title":"Hello"}
```

Base64 is useful when:
- The generating tool can produce Base64 easily but struggles with percent-encoding
- The encoded URI needs to be compact (Base64 is often shorter than percent-encoding for data with many special characters)
- You need to pass moderate amounts of data inside a URI string without writing to an external file

> [!DANGER] INTERNAL NOTES
> - `fieldData` inline JSON detection is based on whether the value starts with `{` (line 1265 of main.tsx). A file path that starts with `{` would be misinterpreted as inline JSON.
> - When `fieldData` is used alongside individual field parameters, the merge order is: `{ ...fieldData, ...individualParams }` (line 1296). Individual parameters win.
> - The `fromJson` command's recursive call passes `isJsonSource = true`, so all values from the parsed JSON preserve their types.
