---
sidebar_position: 40
aliases:
- Merging YAML Sources
- YAML Merging
- YAML Merge Strategy
- Last-Wins Merge
---
# Merging Multiple YAML Sources
Z2K Templates doesn't treat YAML frontmatter as a single monolithic block. A template's final YAML is assembled from multiple sources – the document template, block templates, system blocks, and (during block insertion) the existing file. Understanding how these sources are combined is essential when your templates grow beyond a single file.

## Contents
- [[#The Last-Wins Strategy]]
- [[#What Gets Merged]]
- [[#Merge Sources and Order]]
- [[#Limitations]]

## The Last-Wins Strategy
All YAML merging in Z2K Templates uses a single algorithm: **last-wins at the top-level key**. When multiple YAML sources contain the same key, the value from the source that appears last in the merge order wins. Earlier values for that key are discarded.

For example, merging these two sources:

**Source 1 (earlier):**
```yaml
---
author: "Alice"
status: draft
tags:
  - meeting
---
```

**Source 2 (later):**
```yaml
---
status: published
category: "project"
---
```

**Merged result:**
```yaml
---
author: "Alice"
status: published
tags:
  - meeting
category: "project"
---
```

- `author` – only in Source 1, kept as-is
- `status` – in both sources, Source 2 wins (`published`)
- `tags` – only in Source 1, kept as-is
- `category` – only in Source 2, added

## What Gets Merged
The merge operates strictly on **top-level keys**. Each key is treated as an atomic unit – its value is either kept or replaced entirely. The algorithm does not look inside values:
- Arrays are not concatenated – the entire array is replaced
- Nested objects are not recursively merged – the entire object is replaced
- Scalar values are simply overwritten

This is a deliberate design choice that keeps the merge behavior predictable. If you need to build up a list from multiple sources, consider using a [[Helper Functions|helper function]] or structuring your YAML so each source uses a different key.


> [!WARNING] Avoid merging tags and aliases properties
> Unfortunately, with the current approach, the `tags` and `aliases` YAML properties used by Obsidian are at risk for being replaced in hierarchical merging. We hope to support arrays in the future, but for now, array contents are not additive, but rather replacing. For this reason, we recommend using these two properties only in your final document template. 


## Merge Sources and Order
The merge order depends on the operation being performed. In all cases, sources listed later override earlier ones.

### During Template Parsing
When the engine parses a template, it merges the global block, system blocks, and the template's own YAML — in that order:

| Order | Source | Notes |
| ----- | ------ | ----- |
| 1 | [[Global Block]] YAML | Applied globally to all templates across all folders |
| 2 | [[Intro to System Blocks\|System Block]] YAML | Hierarchical, folder-scoped defaults – overrides global block |
| 3 | Template YAML | The document template's own frontmatter – overrides all above |

### During Field Value Resolution
When the plugin resolves field values, it merges all available YAML sources:

| Order | Source | Notes |
| ----- | ------ | ----- |
| 1 | Template YAML (and block template YAML) | In recursion order |
| 2 | Global block YAML | From globally applied block templates |
| 3 | System block YAML | Hierarchical defaults |
| 4 | Existing file YAML (if applicable) | Only during block insertion – the file's current frontmatter |

The resolved YAML values then feed into the [[Field Data Sources#Field Value Priority|field value priority]] system.

### During Block Insertion
When a block template is inserted into an existing file:

| Order | Source | Notes |
| ----- | ------ | ----- |
| 1 | Existing file YAML | The file's current frontmatter |
| 2 | Block template YAML (after cleanup) | The block's frontmatter, with [[YAML Configuration Properties\|template-specific properties]] removed – overrides the file |

### During Final YAML Assembly
After all templates are rendered, the engine merges all rendered YAML fragments into a single final frontmatter block:

| Order | Source | Notes |
| ----- | ------ | ----- |
| 1 | System block YAML (rendered) | Resolved expressions |
| 2 | Block template YAML (rendered) | In inclusion order |
| 3 | Document template YAML (rendered) | The main template – overrides everything above |

## Limitations
- **Top-level only** – nested objects and arrays are replaced, not merged. A block template that declares `tags: [quote]` will replace the file's entire `tags` array, not append to it.
- **No merge control** – there is no syntax to specify "append to this array" or "merge this object recursively." The algorithm is always last-wins replacement.
- **Non-map roots ignored** – YAML documents that have a sequence or scalar as the root element (rather than a mapping) are silently ignored during merging.
- **Comments are preserved** – YAML comments in individual sources are carried through the merge process where possible.


> [!DANGER] INTERNAL NOTES
> - The `mergeLastWins()` implementation is at engine lines 1650-1686.
> - The merge order during field value resolution (plugin line 2915-2918) places template YAML first and existing file YAML last. This means the existing file's YAML properties override the template's – verify this is the intended behavior for all scenarios.
> - The "during final YAML assembly" order is based on engine line 1292. Verify this matches the actual rendered output ordering.
> - Would be useful to support better `tags` and `aliases` merging (test to make sure it is an issue).
