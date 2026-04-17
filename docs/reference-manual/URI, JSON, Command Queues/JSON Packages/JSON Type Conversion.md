---
sidebar_position: 80
aliases:
- JSON Type Conversion
- Type Conversion
- Type Coercion
---
# JSON Type Conversion
When field values arrive in a [[JSON Packages Overview|JSON Package]], the plugin needs to know whether `"5"` means the text five or the number 5, and whether `"true"` means the boolean or the literal string. The answer depends on how the data arrived — its *transport* — not its format.

## Contents
- [[#The Core Rule]]
- [[#URI Sources — String Coercion]]
- [[#JSON Sources — Native Types]]
- [[#Conversion Rules for URI Strings]]
- [[#String Escape Sequences]]
- [[#Practical Implications]]

## The Core Rule
The plugin tracks whether each field value came from a **URI source** or a **JSON source**:
- **URI source**  — all values arrive as strings (URL query params are always strings). The plugin converts them to typed values based on the template's [[Field Types|field type]] definitions.
- **JSON source**  — values arrive with their native JSON types already intact. Numbers are numbers, booleans are booleans, arrays are arrays. No conversion is applied.

This distinction matters because the same data can produce different results depending on how it's delivered.

> [!IMPORTANT] First a Primer
> If you want to travel down the rabbit hole of Field Types, please make sure you first understand how Z2K Templates understand them by reading the [[Field Types]] page.

## URI Sources — String Coercion
When a [[JSON Packages Overview|JSON Package]] arrives through a [[URI Actions|URI]], every parameter value is a string. The plugin must infer the intended type. It does this by consulting the template's field definitions — specifically, the `type` set via [[fieldInfo type|fieldInfo]]. 

For example, if the URI contains `rating=5`:
- If the template declares `rating` as type `number` → the value becomes the number `5`
- If the template declares `rating` as type `text` → the value stays as the string `"5"`
- If the template has no type declaration for `rating` → auto-conversion applies (see below)

## JSON Sources — Native Types
When a [[JSON Packages Overview|JSON Package]] arrives from a [[JSON Structure|.json file]], a [[JSONL Format|.jsonl file]], or through the [[URI Command - fromJson|fromJson command]], values keep their JSON types. No conversion is performed.

```json
{
  "rating": 5,
  "isActive": true,
  "tags": ["z2k", "demo"]
}
```

Here, `rating` is already a number, `isActive` is already a boolean, and `tags` is already an array. The plugin passes them through as-is, regardless of what the template's field type declarations say.

## Conversion Rules for URI Strings
When a value comes from a URI and needs type conversion, the plugin applies these rules based on the field's declared type:

### Declared Type: `text`
No conversion — the string value is used as-is.

### Declared Type: `boolean`
Generous parsing of truthy and falsy string values:

| Converts to `true` | Converts to `false` |
|---------------------|---------------------|
| `"true"`, `"1"`, `"yes"`, `"y"`, `"on"`, `"enabled"`, `"enable"` | `"false"`, `"0"`, `"no"`, `"n"`, `"off"`, `"disabled"`, `"disable"` |

All comparisons are case-insensitive. Any other string value results in `undefined` (the field is treated as unset).

### Declared Type: `number`
The string is parsed as a number using JavaScript's `Number()` function. If the result is `NaN`, the value becomes `undefined`.

| Input | Result |
|-------|--------|
| `"42"` | `42` |
| `"3.14"` | `3.14` |
| `"-1"` | `-1` |
| `"abc"` | `undefined` |
| `""` | `undefined` |

### No Declared Type (Auto-Conversion)
When a field has no type declaration (or uses a type like `singleSelect` that doesn't have special conversion rules), the plugin applies automatic detection:
- `"true"` (case-insensitive) → `true`
- `"false"` (case-insensitive) → `false`
- Any non-empty string that parses as a valid number → that number
- Everything else → stays as a string

Auto-conversion is conservative — only exact matches of `"true"` and `"false"` trigger boolean conversion, unlike the declared `boolean` type which accepts a wider range of truthy/falsy strings.

## String Escape Sequences
Whether `\n` becomes a newline — and `\t` a tab — depends on the transport. JSON sources expand escape sequences automatically; URI sources do not. For the full breakdown and a summary table, see [[Special Characters in Text]].

## Practical Implications

### Choosing Your Transport
- If your field data includes numbers, booleans, or arrays, prefer a **JSON source** (`.json` file, `.jsonl` file, or the `json` command). Values arrive correctly typed without relying on field declarations.
- If you're using a **URI**, make sure your template declares [[Field Types|field types]] via [[fieldInfo type|fieldInfo]] for any non-string fields. Without type declarations, auto-conversion may produce unexpected results — `"0"` becomes the number `0`, not the string `"0"`.

### The fieldData Exception
The [[fieldData]] parameter adds nuance. When used inside a URI:
- The `fieldData` string itself is parsed as JSON, so the values inside it *are* natively typed
- But they are still marked as coming from a URI source if the outer transport is a URI

When used inside a `.json` or `.jsonl` file:
- If `fieldData` is a nested object, its values are natively typed and marked as a JSON source
- If `fieldData` is a file path string, the loaded file's values are natively typed

> [!INFO]
> When in doubt about type behavior, use the [[URI Command - fromJson|fromJson command]] or a `.json` command file. These guarantee that your values arrive exactly as you wrote them — no conversion, no surprises.



> [!DANGER] INTERNAL NOTES
> - The `fieldData` exception described above needs verification. The code at line 1296 creates `fieldOverrides` by spreading `additionalFields` (from `fieldData`) with `templateData` (top-level non-directive keys). The `uriKeys` set at line 1298 only contains keys from `templateData`, not from `additionalFields`. This means `fieldData` values are *never* subject to URI string conversion, even when the outer transport is a URI. This is arguably correct (the JSON was parsed, so types are preserved), but should be confirmed as intentional.
> - The auto-conversion behavior for undeclared types is narrow — only `"true"`, `"false"`, and numeric strings are converted. This is different from the generous parsing used for declared `boolean` types. Document whether this asymmetry is intentional or a simplification.
> - Confirm whether arrays and objects passed via URI `fieldData` (as inline JSON) are handled correctly, or if they're limited to scalar values only.
