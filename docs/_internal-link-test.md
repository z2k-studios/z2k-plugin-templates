---
title: Internal Link Test
slug: /_internal-link-test
sidebar_position: 9999
hide_title: true
z2k-metadata-only: true
---

> This is a hidden test page for validating internal linking behavior.

---

## 🧪 Obsidian-style `[[WikiLinks]]`

These should resolve based on filename or `slug:`:

- [[Z2K Templates Plugin In-a-Nutshell]]
- [[Z2K Templates and YAML]]
- [[Z2K Template Field Types]]
- [[Template Field Naming Conventions]]
- [[Prompting]]

## 🧪 Obsidian-style `[[WikiLinks|Title]]`

- [[Partial Templates|Partial Templates]]
- [[Z2K System YAML Files|Yaml Stuff]]

## 🧪 Obsidian-style `[[#Header]]`
- [[#Test Internal Header]]

## 🧪 Obsidian-style `[[WikiLinks|#Header]]`

- [[Built-In Template Fields#Formatting Helper Functions]]
- [[Partial Templates#Dev Notes]]

## 🧪 Obsidian-style `[[WikiLinks|#^Block]]`

- [[Prompting#^DefaultAnswer|Default Answer]]

## Obsidian-style - multiple 
- A real work [[Z2K Template Field Types#Template Field Type Built-In Fields|example]]

---

## 🧪 Markdown-style `[Links](file.md)`

These should also redirect to the proper sluggified or slug-defined URLs:

- [Helper Functions](Built-In Helper Functions.md)
- [Template Field Format Defaults](Z2K Template Field Data Default Formatting.md)
- [YAML Config Fields](Z2K Template YAML Configuration Fields.md)
- [Lifecycle](Lifecycle of a Template.md)
- [Not Real](Nonexistent File.md)


## 🧪 Markdown-style `[Links](https://website)`

- [Microsoft](https://microsoft.com)

---

## 🚫 Negative Tests

These should remain unlinked or generate fallback behavior (e.g., sluggified guesses):

- [[Nonexistent Concept]]
- [Bad File](NotAFile.md)

---

## ✅ Result Verification

Use this file to confirm:
- Your `remark-fix-links` plugin is resolving slugs properly.
- Broken or unknown links still degrade gracefully.
- Auto-slug generation works consistently.


## Test Internal Header
This internal header is jumped to up above 

