---
sidebar_position: 50
aliases:
- Field Types
- Field Type
- field types
- Template Field Types
---
# Field Types
Every [[Template Fields Overview|template field]] in Z2K Templates has a type. The type controls two things: how the [[Prompting Interface]] presents the field to the user, and how external data (from [[URI Actions|URIs]] or [[JSON Packages|JSON Packages]]) is interpreted when it arrives as a string. To declare a field's type, use the [[fieldInfo type|fieldInfo `type` parameter]].

## Contents
- [[#Available Types]]
- [[#Native Types vs. String Types]]
- [[#Caveats on Z2K Templates Loose Typing]]

## Available Types
Z2K Templates supports the following field types, declared via [[fieldInfo type|fieldInfo]]:

| Type           | Prompting UI                                                        | URI String Conversion                                                                                                                | Internal Representation |
| -------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| `text`         | Text input (default)                                                | No conversion — value stays as a string                                                                                              | String                  |
| `filenameText` | Text input, restricted to file-safe characters                      | No specific conversion — treated as a string                                                                                         | String                  |
| `number`       | Numeric input                                                       | Parsed via `Number()`. Invalid numbers become `undefined`.                                                                           | Number                  |
| `boolean`      | Checkbox                                                            | Generous parsing: `true`, `1`, `yes`, `y`, `on` → `true`; `false`, `0`, `no`, `n`, `off` → `false`. Other strings → `undefined`.    | Boolean                 |
| `date`         | Date picker                                                         | No specific conversion — treated as a string                                                                                         | String (date string)    |
| `datetime`     | Date-time picker                                                    | No specific conversion — treated as a string                                                                                         | String (datetime string) |
| `singleSelect` | Dropdown (single choice). Options set via [[fieldInfo opts]].      | No specific conversion — [[JSON Type Conversion#No Declared Type (Auto-Conversion)\|auto-conversion]] applies                        | String                  |
| `multiSelect`  | Dropdown (multiple choices). Options set via [[fieldInfo opts]].   | No specific conversion — [[JSON Type Conversion#No Declared Type (Auto-Conversion)\|auto-conversion]] applies                        | Array of strings        |

The **Internal Representation** column is the key distinction. Only `number` and `boolean` are stored as native typed values. All other types are ultimately handled as strings. For full details on how URI strings are converted, see [[JSON Type Conversion#Conversion Rules for URI Strings]].

## Native Types vs. String Types
Z2K Templates has a loose type system — most fields are strings, and the type declaration primarily affects the user interface rather than the underlying data.

**Native types** — `number` and `boolean` — have real semantic meaning. The plugin converts URI string values to their native JavaScript types (`Number`, `Boolean`) and passes them through as typed values from JSON sources. These types affect both the prompting UI and the data pipeline.

**String types** — everything else — are stored and inserted as strings regardless of what the type label suggests:
- A `date` field is a string like `"2024-01-15"`, not a JavaScript `Date` object
- A `datetime` field is a string like `"2024-01-15T09:30:00"`, not a timestamp
- A `singleSelect` field is just the selected string value
- A `filenameText` field is a string with UI-level character restrictions

The type declaration tells the prompting UI what widget to show (date picker, checkbox, dropdown), but once the value is captured, it enters the template as text. This is by design — the final output is always Markdown, and Markdown is text.

## Caveats on Z2K Templates Loose Typing
The string-centric design keeps things simple, but there are edges worth knowing about.

### Dates Are Strings — Handle with Care
A `date` field produces a string like `"2024-01-15"`. If you pass this string to `{{formatDate}}`, the helper parses it back into a date object using moment.js. This round-trip — date → string → date — can lose information.

The most common issue: a `date` field captures only a calendar date (no time component), but `{{formatDate}}` needs a full moment in time. When the time portion is missing, moment.js fills it in with midnight local time, which can produce unexpected results with time-sensitive formats.

For reliable date formatting, prefer using `{{now}}` or `{{dateAdd}}` as the source for `{{formatDate}}` rather than a user-entered date string. See [[formatDate#Using formatDate with sourceTimes other than Now|formatDate]] for details and  examples.

### Numbers Round-Trip Through Strings
A `number` field stores a JavaScript number internally. But when the template is rendered, the number is converted to a string for insertion into Markdown. The number `3.14` becomes the text `"3.14"`. This is usually invisible — `3.14` looks the same either way — but it matters if you're doing arithmetic in template expressions or passing values to helper functions that expect numeric input.

When a number arrives via URI, it starts as the string `"3.14"`, gets converted to the number `3.14` by the type system, and then gets converted back to `"3.14"` for output. The round-trip is lossless for most values, but be aware that JavaScript number precision limits apply — very large integers or deeply precise decimals may not survive intact.

### Booleans and Truthiness
When a `boolean` field receives a value from a [[URI Actions|URI]], the plugin applies generous string parsing — `"yes"`, `"1"`, `"on"`, `"enabled"` all become `true`, and their counterparts become `false`. This conversion only applies to URI-sourced strings; the [[Prompting Interface]] presents a checkbox, so prompted values are already native booleans.

When no type is declared and a value arrives from a URI, the [[JSON Type Conversion#No Declared Type (Auto-Conversion)|auto-conversion rules]] are stricter — only exact `"true"` and `"false"` strings are converted. This means:
- A field declared as `boolean` with URI value `"yes"` → `true`
- An undeclared field with URI value `"yes"` → stays as the string `"yes"`

Declare your field type explicitly if you expect boolean-like values from external sources. See [[JSON Type Conversion#Conversion Rules for URI Strings|Conversion Rules for URI Strings]] for the full conversion table.

### singleSelect and multiSelect
These types are strings (or arrays of strings) under the hood. The type declaration controls the prompting UI — dropdown vs. text input — and the options are defined via [[fieldInfo opts]]. The selected value is inserted into the template as a plain string, same as any `text` field.

`multiSelect` fields produce an array of strings. How this array is rendered in the final output depends on the template expression. By default, the array is joined into a comma-separated string.

### Manual Type Conversion in Templates
If you need to convert a value between types within a template expression — for example, turning a string into a number for arithmetic — Z2K Templates provides the [[Type Conversion Helpers]]: `{{toNumber}}`, `{{toBool}}`, and `{{toString}}`. These are useful when a value arrives as the wrong type and you need to coerce it explicitly.

> [!DANGER] Internal Notes
> - The `handleOverrides()` function at line 2090 of main.tsx handles URI string conversion. Only `text`, `boolean`, and `number` have explicit conversion logic. All other types (`date`, `datetime`, `filenameText`, `singleSelect`, `multiSelect`) fall through to the auto-conversion branch (lines 2117-2128). This means a `date` field with URI value `"2024-01-15"` goes through auto-conversion and stays as a string (since it's not `"true"`, `"false"`, or a plain number). This is probably correct — dates should stay as strings — but it's implicit rather than explicit.
> - The fieldInfo type page lists `string` in its syntax example (`type="string"`), but the accepted values table lists `text` as the default. Confirm whether `string` is an alias for `text` or if the example is incorrect.
> - The `datetime` type's description on the fieldInfo type page says "A time of day" — this is misleading. It should be "A date and time" or "A datetime picker." Worth fixing on that page.
> - Confirm whether `multiSelect` values arriving from a URI are handled as comma-separated strings that get split into arrays, or if they need to be passed as JSON arrays via `fieldData`. The prompting UI produces an array, but URI transport produces a flat string.
