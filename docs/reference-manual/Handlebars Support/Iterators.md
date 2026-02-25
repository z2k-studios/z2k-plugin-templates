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
The same [[Conditionals#Known Issue|known issue from Conditionals]] applies here. `{{#each}}` is a block statement, and block statements are currently not preserved by Z2K Templates' [[Deferred Field Resolution]] logic due to a bug.

If the variable passed to `{{#each}}` is unresolved, Handlebars receives `undefined`, treats it as an empty collection, and renders the `{{else}}` branch (or nothing). The iterator block is permanently collapsed – it will not be re-evaluated later.

The intended behavior is that `{{#each}}` blocks referencing unresolved fields should be preserved in the output until the data becomes available or [[Finalization]] occurs. See [[Conditionals#Known Issue]] for full details and workaround options.

> [!WARNING]
> Until the deferred-block bug is fixed, ensure that any data used with `{{#each}}` is available at the time of rendering. Unlike standalone `{{field}}` expressions, iterators are not currently deferred. The workaround is to mark the relevant fields as [[fieldInfo directives#required|required]].

## Iterators Inside field-info Parameters
Iterators can be embedded inside `{{field-info}}` string parameters. This is possible because `{{#each}}` is a native Handlebars construct that is processed identically everywhere — inside field-info parameter strings and in the main template body alike.

A more common pattern is building option lists inline using the [[arr]] helper directly in the `opts` parameter — no `{{#each}}` needed:

```handlebars
{{field-info statusTag type="select" prompt="Pick a status" opts=(arr "active" "paused" "done")}}
```

> [!NOTE]
> Don't confuse this with [[Block Templates]] (`{{> block-name}}`), which are **not** available inside field-info parameter strings. See [[Restricted Functionality Mode#Block Helpers vs Block Templates]] for the distinction.

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

## Iterators and Block Templates
You can include [[Partials]] (aka [[Block Templates]]) inside an `{{#each}}` loop. This is useful for repeating a structured fragment multiple times with different data.

### Example: Generating a List of Tasks
Suppose you have a block template called `task-block` that renders a single task checkbox:

**`task-block.block`:**
```handlebars
- [ ] {{this}}
```

You can use `{{#each}}` with the [[arr]] helper to generate multiple task entries:

**Main template:**
```handlebars
## Tasks
{{#each (arr "Write outline" "Draft introduction" "Add references")}}
{{> task-block}}
{{/each}}
```

**Rendered output:**
```md
## Tasks
- [ ] Write outline
- [ ] Draft introduction
- [ ] Add references
```

Inside the loop, `{{this}}` in the block template refers to the current array item. Each iteration invokes the same block template with a different value for `{{this}}`.

### Considerations
Z2K Templates renames partials uniquely internally during preprocessing to avoid collisions. When the same partial appears multiple times inside a loop, each iteration reuses the same compiled partial — which is typically fine for simple blocks.

> [!WARNING]
> If a block template contains [[fieldInfo Helper|fieldInfo]] declarations with prompted fields, the prompting behavior when used inside a loop depends on how [[Deferred Field Resolution]] and fieldInfo interact with repeated invocations. This pattern is not well-tested — verify with your specific templates.

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

This is particularly useful for data coming in through [[JSON Packages Overview|JSON Packages]]


> [!DANGER] Notes for Review
> - **Deferred field bug**: `{{#each}}` is affected by the same [[Conditionals#Known Issue|block statement preservation bug]] as `{{#if}}`. See that page for root cause, desired behavior options, and test cases. For iterators specifically, an unresolved field passed to `{{#each}}` is treated as an empty collection, collapsing the block permanently.
> - The interaction between `{{#each}}` and partials needs testing. The engine renames partials to `block_N` during preprocessing (line 1083 of `z2k-template-engine/src/main.ts`), but it's unclear how this works when the same partial appears multiple times inside a loop.
> - Data variables (`@index`, `@first`, `@last`, `@key`) are standard Handlebars and should work, but have not been explicitly verified in Z2K Templates.
> - Consider whether `{{#each}}` works with JSON data passed via [[URI, JSON, Command Queues|URI or JSON packets]] – this is likely the most common source of array data for iteration.
> - **Test cases for deferred `{{#each}}`**:
>   - `{{#each unresolvedField}}` → should preserve entire block
>   - `{{#each resolvedArray}}` → should iterate normally
>   - `{{#each unresolvedField}}` with `{{else}}` branch → should preserve, not render else
>   - `{{#each}}` with resolved field inside WIP → should evaluate on "Continue filling note"
