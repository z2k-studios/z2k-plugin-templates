---
sidebar_position: 1
sidebar_folder_position: 130
---
# Handlebars Support
Z2K Templates is built on the powerful [Handlebars](https://handlebarsjs.com/guide/) library for templating. Handlebars itself has many features and capabilities and, with only a few exceptions, are supported inside Z2K Templates as well.

This section does not aim to replicate the Handlebars documentation – please see [The Handlebars Guide](https://handlebarsjs.com/guide/) for details on Handlebars. This section focuses on subtleties and incompatibilities between Handlebars features and Z2K Templates.

## Contents
For more information, please see:
1. [[Handlebars and Z2K Templates]] - Overview of how Z2K Templates uses and extends the Handlebars library
2. [[Template Comments]] - Comment syntax and Z2K Template's line-aware removal behavior
3. [[Unescaped Expressions]] - How escaping and raw output work in a Markdown-focused environment
4. [[Whitespace Control]] - Trimming whitespace around expressions with tildes
5. [[Conditionals]] - Using `{{#if}}` and `{{#unless}}` with Z2K Template's deferred fields
6. [[Iterators]] - Using `{{#each}}` with arrays, objects, and blocks
7. [[Logging]] - Using `{{log}}` for debugging templates
8. [[Raw Blocks]] - Preventing template processing within a block
9. [[Block Helpers]] - Custom block-level helpers and their limitations in Z2K Templates
10. [[Partials]] - Block syntax, resolution, and dynamic selection
