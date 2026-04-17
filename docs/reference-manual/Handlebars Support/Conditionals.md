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
Conditionals render or skip content based on whether a value is truthy or falsy (meaning it can accept a number of interpretations of "[[#Handlebars Truthiness|truthiness]]"):

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
Handlebars uses this approach for determining if a value is true or false:
- Handlebars treats the following as **falsy**: `false`, `undefined`, `null`, `""` (empty string), `0`, and `[]` (empty array). 
- Everything else is truthy.

## Conditionals and Deferred Fields
Standalone expressions like `{{fieldName}}` benefit from [[Deferred Field Resolution]] – when a field hasn't been resolved yet (for example, the user skips a prompt during [[Instantiation]]), the expression is preserved as-is in the output, waiting for later resolution.

**Conditionals should also benefit from this preservation**, but there is currently a bug where they do not. See the [[#Known Issue]] section below.

### Intended Behavior
The intended behavior is that conditionals referencing unresolved fields are **preserved in their entirety** – the `{{#if}}` block, its content, and any `{{else}}` branch should remain in the output as-is until either:

1. The field becomes defined (e.g., through "Continue filling note"), at which point the conditional is evaluated, or
2. [[Finalization]], at which point the conditional is evaluated with whatever values are available (applying [[Fallback Behavior]] rules)

This matches the philosophy of [[Deferred Field Resolution]] – structural decisions that depend on unknown data should be deferred alongside the data itself.

### Current Behavior (Bug)
Currently, conditionals are **not** preserved. When Handlebars encounters `{{#if fieldName}}` and `fieldName` is not in the current context, it evaluates the condition as `undefined` – which is falsy. The conditional's content is skipped, and the `{{else}}` branch (if any) is rendered instead. The block is permanently collapsed and cannot be re-evaluated later.

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

### Workaround: Use the `required` Directive
Until this bug is fixed, you can ensure fields used in conditionals are always resolved before the conditional is evaluated by marking them as [[fieldInfo directives#required|required]]:

```handlebars
{{fieldInfo projectLead directives="required"}}
{{#if projectLead}}
Lead: {{projectLead}}
{{/if}}
```

The `required` directive forces the user to provide a value before [[Finalization]], ensuring the conditional always has data to work with. See [[fieldInfo directives]] for details.

> [!WARNING]
> Until the deferred-conditional bug is fixed, ensure fields used in conditionals are resolved at the time the conditional is evaluated. The safest approach is to mark these fields as `required`.

## Conditionals with Helpers
You can use helpers inside conditionals to build more complex conditions:

```handlebars
{{#if (eq status "active")}}
This project is active.
{{/if}}
```

The [[Built-In Helper Functions|comparison helpers]] (`eq`, `ne`, `lt`, `gt`, `lte`, `gte`) return boolean values and work naturally inside `{{#if}}` blocks. The same deferred-field caveat applies – if `status` is unresolved, `eq` receives `undefined` and the comparison fails.

## Conditionals Inside fieldInfo Parameters
Conditionals can be embedded inside `{{fieldInfo}}` string parameters such as `prompt`, `suggest`, and `fallback`. This is possible because `{{#if}}` is a native Handlebars construct that is processed identically everywhere — inside fieldInfo parameter strings and in the main template body alike.

```handlebars
{{fieldInfo taskName prompt="{{#if projectName}}Task for {{projectName}}:{{else}}Task name:{{/if}}"}}
```

When the prompt is rendered, `projectName` is resolved from the current field context. If defined, the prompt reads "Task for My Project:"; otherwise "Task name:".

> [!NOTE]
> Don't confuse this with [[Block Templates]] (`{{> block-name}}`), which are **not** available inside fieldInfo parameter strings. See [[Restricted Functionality Mode#Block Helpers vs Block Templates]] for the distinction.

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

## Known Issue
> [!BUG] Block statements are not deferred when fields are unresolved
> **GitHub Issue**: [z2k-template-engine#2 — Block statements should participate in deferred field resolution](https://github.com/z2k-studios/z2k-template-engine/issues/2)
>
> **Root cause**: The `preserveExpressionsPreprocess` function (line ~1434 of `z2k-template-engine/src/main.ts`) only preserves `MustacheStatement` and `SubExpression` nodes. `BlockStatement` is not included in the preservation check. Additionally, the `visit` function only recurses into `Program` nodes, so it doesn't even attempt to visit statements nested inside block bodies.
>
> **Affected features**: This issue affects all Handlebars block built-ins that assess field values: `{{#if}}`, `{{#unless}}`, `{{#each}}`, `{{#with}}`, and any custom [[Block Helpers]].
>
> **Desired behavior (options)**:
> 1. **(Preferred)** Preserve the entire block statement (including body and inverse) when it references unresolved fields. Re-evaluate when the field becomes defined or at finalization.
> 2. **(Stopgap)** Still perform field replacement inside block statements, but defer all conditional/iterator evaluation to finalization only.
> 3. **(Minimum)** Document that fields used in block statements must be marked `required` via [[fieldInfo directives]].
>
> **`{{#unless}}` note**: An unresolved field is `undefined` (falsy), so `{{#unless}}` would incorrectly render its content for unresolved fields. This could act as a misleading "field not yet filled" indicator.
>
> **Test cases needed**:
> - `{{#if field}}` with unresolved field → should preserve entire block
> - `{{#if field}}` with resolved field → should evaluate normally
> - `{{#unless field}}` with unresolved field → should preserve, not render
> - Nested conditionals with mix of resolved/unresolved fields
> - Conditional inside a WIP file, then "Continue filling note" resolves the field → conditional should now evaluate
> - Conditional at finalization with fallback values applied
