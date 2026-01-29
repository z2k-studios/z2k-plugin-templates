---
sidebar_position: 1
sidebar_folder_position: 130
---

Z2K Templates uses [Handlebars](https://handlebarsjs.com/guide/)  to control how fields are parsed and implemented. While not all Handlebar features are supported, the description below captures the core features that are used by Z2K. In addition, Z2K has implemented several extensions of the field specification to suit its own implementation.

# Supported Handlebars.js Features
Z2K supports the following features in Handlebars:
- [Nested input objects](https://handlebarsjs.com/guide/#nested-input-objects) when passed external [[Z2K Templates, URI, and JSON|JSON data packets]]. Thus `{{person.lastname}}` will replace the field with the lastname object inside a person object. 
- [Whitespace Control](https://handlebarsjs.com/guide/expressions.html#whitespace-control) to remove whitespace in the source templates
- [[Helper Functions]] with [[Built-In Helper Functions|Built-in]] functions for formatting data
- [[Helper Functions#Usage - Nested Helper Functions|Nested Helper Functions]]
- [Template Comment](https://handlebarsjs.com/guide/#template-comments) Fields
- [Partials](https://handlebarsjs.com/guide/partials.html#partials), e.g. for allowing reusable metadata entries
- ==TBD==:
	- `{{{rawField}}}`, support for raw fields

# Unsupported Handlebars.js Features
- Handlebars includes a number of additional features (e.g. conditionals with `{{#if}}`). These are officially unsupported. They may work, they may note. Use at your discretion. 
- [[Helper Functions#Z2K Custom Helper Functions|Custom Helper Functions]]
- [Blocks](https://handlebarsjs.com/guide/block-helpers.html#basic-blocks)

# How Z2K Templates Differs from Handlebars
There are a few subtle differences:
1. Z2K has several additional advanced expressions (see [[#Z2K Advanced Expressions not in Handlebars]] below)
2. Z2K does not assume the output is HTML, but rather Markdown. Therefore the default escaping handling is implemented differently. Similarly, Raw output is handled differently
3. Z2K assumes that if a field is not specified with data, then the field remains in the resultant template file. See [[Fallback Behavior]] for more details. 

# Z2K Advanced Expressions not in Handlebars
For quick reference, the following are augmentations to the Handlebars language that are only used in Z2K's implementation:
1. Support for Z2K specific Built-In Helpers
	- See [[Built-In Helper Functions]]
2. Support for User Prompting
	- See [[Prompting]]
3. Support for automated fields
	- See [[Built-In Fields]]
4. Support for required fields
	- See ==TBD==
