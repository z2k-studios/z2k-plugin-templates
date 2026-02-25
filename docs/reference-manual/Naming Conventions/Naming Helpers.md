---
sidebar_position: 30
aliases:
  - naming helpers
  - helper naming conventions
  - helper naming
  - Helper Naming Conventions
---
# Helper Naming Conventions
[[Helper Functions Overview|Helper functions]] extend what template fields can do – formatting, linking, math, conditionals. Each helper has a name that you call inside `{{ }}` expressions. This page covers how built-in and user-defined helpers are named, notes a current inconsistency, and defines the target convention.

## Contents
- [[#Current Built-In Helper Naming]]
- [[#The Inconsistency]]
- [[#Target Convention]]
- [[#Proposed Renames]]
- [[#User-Defined Helper Naming]]

## Current Built-In Helper Naming
Z2K Templates ships with roughly 40 built-in helpers. Their names currently fall into three styles:

### Flat Lowercase (Single-Word)
Helpers with single-word names use lowercase. This matches Handlebars' own built-in helpers (`if`, `each`, `with`, `log`).

| Helper | Purpose |
|---|---|
| `wikilink` | Create an Obsidian wikilink |
| `url` | Create a URL link |
| `hashtag` | Create a hashtag |
| `google` | Create a Google search link |
| `wikipedia` | Create a Wikipedia link |
| `arr` | Create an array |
| `obj` | Create an object |
| `eq`, `ne`, `lt`, `lte`, `gt`, `gte` | Comparison operators |
| `add`, `subtract`, `multiply`, `divide` | Arithmetic operators |
| `calc` | Expression calculator |
| `random` | Random number generator |

These are fine as-is – no rename needed.

### kebab-case (Multi-Word)
The majority of multi-word helpers currently use kebab-case:

| Helper | Purpose |
|---|---|
| `field-info` | Define field metadata |
| `fi` | Shorthand for `field-info` |
| `field-output` | Define and output field value |
| `fo` | Shorthand for `field-output` |
| `format-date` | Format a date value |
| `format-string` | General string formatting |
| `format-string-to-upper` | Convert to uppercase |
| `format-string-to-lower` | Convert to lowercase |
| `format-string-spacify` | Add spaces between words |
| `format-string-bulletize` | Convert to bullet list |
| `format-string-trim` | Trim whitespace |
| `format-string-raw` | Output raw string |
| `format-string-file-friendly` | Make string safe for filenames |
| `format-string-slugify` | Convert to URL slug |
| `format-string-encode-URI` | URI-encode a string |
| `format-string-encode-base64` | Base64-encode a string |
| `format-string-commafy` | Add comma separators |
| `format-number` | Format a number |
| `format-number-to-fixed` | Format number to fixed decimals |
| `date-add` | Add time to a date |

### camelCase (Multi-Word)
A few multi-word helpers already use camelCase:

| Helper | Purpose |
|---|---|
| `chatGPT` | Create a ChatGPT link |
| `toNumber` | Convert to number |
| `toBool` | Convert to boolean |
| `toString` | Convert to string |

## The Inconsistency
The three styles above were not a deliberate design choice – they accumulated as helpers were added over time. The result: a user has to remember whether it's `format-date` or `formatDate`, `to-number` or `toNumber`. This is tracked in [GitHub Issue #140](https://github.com/z2k-studios/z2k-plugin-templates/issues/140).

**What the Handlebars community does:**
- Handlebars' own built-in helpers use **lowercase single words**: `if`, `each`, `with`, `unless`, `lookup`, `log`
- The [handlebars-helpers](https://github.com/helpers/handlebars-helpers) community library (188 helpers) uses **camelCase** consistently: `eachIndex`, `sortBy`, `withAfter`, `isFalsey`, `ifEven`
- JavaScript itself uses camelCase for function names

The community standard is clear: **camelCase for multi-word names, lowercase for single-word names.**

## Target Convention
Once standardized, Z2K Templates helper naming will follow these rules:

| Condition | Convention | Examples |
|---|---|---|
| Single-word helper | lowercase | `wikilink`, `url`, `add`, `eq` |
| Multi-word helper | camelCase | `fieldInfo`, `formatDate`, `toNumber` |
| Abbreviation helpers | lowercase | `fi`, `fo`, `arr`, `obj` |

This matches both the Handlebars community standard and JavaScript naming conventions.

## Proposed Renames
==The following renames are planned but not yet implemented. The "Current Name" column reflects what works in templates today.==

| Current Name | Target Name | Category |
|---|---|---|
| `field-info` | `fieldInfo` | Field Info |
| `field-output` | `fieldOutput` | Field Info |
| `format-date` | `formatDate` | Formatting |
| `format-string` | `formatString` | Formatting |
| `format-string-to-upper` | `formatStringToUpper` | Formatting |
| `format-string-to-lower` | `formatStringToLower` | Formatting |
| `format-string-spacify` | `formatStringSpacify` | Formatting |
| `format-string-bulletize` | `formatStringBulletize` | Formatting |
| `format-string-trim` | `formatStringTrim` | Formatting |
| `format-string-raw` | `formatStringRaw` | Formatting |
| `format-string-file-friendly` | `formatStringFileFriendly` | Formatting |
| `format-string-slugify` | `formatStringSlugify` | Formatting |
| `format-string-encode-URI` | `formatStringEncodeURI` | Formatting |
| `format-string-encode-base64` | `formatStringEncodeBase64` | Formatting |
| `format-string-commafy` | `formatStringCommafy` | Formatting |
| `format-number` | `formatNumber` | Formatting |
| `format-number-to-fixed` | `formatNumberToFixed` | Formatting |
| `date-add` | `dateAdd` | Date |

**No changes needed for:**
- Single-word lowercase helpers (`wikilink`, `url`, `eq`, `add`, etc.)
- Abbreviations (`fi`, `fo`, `arr`, `obj`)
- Existing camelCase helpers (`toNumber`, `toBool`, `toString`, `chatGPT`)

## User-Defined Helper Naming
User-defined helpers are registered via `registerHelper(name, fn)` in the [[Code Block Settings|Global Helper Code Block]]. The plugin does not enforce a naming convention – any valid JavaScript identifier works.

**Recommended convention: camelCase**, to match the built-in helpers and JavaScript standards.

```js
// Good — follows camelCase convention
registerHelper('shout', (value) => String(value).toUpperCase() + '!');
registerHelper('formatCurrency', (value, currency) => `${currency}${Number(value).toFixed(2)}`);

// Works, but inconsistent with built-in style
registerHelper('format-currency', (value, currency) => `${currency}${Number(value).toFixed(2)}`);
```

> [!WARNING]
> Avoid naming a user-defined helper the same as a built-in helper. User helpers override built-ins – if you register a helper named `wikilink`, your version replaces the built-in one entirely.

> [!DANGER] Documentation Notes
> - The proposed renames in this page are tracked in [GitHub Issue #140](https://github.com/z2k-studios/z2k-plugin-templates/issues/140). Once the renames are implemented:
>   1. Remove the "Proposed Renames" section
>   2. Remove the "The Inconsistency" section
>   3. Collapse "Current Built-In Helper Naming" into a single table organized by camelCase convention
>   4. Update the WARNING callout highlight in [[Naming Overview]] summary table
>   5. Update all helper name references throughout the reference manual
> - Helper registration is in `z2k-template-engine/src/main.ts` (lines 41-358) and `z2k-plugin-templates/src/main.tsx` (~line 858).
> - The `fi`/`fo` abbreviations are aliases, not separate implementations. After rename, these should remain as shorthand for `fieldInfo`/`fieldOutput`.
