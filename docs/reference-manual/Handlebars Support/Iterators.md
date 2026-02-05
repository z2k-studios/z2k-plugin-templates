---
sidebar_position: 60
aliases:
- iterators
- each
- loops
---
# Iterators
Handlebars provides `{{#each}}` for looping over arrays and objects. Z2K Templates passes this through to Handlebars without modification – but as with [[Conditionals]], the interaction with [[Deferred Field Resolution]] and [[Partials]] introduces nuances worth knowing.

For complete syntax details, see the [Handlebars Each documentation](https://handlebarsjs.com/guide/builtin-helpers.html#each).

## Quick Reference
`{{#each}}` iterates over an array or object, rendering its block content once per item:

```handlebars
{{#each items}}
- {{this}}
{{/each}}
```

### Data Variables
Inside an `{{#each}}` block, Handlebars provides several data variables:

| Variable | Description |
|----------|-------------|
| `{{this}}` | The current item |
| `{{@index}}` | Zero-based index (arrays) |
| `{{@key}}` | Property name (objects) |
| `{{@first}}` | `true` for the first item |
| `{{@last}}` | `true` for the last item |

### Else Branch
An `{{else}}` block renders when the collection is empty or falsy:

```handlebars
{{#each tasks}}
- [ ] {{this}}
{{else}}
No tasks defined.
{{/each}}
```

## Iterators and Deferred Fields
The same caveat from [[Conditionals]] applies here. `{{#each}}` is a block statement, and block statements are not preserved by Z2K Templates' [[Deferred Field Resolution]] logic.

If the variable passed to `{{#each}}` is unresolved, Handlebars receives `undefined`, treats it as an empty collection, and renders the `{{else}}` branch (or nothing). The iterator block is permanently collapsed – it will not be re-evaluated later.

> [!WARNING]
> Ensure that any data used with `{{#each}}` is available at the time of rendering. Unlike standalone `{{field}}` expressions, iterators cannot be deferred.

## Iterators with the arr Helper
Z2K Templates provides the `arr` helper for constructing arrays inline. This is useful when you want to iterate over a fixed set of values without requiring external data:

```handlebars
{{#each (arr "Monday" "Tuesday" "Wednesday")}}
- {{this}}
{{/each}}
```

Produces:

```md
- Monday
- Tuesday
- Wednesday
```

Because `arr` constructs the array at render time, there is no deferred-field issue – the data is always available.

## Iterators and Partials
You can include [[Partials]] inside an `{{#each}}` loop. However, each partial invocation within the same template must resolve to a unique block – Z2K Templates renames partials internally to avoid collisions.

```handlebars
{{#each (arr "1" "2" "3")}}
{{> task-block}}
{{/each}}
```

> [!WARNING]
> When using partials inside iterators, be aware that each iteration invokes the same block template. If that block template contains prompted fields, the prompting behavior depends on how [[Deferred Field Resolution]] and [[field-info Helper|field-info]] declarations interact with the repeated invocations. Test this pattern with your specific templates to ensure the expected behavior.

## Iterating Over Objects
`{{#each}}` also works with objects, iterating over their properties:

```handlebars
{{#each metadata}}
- **{{@key}}**: {{this}}
{{/each}}
```

If `metadata` is `{ author: "Jane", version: "2.0" }`, this produces:

```md
- **author**: Jane
- **version**: 2.0
```

> [!DANGER] Notes for Review
> - The interaction between `{{#each}}` and partials needs testing. The engine renames partials to `block_N` during preprocessing (line 1083 of `z2k-template-engine/src/main.ts`), but it's unclear how this works when the same partial appears multiple times inside a loop.
> - Data variables (`@index`, `@first`, `@last`, `@key`) are standard Handlebars and should work, but have not been explicitly verified in Z2K Templates.
> - Consider whether `{{#each}}` works with JSON data passed via [[URI, JSON, Command Queues|URI or JSON packets]] – this is likely the most common source of array data for iteration.
