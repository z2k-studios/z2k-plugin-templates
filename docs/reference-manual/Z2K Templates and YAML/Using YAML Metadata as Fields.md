---
sidebar_position: 20
aliases:
- YAML Metadata as Fields
- YAML as Fields
- YAML Properties as Fields
---
# Using YAML Metadata as Fields
YAML frontmatter isn't just a place to store metadata – it's also a [[Field Data Sources|data source]]. Every YAML property in scope is automatically made available as a Handlebars field. If your frontmatter contains `author: "Jane Doe"`, then `{{author}}` resolves to "Jane Doe" anywhere in the template body or in other YAML expressions.

This works across all YAML sources – the template's own frontmatter, [[Block Templates|block template]] frontmatter, [[Intro to System Blocks|System Blocks]], and even the existing file's YAML when inserting a block template. The plugin merges all of these sources and makes the combined result available as field values.

## Contents
- [[#How It Works]]
- [[#Which YAML Properties Are Included]]
- [[#YAML Types Are Preserved]]
- [[#The Prompting Implication]]
- [[#Priority Among Data Sources]]

## How It Works
During template processing, the plugin collects YAML frontmatter from all relevant sources and merges them using a [[Merging Multiple YAML Sources|last-wins strategy]]. The merged YAML is then parsed into native JavaScript values, and each top-level key becomes a field value in the template state.

For example, given this template:

```handlebars
---
project: "Project Alpha"
status: active
z2k_template_type: document-template
---
# {{project}} – Status: {{status}}
```

The engine sees `project` and `status` as YAML properties, makes them available as fields, and renders the body as:

```md
# Project Alpha – Status: active
```

No `{{field-info}}` declaration is needed. No prompting occurs. The values come directly from the YAML.

## Which YAML Properties Are Included
All top-level YAML properties are included as field values, with one exception:
- The Obsidian internal property `position` is skipped (this is metadata Obsidian uses internally and is not meaningful as a field value)

Everything else is included – standard Obsidian properties (`tags`, `aliases`, `cssclasses`), [[YAML Configuration Properties|Z2K configuration properties]], and any custom properties you define.

## YAML Types Are Preserved
YAML supports richer types than plain strings – numbers, booleans, arrays, and nested objects. When a YAML property is converted to a field value, its native type is preserved:

| YAML Value | JavaScript Type | `{{field}}` Output |
| ---------- | --------------- | ------------------ |
| `count: 42` | number | `42` |
| `published: true` | boolean | `true` |
| `tags: [a, b, c]` | array | `a,b,c` |
| `title: "Hello"` | string | `Hello` |

This matters when using fields inside [[Conditionals|conditional expressions]] (`{{#if}}`) or [[Iterators|iterators]] (`{{#each}}`). An array value from YAML works naturally with `{{#each}}`, and a boolean value works naturally with `{{#if}}`.

## The Prompting Implication
Here's a detail that can surprise you: when a YAML property provides a value for a field, **that field is not prompted for**.

The plugin automatically adds the `no-prompt` [[field-info directives|directive]] to any field whose value comes from YAML. This makes sense – if the data is already present in the frontmatter, there's no reason to ask the user for it again. But it means that a YAML property can silently suppress a prompt you might have expected to see.

If a field has both a YAML value and a `{{field-info}}` declaration with a `value` parameter, the `{{field-info}}` value takes priority (see [[#Priority Among Data Sources]] below). But both will suppress prompting.

> [!NOTE] Debugging Missing Prompts
> If a field you expected to be prompted for is being skipped, check whether a YAML property with the same name exists in any of the merged YAML sources – including [[Intro to System Blocks|System Blocks]] and [[Block Templates|block template]] frontmatter. The field may be receiving its value from YAML without your realizing it.

## Priority Among Data Sources
YAML property values sit below several higher-priority sources in the [[Field Data Sources#Field Value Priority|field value priority]] system. In practice:
- A `{{field-info}}` declaration with an explicit [[field-info value|value]] parameter takes priority over YAML – the YAML value is skipped because the field already has a value when YAML processing runs
- Plugin-managed built-ins (`{{templateName}}`, `{{templateVersion}}`, etc.) unconditionally override YAML
- External overrides (URI, JSON) unconditionally override everything

YAML values only fill in fields that don't already have a value from a higher-priority source. For the full resolution model, see [[Field Data Sources#How Field Values Are Resolved|How Field Values Are Resolved]].

> [!DANGER] Notes
> - The `position` exclusion is hardcoded in the plugin at line 2927 of `main.tsx`. Verify whether other Obsidian-internal properties should also be excluded.
> - YAML nested objects (e.g., `address: { city: "NYC", zip: "10001" }`) become JavaScript objects as field values. Verify how Handlebars renders these – likely `[object Object]` unless accessed with dot notation via `{{#with}}`.
> - The `no-prompt` directive is added at plugin lines 2932-2937. If the field already has other directives, `no-prompt` is appended without removing them.
