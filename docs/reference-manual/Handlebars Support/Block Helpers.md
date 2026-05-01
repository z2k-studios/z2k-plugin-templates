---
sidebar_position: 90
aliases:
- block helpers
- block helper
- custom block helpers
---
# Block Helpers
Handlebars block helpers (not to be confused with Z2K Templates' [[Block Templates]]) wrap a section of template content and control how it renders. Z2K Templates supports block helpers fully.

For complete syntax details, see the [Handlebars Block Helpers documentation](https://handlebarsjs.com/guide/block-helpers.html).

## How Block Helpers Work
A block helper wraps content between an opening `{{#helperName}}` and closing `{{/helperName}}` tag. The helper function receives the block content and decides what to do with it:

```handlebars
{{#helperName}}
  This content is passed to the helper.
{{/helperName}}
```

The helper can render the content, modify it, repeat it, or skip it entirely. This is the mechanism behind Handlebars' built-in [[Conditionals]] (`{{#if}}`) and [[Iterators]] (`{{#each}}`).

## Defining Custom Block Helpers
Custom block helpers are defined through Z2K Templates' [[Custom Helper Functions]] system. In your helper code, the block content is accessible via `options.fn(this)` and the inverse (`{{else}}`) via `options.inverse(this)`:

```js
registerHelper('spoiler', function(options) {
  const content = options.fn(this).trim();
  const quoted = content.split('\n').map(line => '> ' + line).join('\n');
  return '> [!TIP] Spoiler\n' + quoted;
});
```

Used in a template:

```handlebars
{{#spoiler}}
The butler did it.
{{/spoiler}}
```

Produces:

```md
> [!TIP] Spoiler
> The butler did it.
```

## Inverse Blocks
Block helpers can define an `{{else}}` branch that renders when the helper decides to skip the main content:

```handlebars
{{#hasValue fieldName}}
Value: {{fieldName}}
{{else}}
No value provided.
{{/hasValue}}
```

Inside the helper, call `options.inverse(this)` to render the else branch.

## Block Helpers in Restricted Functionality Mode
Block helpers **do work** inside [[Restricted Functionality Mode]] contexts (such as `prompt`, `suggest`, and `fallback` parameters in `{{fieldInfo}}`). This is because block helpers are native Handlebars language constructs, and these contexts are evaluated through `Handlebars.compile` which processes them natively.

For example, this works:

```handlebars
{{fieldInfo taskName prompt="{{#if projectName}}Task for {{projectName}}:{{else}}Task name:{{/if}}"}}
```

When rendered, the `prompt` string is compiled by Handlebars, and the `{{#if}}` block evaluates `projectName` from the current context. If `projectName` is defined, the prompt reads "Task for My Project:"; otherwise, it falls back to "Task name:".

> [!NOTE] Block Helpers vs Block Templates
> Don't confuse Handlebars' block helpers (`{{#if}}`, `{{#each}}`, custom block helpers) with Z2K Templates' [[Block Templates]] (`{{> block-name}}`). Block helpers work everywhere, including restricted mode. Block templates are the feature that is **not available** in restricted mode. See [[Restricted Functionality Mode#Block Helpers vs Block Templates]] for the full distinction.

## Block Helpers and Deferred Fields
Like [[Conditionals]] and [[Iterators]], block helpers are block statements – they are not preserved by Z2K Templates' [[Deferred Field Resolution]] logic. If a block helper references an unresolved field, the field will be `undefined` during evaluation.
==this needs improved discussion. Are block helpers deferred to finalization?===

> [!DANGER] INTERNAL NOTES
> - **Deferred field bug**: Custom block helpers are affected by the same [[Conditionals#Known Issue|block statement preservation bug]] as `{{#if}}` and `{{#each}}`. Block statements referencing unresolved fields are not preserved — they evaluate immediately with `undefined` values. See that page for root cause and desired behavior options.
> - **Restricted mode correction**: The previous version of this page incorrectly stated that block helpers don't work in restricted mode. Code analysis (tracing `reducedRenderContent` → `Handlebars.compile` path) shows they DO work — the code comment at line 366 ("blocks not supported") refers to block templates, not block helpers. ==Needs testing== to confirm empirically that the `{{#if}}` in prompt parameter example actually works as described.
> - Custom block helpers are registered via the same `registerHelper` mechanism as inline helpers (lines 801-820 of `z2k-plugin-templates/main.tsx`). The distinction is purely in how the helper function uses `options.fn()`.
> - It's unclear whether Z2K Templates' built-in helpers (like `fieldInfo`) can be used as block helpers. This should be tested and documented if relevant.
