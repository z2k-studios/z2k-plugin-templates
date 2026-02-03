---
sidebar_position: 30
aliases:
- YAML and Block Templates
- Block Template YAML
- Block Template Frontmatter
---
# YAML and Block Templates
When a [[Block Templates|block template]] is inserted into a file, both its body and its YAML frontmatter are processed. The body is inserted into the document at the appropriate location. The YAML frontmatter is **merged** with the existing file's frontmatter – it doesn't replace it, and it doesn't get discarded.

This merge behavior means block templates can contribute metadata to the file they're inserted into: tags, custom properties, or any other YAML data you want to carry along with the block's content.

## Contents
- [[#How Block YAML Merging Works]]
- [[#What Gets Cleaned Up]]
- [[#Block YAML Can Provide Field Values]]
- [[#Example]]

## How Block YAML Merging Works
When you insert a block template, the plugin takes the block's YAML frontmatter and merges it with the target file's existing YAML using the [[Merging Multiple YAML Sources|last-wins merge strategy]]. The block's YAML is applied **after** the file's YAML, so the block's properties override the file's properties when they share the same key.

In short:
- Properties that exist only in the file are kept
- Properties that exist only in the block are added
- Properties that exist in both are overwritten by the block's value

> [!WARNING] Block YAML Overrides File YAML
> Because the block's YAML is applied last, inserting a block template can overwrite existing YAML properties in the target file. Be mindful of property name collisions between your block templates and your content files.

## What Gets Cleaned Up
Before the block's YAML is merged, the plugin removes [[YAML Configuration Properties]] that are specific to the template layer and should not carry over into the target file:
- `z2k_template_type` – the block's template type marker is not relevant to the target file
- `z2k_template_suggested_title` – title suggestions only apply during document-level instantiation
- `z2k_template_default_fallback_handling` – fallback handling is a template-processing concern

All other YAML properties in the block – including user-defined properties, tags, aliases, and any custom metadata – are merged into the target file.

## Block YAML Can Provide Field Values
Block template YAML properties are available as field values during rendering, just like any other YAML source (see [[Using YAML Metadata as Fields]]). This means a block template can carry its own default data in its YAML frontmatter, and `{{field}}` expressions in the block body can resolve from it.

Combined with the existing file's YAML (see [[Storing Field Values in YAML]]), this creates a layered data model: the file provides stored values, the block provides its own defaults, and the merge combines them – with the block winning on conflicts.

## Example
Consider a file with this YAML:

```yaml
---
BookTitle: "Neuromancer"
BookAuthor: "William Gibson"
tags:
  - book
---
```

And a block template with this content:

```handlebars
---
tags:
  - quote
source: "{{BookTitle}}"
---
> {{Quote}}
> — {{BookAuthor}}, *{{BookTitle}}*
```

After inserting the block:
- `{{BookAuthor}}` and `{{BookTitle}}` resolve from the file's YAML
- `{{Quote}}` is prompted (no value in any YAML source)
- The block's `tags` property (`[quote]`) **overwrites** the file's `tags` property (`[book]`)
- The `source` property is added to the file's YAML

The resulting file YAML:

```yaml
---
BookTitle: "Neuromancer"
BookAuthor: "William Gibson"
tags:
  - quote
source: "Neuromancer"
---
```

> [!WARNING] Tags Were Overwritten
> In the example above, the original `book` tag was lost because the block's `tags` array replaced the file's `tags` array. The merge operates at the top-level key only – it does not merge arrays or nested objects. If you need to preserve existing tags, avoid declaring `tags` in your block template's YAML.

> [!DANGER] Notes
> - The merge happens in `updateBlockYamlOnInsert()` at plugin lines 2967-2973, followed by `mergeLastWins()` at line 2008.
> - Only top-level keys are merged. Nested objects and arrays are replaced wholesale – not recursively merged. This is a fundamental limitation of the `mergeLastWins()` algorithm.
> - Verify whether block YAML properties that contain `{{field}}` expressions are rendered before or after merging. The code suggests rendering happens first (line 1997), then cleanup (line 1999), then merge (line 2008).
