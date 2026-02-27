---
sidebar_position: 25
aliases:
- URI Field Data
- Field Data URI
---
# URI Field Data
Field data supplies values for template fields. There are three ways to provide field data in a URI.

## Contents
- [[#Direct Parameters]]
- [[#The fieldData Directive]]
- [[#The fromJson Command]]

## Direct Parameters
The simplest approach: pass field data as individual key-value pairs directly on the URI, alongside the directives.

```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FNote.md&author=Thoreau&topic=Nature
```

Here, `author` and `topic` are field data – they fill `{{author}}` and `{{topic}}` in the template. The directives (`vault`, `cmd`, `templatePath`) control the operation itself.

Any parameter that isn't a recognized [[URI Directives|directive]] is treated as field data. The key becomes the field name, and the value fills that field in the template.

> [!NOTE]
> Field keys are case-sensitive and must match the field names in your template exactly. `meetingType` and `meetingtype` are different keys.

This approach works well for a handful of simple values. When field data gets more complex – many fields, nested values, or characters that are painful to percent-encode – consider the alternatives below.

## The fieldData Directive
The `fieldData` directive bundles all field data into a single JSON parameter. The directives (`cmd`, `templatePath`, `prompt`, etc.) stay as normal URI parameters; only the field data travels as JSON.

```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FCharacter.md&prompt=none&fieldData=%7B%22name%22%3A%22Inigo%22%2C%22role%22%3A%22Swordsman%22%7D
```

The `fieldData` value decodes to:
```json
{"name": "Inigo", "role": "Swordsman"}
```

`fieldData` accepts two formats:
- **Inline JSON** – a JSON string containing field key-value pairs
- **File path** – a vault-relative path to a `.json` file containing field data

### Mixing Direct Parameters and fieldData
A devil-in-the-details comment: you can use `fieldData` alongside individual field parameters. When both provide a value for the same field, the individual parameter wins.

```
vault     = MyVault
cmd       = new
fieldData = {"name":"Inigo","role":"Swordsman"}
role      = Fencer
```

Here, `{{name}}` gets "Inigo" from `fieldData`, but `{{role}}` gets "Fencer" from the individual parameter.

For full details, see [[URIs with JSON Data#fieldData|URIs with JSON Data]].

## The fromJson Command
The final way to specify Field Data is to use the `fromJson` command. This will bundle the *entire command* – directives and field data – into a single JSON string. This is the most advanced approach.

```
obsidian://z2k-templates?vault=MyVault&cmd=fromJson&jsonData=%7B%22cmd%22%3A%22new%22%2C%22templatePath%22%3A%22Templates%2FNote.md%22%2C%22title%22%3A%22Hello%22%7D
```

The `jsonData` value decodes to:
```json
{"cmd": "new", "templatePath": "Templates/Note.md", "title": "Hello"}
```

The key difference from `fieldData`: the `fromJson` command carries everything in one JSON string, while `fieldData` carries only field data (directives remain as individual URI parameters).

For full details, see [[URI Command - fromJson]] and [[URIs with JSON Data]].

## Summary and Comparison

| Approach          | Carries                   | Best For                                       |
| ----------------- | ------------------------- | ---------------------------------------------- |
| Direct parameters | Field data only           | A few simple fields                            |
| `fieldData`       | Field data only (as JSON) | Many fields, or fields with special characters |
| `fromJson`        | Entire command (as JSON)  | Programmatically generated commands            |



> [!DANGER] Internal Notes
> - Field data keys preserve their original casing because they must match template field names exactly. Directive keys are case-insensitive.
> - When `fieldData` is used alongside individual field parameters, the merge order is: `{ ...fieldData, ...individualParams }` (line 1296). Individual parameters win.
