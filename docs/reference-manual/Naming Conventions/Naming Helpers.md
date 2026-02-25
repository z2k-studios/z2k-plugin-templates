---
sidebar_position: 30
aliases:
  - naming helpers
  - helper naming conventions
  - helper naming
  - Helper Naming Conventions
---
# Helper Naming Conventions
[[Helper Functions Overview|Helper functions]] extend what template fields can do – formatting, linking, math, conditionals. Each helper has a name that you call inside `{{ }}` expressions. This page covers how built-in and user-defined helpers are named.

## Contents
- [[#Convention]]
- [[#Built-In Helper Reference]]
- [[#User-Defined Helper Naming]]

## Convention
Z2K Templates helper names follow two rules, consistent with the Handlebars community standard and JavaScript conventions:

| Condition | Convention | Examples |
|---|---|---|
| Single-word helper | lowercase | `wikilink`, `url`, `add`, `eq` |
| Multi-word helper | camelCase | `fieldInfo`, `formatDate`, `toNumber` |
| Abbreviation helpers | lowercase | `fi`, `fo`, `arr`, `obj` |

Handlebars' own built-ins use lowercase single words (`if`, `each`, `with`, `log`). The broader Handlebars community (e.g., [handlebars-helpers](https://github.com/helpers/handlebars-helpers)) uses camelCase consistently for multi-word names. Z2K follows the same pattern.

## Built-In Helper Reference
All built-in helpers organized by category.

### Field Info
| Helper | Purpose |
|---|---|
| `fieldInfo` | Define field metadata (prompt, type, fallback, etc.) |
| `fi` | Shorthand alias for `fieldInfo` |
| `fieldOutput` | Define field metadata and immediately output the value |
| `fo` | Shorthand alias for `fieldOutput` |

### Formatting – Dates
| Helper | Purpose |
|---|---|
| `formatDate` | Format a date value using moment.js format strings |
| `dateAdd` | Add time to a date (supports fractional days for hours/minutes) |

### Formatting – Strings
| Helper | Purpose |
|---|---|
| `formatString` | General string formatting via a template pattern |
| `formatStringToUpper` | Convert to uppercase |
| `formatStringToLower` | Convert to lowercase |
| `formatStringSpacify` | Add spaces between words (camelCase → readable) |
| `formatStringBulletize` | Convert to a bullet list |
| `formatStringTrim` | Trim leading and trailing whitespace |
| `formatStringRaw` | Output raw (unescaped) string |
| `formatStringFileFriendly` | Make string safe for use as a filename |
| `formatStringSlugify` | Convert to URL slug |
| `formatStringEncodeURI` | URI-encode a string |
| `formatStringEncodeBase64` | Base64-encode a string |
| `formatStringCommafy` | Join array items with commas |

### Formatting – Numbers
| Helper | Purpose |
|---|---|
| `formatNumber` | Format a number (uses numeral.js format strings) |
| `formatNumberToFixed` | Format number to a fixed number of decimal places |

### Linking
| Helper | Purpose |
|---|---|
| `wikilink` | Create an Obsidian wikilink |
| `url` | Create a Markdown URL link |
| `hashtag` | Create a hashtag |
| `google` | Create a Google search link |
| `wikipedia` | Create a Wikipedia link |
| `chatGPT` | Create a ChatGPT link |

### Data Structures
| Helper | Purpose |
|---|---|
| `arr` | Create an array from arguments |
| `obj` | Create an object from hash parameters |

### Comparison
| Helper | Purpose |
|---|---|
| `eq` | Equal |
| `ne` | Not equal |
| `lt` | Less than |
| `lte` | Less than or equal |
| `gt` | Greater than |
| `gte` | Greater than or equal |

### Math
| Helper | Purpose |
|---|---|
| `add` | Add two numbers |
| `subtract` | Subtract two numbers |
| `multiply` | Multiply two numbers |
| `divide` | Divide two numbers |
| `calc` | Evaluate a math expression string |
| `random` | Pick a random item from an array |

### Type Conversion
| Helper | Purpose |
|---|---|
| `toNumber` | Convert to number |
| `toBool` | Convert to boolean |
| `toString` | Convert to string |

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
> - Helper registration is in `z2k-template-engine/src/main.ts` (lines 41–358) and `z2k-plugin-templates/src/main.tsx` (~line 858).
> - The `fi`/`fo` abbreviations are aliases, not separate implementations – they point to the same function as `fieldInfo`/`fieldOutput`.
