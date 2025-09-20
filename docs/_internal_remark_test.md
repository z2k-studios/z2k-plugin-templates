---
title: Internal Remark Test
slug: /_internal-remark-test
sidebar_position: 9999
hide_title: true
z2k-metadata-only: true
---

> This is a hidden test page for validating that various markdown formating is not too far mangled during remarking. ==REMINDER: even if it survives the remark that occurs during my 
own remarking in step 4, it may not survive the remarking that occurs in step 5 in docusaurus
(i.e. I may have to provide remark options inside the docusaurus's config ts file.==

---

# Link Testing

## 🧪 Obsidian-style `[[WikiLinks]]`

These should resolve based on filename or `slug:`:
- [[Z2K Templates and YAML]]
- [[Template Field Types]]
- [[Template Field Naming Conventions]]
- [[Prompting]]

## 🧪 Obsidian-style `[[WikiLinks/with/paths]]`
- [[Code/Obsidian Plugins/z2k-plugin-templates/docs/readme.md]]
- [[/readme.md]]
- [[/readme.md|readme]]
- [[reference-manual/Plugin Settings Page.md]]

## 🧪 Obsidian-style `[[WikiLinks|Title]]`

- [[Partial Templates|Partial Templates]]
- [[Z2K System YAML Files|Yaml Stuff]]

## 🧪 Obsidian-style `[[#Header]]`
- [[#Test Internal Header]]

## 🧪 Obsidian-style `[[WikiLinks|#Header]]`

- [[Built-In Template Fields#Formatting Helper Functions]]
- [[Partial Templates#Dev Notes]]
- [[Partial Templates#Dev Notes|Developer Notes]]

## 🧪 Obsidian-style `[[WikiLinks|#^Block]]`

- [[Prompting#^DefaultAnswer|Default Answer]]

## Obsidian-style - multiple 
- A real work [[Template Field Types#Template Field Type Built-In Fields|example]]

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
- [https://github.com/Vinzent03/obsidian-advanced-uri](https://github.com/Vinzent03/obsidian-advanced-uri)

---

## 🚫 Negative Tests

These should remain unlinked or generate fallback behavior (e.g., sluggified guesses):

- [[Nonexistent Concept]]
- [Bad File](NotAFile.md)


---

# Formatting Testing

## 1. Standard link should stay as-is
[https://github.com/Vinzent03/obsidian-advanced-uri](https://github.com/Vinzent03/obsidian-advanced-uri)

## 2. Horizontal rule
---
***
___

## 3. List items (dash vs asterisk vs plus)
- dash item
* star item
+ plus item

## 4. Highlight syntax (Obsidian style)
==still to be done and documented==

## 5. Indentation (3 vs 4 spaces)
- Parent
   - Child with 3 spaces
    - Child with 4 spaces

## 6. Underscore in heading
### z2k_card_build_state

## 7. Mixed emphasis and strong
_this is italic_ and *also italic*
**this is bold** and __also bold__

## 8. Code blocks
This is a `constant` string.

```
console.log("fenced code");
    console.log("indented code");
```
---

## ✅ Result Verification

Use this file to confirm:
- Your `remark-fix-links` plugin is resolving slugs properly.
- Broken or unknown links still degrade gracefully.
- Auto-slug generation works consistently.


## Test Internal Header
This internal header is jumped to up above 

Note: ==Remark may add an extra carriage return after every header when writing.==
