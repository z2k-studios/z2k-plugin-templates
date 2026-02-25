---
sidebar_position: 10
aliases:
- formatting overview
- data formatting overview
---
# Data Formatting Overview
When a template's `{{field}}` is replaced with data, you have several options for how that data appears in the final output. Z2K Templates presents a number of routes in which data can be formatted, from [[Built-In Helper Functions]] to [[Handlebars Support|Handlebars syntax]].
## Formatting Methods
Here are the different ways in which [[Field Data Sources|Field Data]] can be formatted:
1. **[[Default Formatting Rules|Default Formatting]]** – All data has a small amount of formatting applied automatically. This includes trimming behavior for text, default date formats, and character handling.
2. **[[Native Handlebars Formatting|Handlebars Syntax Features]]** – Handlebars provides built-in formatting capabilities like [[Whitespace Control|whitespace control]] with tildes, [[Unescaped Expressions|raw output]] with triple-mustache, and [[Conditionals|conditional rendering]].
3. **[[Formatting Functions|Z2K Helper Functions]]** – Z2K Templates ships with a library of helper functions for specific formatting tasks: `formatDate`, `formatNumber`, `formatString-*`, and more.
4. **[[Custom Helper Functions]]** – For the most advanced users, you can also provide custom helper function to do advanced formatting techniques. .

## Where Data Comes From
Formatting applies regardless of how data enters your template. Data sources include:
![[Field Data Sources#Known Data Sources]]

## When Formatting is Applied
Formatting happens during the render phase of the [[Lifecycle of a Template|template lifecycle]] – after field values are collected and before the final output is written. Each `{{field}}` expression is evaluated, formatted according to any helper functions applied, and then inserted into the output.

If a field uses [[Deferred Field Resolution|deferred resolution]], formatting occurs later – when the WIP file is finalized or continued.

## Quick Example
A single field value can pass through multiple formatting layers:

```handlebars
{{~formatDate "dddd, MMMM Do" now~}}
```

This expression:

1. Uses `~` tildes to trim surrounding whitespace (Handlebars feature)
2. Applies `formatDate` to convert the `now` timestamp into "Tuesday, January 14th"
3. The output replaces the entire expression in the final document

