---
sidebar_position: 10
aliases:
- supported Handlebars features
- unsupported Handlebars features
---
# How Handlebars and Z2K Templates Work Together
This page describes how Z2K Templates uses the Handlebars library under the hood, what's fully supported, what's untested, and where Z2K diverges from standard Handlebars behavior.

## Introduction
[Handlebars](https://handlebarsjs.com/) is a JavaScript templating library that uses double-curly-brace expressions – `{{like this}}` – to insert dynamic values into text. It supports helpers, conditionals, iterators, partials, and more. For a full reference, see [The Handlebars Guide](https://handlebarsjs.com/guide/).

Z2K Templates uses Handlebars as its parsing and rendering engine. Most Handlebars syntax works as documented – Z2K's extensions sit on top of that foundation rather than replacing it.

## Handlebars Core Features
Handlebars provides the following core features, all of which Z2K Templates builds on:
- **Expressions** – `{{variable}}` inserts a value from the current context
- **Helpers** – `{{helperName arg}}` calls a function to transform or generate output
- **Comments** – `{{! comment }}` leaves notes that don't appear in output
- **Conditionals** – `{{#if value}}...{{/if}}` renders content based on truthiness
- **Iterators** – `{{#each list}}...{{/each}}` loops over arrays or objects
- **Partials** – `{{> partialName}}` includes reusable template fragments
- **Whitespace control** – `{{~ }}` trims surrounding whitespace
- **Raw output** – `{{{variable}}}` bypasses escaping
- **Block helpers** – `{{#helperName}}...{{/helperName}}` wraps content in helper logic
- **Context switching** – `{{#with object}}...{{/with}}` changes the evaluation scope

## How Z2K Templates' Approach Differs from Handlebars
There are a few subtle differences in the fundamental way in which Z2K Templates behaves that causes slight changes in how Handlebars processing is performed:

1. **Markdown Focused**:
	- Z2K does not assume the output is HTML, but rather Markdown. Therefore the default escaping handling and "raw" output is implemented differently.
2. **Interactive**:
	- Because templating with the Z2K Templates plugin is usually interactively performed, Z2K Templates provides a prompting interface for obtaining data
	- Handlebars, however assumes that all data is either known or not known at the point of processing, and thus does not have an interactive [[Prompting]] usage model
3. **Deferred Resolution**:
	- Because Z2K Templates are interactive, not all data may be initially known. In this instance, Z2K Templates supports [[Deferred Field Resolution]], resulting in [[WIP Stage|WIP Content Files]] that still have fields in them waiting to be filled in. See the [[Lifecycle of a Template]] for more details.
4. **Fallback Processing**:
	- Because fields can be deferred, Z2K Templates provides a more customizable approach to how unspecified fields are handled when generated content files are [[Finalization|finalized]]. See [[Fallback Behavior]] for more details.
5. **Library of Built-In Helpers and Fields**:
	- Z2K Templates is shipped with a large library of [[Built-In Fields]] and [[Built-In Helper Functions]] that are designed for the Obsidian environment.

## Supported Handlebars Features with Z2K Nuances
The following Handlebars features are supported but have enhancements, behavioral differences, or limitations when used within Z2K Templates. Each has a dedicated page covering the specifics:

- [[Template Comments|Template comments]] – supported with enhanced line-aware removal
- [[Unescaped Expressions]] – escaping works differently in Z2K's Markdown-focused environment
- [[Whitespace Control|Whitespace control]] – fully supported, with additional considerations for [[Silent Helper Functions|silent helpers]]
- [[Conditionals]] – supported, but interact with Z2K's [[Deferred Field Resolution|deferred fields]] in ways worth understanding
- [[Iterators]] – supported, with considerations when used alongside [[Partials]]
- [[Logging]] – supported, with guidance on where to find the output
- [[Raw Blocks]] – syntax is recognized, but behavior differs from standard Handlebars
- [[Block Helpers]] – supported in full templates, with limitations in certain contexts
- [[Partials]] – supported with Z2K-specific resolution rules for [[Block Templates|block templates]]

## Untested Handlebars Features
The following Handlebars features have not been systematically tested with Z2K Templates. They may work, they may not – use at your discretion:

- [Nested input objects](https://handlebarsjs.com/guide/#nested-input-objects) when passed external [[URI, JSON, Command Queues|JSON data packets]] – e.g. `{{person.lastname}}`
- [Inline partials](https://handlebarsjs.com/guide/partials.html#inline-partials) (`{{#* inline "name"}}...{{/inline}}`)
- [[Helper Functions#Z2K Custom Helper Functions|Custom Helper Functions]]
- [[Helper Functions#Usage - Nested Helper Functions|Nested Helper Functions]]
- [Context switching](https://handlebarsjs.com/guide/builtin-helpers.html#with) (`{{#with}}`)

## Subtle Changes from Handlebars Syntax
For details on specific behavioral differences, see the individual pages in the [[Handlebars Support]] section. Key deviations include:

- **Escaping** – Z2K targets Markdown, not HTML, so escaping rules differ. See [[Unescaped Expressions]].
- **Comment removal** – Z2K removes the entire line when a comment is the only content on it, rather than leaving a blank line. See [[Template Comments]].
- **Field preservation** – unresolved fields remain in the output rather than being replaced with empty strings. See [[Deferred Field Resolution]].



> [!DANGER] Notes for Review
> - The "Untested" list should be pruned as features are verified. Consider adding a testing pass for each item.
> - `{{#with}}` passes through to Handlebars and likely works, but no Z2K-specific testing has been done. If confirmed, move to Supported.
