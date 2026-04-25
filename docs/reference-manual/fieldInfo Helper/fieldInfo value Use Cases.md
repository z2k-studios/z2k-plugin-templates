---
sidebar_position: 65
doc_state: initial_ai_draft
title: fieldInfo value Use Cases
aliases:
  - fieldInfo value Use Cases
  - value use cases
  - computed field use cases
---
# fieldInfo value Use Cases
The `value` parameter on `{{fieldInfo}}` turns a template field into a computed value — resolving automatically at render time without user input. This page collects the full range of patterns where `value` is useful. For the parameter reference (syntax, accepted types, dependency tracking, resolution priority), see [[fieldInfo value]].

## Contents
- [[#Static Literal Value]]
- [[#Text Expansion]]
- [[#Computed Fields]]
- [[#Readability: Aliasing Complex Expressions]]
- [[#Derived and Composed Fields]]
- [[#Hierarchical Value Injection]]
- [[#Redefining Built-In Fields]]
- [[#Redefining Built-In Fields with Conditionals]]
- [[#Embedding Rich Content]]
- [[#Block Template Composition]]

## Static Literal Value
Use `value` to define a field that always has a specific value unless overridden. For instance, default a `{{Status}}` field to "Draft" across all templates:

```handlebars
{{fieldInfo Status value="Draft"}}
```

If this is declared in a [[Global Block]] or [[Intro to System Blocks|System Block]], pair it with a YAML property:

```yaml
status: "{{Status}}"
```

Any template can then override that with a more specific value:

```md file="Resolution Template.md"
{{fieldInfo Status value="Resolved"}}
```

## Text Expansion
Use `value` to expand a short field name into a longer block of text. Add this to your [[Global Block]]:

```handlebars
{{fieldInfo LipSum value="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}}
```

Now `{{LipSum}}` inserts the full sentence into any instantiated content file — no prompting, no copy-paste.

## Computed Fields
Define a field whose value is always computed from an expression. The field behaves like an [[Custom Built-In Fields|implicit built-in]] — available wherever the field name appears, without user intervention:

```handlebars
{{fieldInfo InOneWeek value=(formatDate "YYYY-MM-DD" (dateAdd 7 now))}}
```

The value resolves at [[Instantiation]] because all dependencies (`now`, `dateAdd`, `formatDate`) are available at that point. Declared in the [[Global Block]], `{{InOneWeek}}` becomes available in every template across the vault. See [[Global Block and Field Values]] for a detailed discussion of this pattern.

## Readability: Aliasing Complex Expressions
Give a complex expression a short, readable name. Instead of repeating `{{firstName}} {{lastName}}` throughout a template, define it once:

```handlebars
{{fieldInfo FullName value="{{firstName}} {{lastName}}"}}

# {{FullName}}
By {{FullName}}
```

The expression evaluates fresh each time the field is rendered. If either `{{firstName}}` or `{{lastName}}` is not known during [[Instantiation]], the `{{fieldInfo}}` entry remains in the [[WIP Stage|WIP Content File]] until [[Finalization]]. At that point, if either part is undefined, the output degrades gracefully to whatever is resolved.

## Derived and Composed Fields
Build new fields from existing ones — URLs, formatted strings, Markdown links:

```handlebars
{{fieldInfo ISBN-URL value="https://isbnsearch.org/isbn/{{ISBN}}"}}
{{fieldInfo AuthorAtWikipedia value=(wikipedia Author Author)}}
```

`ISBN-URL` silently provides a fully-formed URL wherever it's referenced. `AuthorAtWikipedia` generates a Markdown link to a Wikipedia search using whatever `Author` resolves to — or is empty if `Author` is not defined.

## Hierarchical Value Injection
[[Intro to System Blocks|System blocks]] can use `value` to inject folder-specific values into fields, making them available transparently to all templates in that folder's hierarchy.

A system block in a "Client Work" folder might declare:

```handlebars
{{fieldInfo Project value="Client Work"}}
{{fieldInfo BillingRate value=150}}
```

Any template instantiated under that folder receives `{{Project}}` and `{{BillingRate}}` without prompting. Templates deeper in the hierarchy can still override these by declaring their own `{{fieldInfo Project}}` — the most specific declaration wins.

For more examples with system blocks, see [[Using System Blocks and fieldInfo]]. See [[Global Block and Field Values]] for the vault-wide equivalent using the global block.

## Redefining Built-In Fields
`value` can override [[Built-In Fields|built-in fields]] entirely. The built-in's default formula is replaced at the priority level of the declaring source. Declared in the global block, the override applies vault-wide:

```handlebars
{{fieldInfo today value=(formatDate "MM/DD/YYYY")}}
```

This reformats `{{today}}` across all templates when included in the [[Global Block]]. See [[Global Block and Field Values#Example - Override Built-In Field|Override Built-In Field]] for a full discussion, and [[Modifying Built-In Field Behaviors]] for limitations, scoping, and prompting control.

> [!WARNING]
> Overriding built-in fields is a vault-wide change. Any template expecting the standard format will silently receive the override. Document overrides clearly.

## Redefining Built-In Fields with Conditionals
A more involved example: overriding `{{fileTitle}}` to enforce Zettelkasten-style timestamp IDs. Pairing it with an optional companion field keeps filenames both sortable and human-readable:

```handlebars
{{fieldInfo fileTitlePostFix "Describe this file (optional)"}}
{{fieldInfo fileTitle value="{{timestamp}}{{#if fileTitlePostFix}} - {{fileTitlePostFix}}{{/if}}"}}
```

When `fileTitlePostFix` is provided — say, "Meeting notes" — the file is named `20241113142530 - Meeting notes`. When left blank, the filename is just the timestamp. The `{{#if}}` block helper works inside a `value` string expression because [[Restricted Functionality Mode]] supports Handlebars block helpers.

> [!DANGER] INTERNAL NOTES
> **fileTitle + value=**: Unverified. Confirm that `value` on `{{fileTitle}}` actually sets the output filename, and that the `{{#if fileTitlePostFix}}` block helper inside the string expression evaluates correctly at instantiation time.

## Embedding Rich Content
The `value` parameter is not limited to simple strings. It can hold any text the template engine would otherwise write to the file — including multi-line plugin syntax like Dataview queries.

Declare a Dataview query as a named field in your [[Global Block]] or in a dedicated block:

```handlebars
{{fieldInfo CardsNeedingWork value="```dataview
TABLE file.ctime AS \"Date Added\"
FROM #NeedsWork
WHERE date(today) - file.mtime <= dur(30 days)
SORT file.cdate DESC
```"}}
```

Then reference it anywhere in your templates:

```handlebars
## Cards Still in Progress
{{CardsNeedingWork}}
```

The full Dataview block is inserted at render time — one definition, used across any template that includes the declaring block. Changing the query in one place updates every template that references `{{CardsNeedingWork}}`.

This pattern extends to any multi-line markdown content: callouts, table fragments, embedded images with CSS hooks, or repeated boilerplate sections.

> [!DANGER] INTERNAL NOTES
> **Multi-line strings and backtick escaping**: Verify that multi-line `value` strings with embedded fenced code blocks render correctly. Confirm that inner backticks and quotes do not require additional escaping beyond what is shown above.

## Block Template Composition
[[Block Templates|Block templates]] can use `value` to inject field values into a shared layout block — effectively parameterizing a shared visual or structural component from a domain-specific block.

Suppose a shared header block provides a banner image whose filename varies by template domain:

```md file="Root Level - Header.block"
![[{{BannerImage}}#bannerimg]]
```

Each domain-specific block sets the image by injecting a value before the shared block is included:

```md file="Thoughts - Header.block"
{{fieldInfo BannerImage value="Banners-Thoughts.png"}}
```

A template in the "Thoughts" domain then composes both:

```handlebars
{{> "Root Level - Header"}}
{{> "Thoughts - Header"}}
# {{fileTitle}}
This is a new Thoughts card...
```

At render time, `BannerImage` resolves to `"Banners-Thoughts.png"` before the layout block uses it, yielding:

```md
![[Banners-Thoughts.png#bannerimg]]
# My New Thought
This is a new Thoughts card...
```

The same `Root Level - Header` block works across all domains — each domain block simply injects the appropriate value. Adding a new domain means adding one block; the layout is never touched.

This differs from [[#Hierarchical Value Injection]] (which uses system blocks scoped to folders) in that it operates through explicit block composition — value injection is controlled by which block templates you include, not which folder a file lives in.

> [!DANGER] INTERNAL NOTES
> **Block ordering**: Confirm that a `value` set in one included block is visible to a subsequent included block within the same template render pass. This depends on whether the engine resolves values across blocks in declaration order.
