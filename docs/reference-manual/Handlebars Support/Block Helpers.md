---
sidebar_position: 90
aliases:
- block helpers
- block helper
- custom block helpers
---
# Block Helpers
Handlebars block helpers wrap a section of template content and control how it renders. Z2K Templates supports block helpers, but with a limitation on where they can be used.

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
Custom block helpers are defined through Z2K Templates' [[User Defined Helper Functions|user-defined helper]] system. In your helper code, the block content is accessible via `options.fn(this)` and the inverse (`{{else}}`) via `options.inverse(this)`:

```js
registerHelper('spoiler', function(options) {
  return '<details><summary>Spoiler</summary>\n'
    + options.fn(this)
    + '\n</details>';
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
<details><summary>Spoiler</summary>
The butler did it.
</details>
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

## Limitation: Reduced-Set Contexts
Block helpers are **not supported** inside reduced-set template contexts. These are places where Z2K Templates evaluates expressions with a limited feature set:

- `prompt` parameters in `{{field-info}}`
- `suggest` parameters in `{{field-info}}`
- `fallback` parameters in `{{field-info}}`

In these contexts, only simple expressions and inline helpers work. Attempting to use a block helper will not produce the expected result.

For example, this will **not** work as intended:

```handlebars
{{field-info taskName prompt="{{#if projectName}}Task for {{projectName}}:{{else}}Task name:{{/if}}"}}
```

Instead, use inline helpers to achieve conditional logic in these contexts.

## Block Helpers and Deferred Fields
Like [[Conditionals]] and [[Iterators]], block helpers are block statements – they are not preserved by Z2K Templates' [[Deferred Field Resolution]] logic. If a block helper references an unresolved field, the field will be `undefined` during evaluation.

> [!DANGER] Notes for Review
> - The reduced-set limitation is documented in a code comment at line 366 of `z2k-template-engine/src/main.ts`: "field-infos and blocks are not supported in reduced-set templates."
> - The `spoiler` example uses raw HTML, which works in Obsidian's live preview and reading mode. Consider whether a more Markdown-native example would be preferable.
> - User-defined block helpers are registered via the same `registerHelper` mechanism as inline helpers (lines 801-820 of `z2k-plugin-templates/main.tsx`). The distinction is purely in how the helper function uses `options.fn()`.
> - It's unclear whether Z2K Templates' built-in helpers (like `field-info`) can be used as block helpers. This should be tested and documented if relevant.
