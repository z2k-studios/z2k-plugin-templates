---
sidebar_position: 50
aliases:
- conditionals
- if
- unless
- else
---
# Conditionals
Handlebars provides `{{#if}}`, `{{#unless}}`, and `{{else}}` for conditional rendering. Z2K Templates passes these through to Handlebars without modification – but the interaction with [[Deferred Field Resolution]] creates an important subtlety worth understanding.

For complete syntax details, see the [Handlebars Conditionals documentation](https://handlebarsjs.com/guide/builtin-helpers.html#if).

## Quick Reference
Conditionals render or skip content based on whether a value is truthy or falsy:

```handlebars
{{#if fieldName}}
This renders when fieldName is truthy.
{{else}}
This renders when fieldName is falsy.
{{/if}}
```

`{{#unless}}` is the inverse – it renders when the value is falsy:

```handlebars
{{#unless fieldName}}
This renders when fieldName is falsy.
{{/unless}}
```

## Handlebars Truthiness
Handlebars treats the following as **falsy**: `false`, `undefined`, `null`, `""` (empty string), `0`, and `[]` (empty array). Everything else is truthy.

## Conditionals and Deferred Fields
This is where Z2K Templates' behavior diverges from what you might expect.

When a field has not yet been resolved – for example, during [[Instantiation]] when the user skips a prompt – standalone expressions like `{{fieldName}}` are preserved as-is in the output. The field stays in the content file for later resolution. This is [[Deferred Field Resolution]] in action.

Conditionals do **not** benefit from this preservation. When Handlebars encounters `{{#if fieldName}}` and `fieldName` is not in the current context, it evaluates the condition as `undefined` – which is falsy. The conditional's content is skipped, and the `{{else}}` branch (if any) is rendered instead.

### Example

Given this template:

```handlebars
{{#if projectLead}}
Lead: {{projectLead}}
{{else}}
No lead assigned.
{{/if}}
```

If `projectLead` has not been provided yet:
- The `{{#if}}` block evaluates `projectLead` as `undefined` (falsy)
- The `{{else}}` branch renders: `No lead assigned.`
- The conditional is gone from the output – it cannot be re-evaluated later

Compare this with a standalone field:

```handlebars
Lead: {{projectLead}}
```

Here, `{{projectLead}}` would be preserved as-is in the WIP content file, waiting for future resolution.

> [!WARNING]
> Conditionals are evaluated once and produce a final result. If a field used in a conditional hasn't been resolved yet, the conditional will treat it as falsy and the block will be permanently collapsed. Plan your template accordingly – ensure fields used in conditionals are resolved at the time the conditional is evaluated.

## Conditionals with Helpers
You can use helpers inside conditionals to build more complex conditions:

```handlebars
{{#if (eq status "active")}}
This project is active.
{{/if}}
```

The [[Built-In Helper Functions|comparison helpers]] (`eq`, `ne`, `lt`, `gt`, `lte`, `gte`) return boolean values and work naturally inside `{{#if}}` blocks. The same deferred-field caveat applies – if `status` is unresolved, `eq` receives `undefined` and the comparison fails.

## Nested Conditionals
Conditionals can be nested:

```handlebars
{{#if projectName}}
# {{projectName}}
{{#if projectLead}}
Lead: {{projectLead}}
{{/if}}
{{/if}}
```

Each level evaluates independently. If `projectName` is truthy but `projectLead` is not, only the inner block is skipped.

> [!DANGER] Notes for Review
> - The preservation logic in `preserveExpressionsPreprocess` (lines 1420-1424 of `z2k-template-engine/src/main.ts`) explicitly only preserves `MustacheStatement` and `SubExpression` nodes – `BlockStatement` is not included. This means conditionals around unresolved fields will always evaluate as falsy.
> - It's unclear whether this is intentional design or a limitation. If it's intentional, the rationale is likely that block content can't be meaningfully "preserved" since it contains structural decisions. Consider noting this as a design choice.
> - The `{{#unless}}` block has the same behavior – an unresolved field is `undefined`, which is falsy, so `{{#unless}}` would render its content for unresolved fields. This could be useful as a "field not yet filled" indicator but may surprise users.
