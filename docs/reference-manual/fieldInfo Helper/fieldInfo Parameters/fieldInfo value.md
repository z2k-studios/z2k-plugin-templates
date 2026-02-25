---
sidebar_position: 80
doc_state: initial_ai_draft
title: fieldInfo value Parameter
sidebar_label: value
aliases:
  - value
  - fieldInfo value Parameter
  - computed fields
---
# fieldInfo value
The `value` parameter assigns a computed value to a field, bypassing user prompting. Rather than asking the user to fill in the field, you define what it *is* — a literal, an expression, or a reference to another field — and the engine resolves it automatically at render time.

When `value` is set, the field behaves like a built-in field: it evaluates, contributes its value to the template context, and never appears in the prompting interface.

## Contents
- [[#Syntax]]
- [[#Accepted Values]]
- [[#Automatic no-prompt]]
- [[#Dependency Tracking]]
- [[#Resolution Priority]]
- [[#Use Cases]]
- [[#Closing Comments]]

## Syntax
`value` is a [[fieldInfo Syntax#Named Parameters|Named Parameter]] — it cannot be specified positionally. It appears after the field name and any positional parameters:

```handlebars
{{fieldInfo fieldName value=<expression>}}
```

All of the following are valid:
```handlebars
{{fieldInfo Status value="Draft"}}
{{fieldInfo Version value=1}}
{{fieldInfo InOneWeek value=(formatDate "YYYY-MM-DD" (dateAdd 7 now))}}
{{fieldInfo FullName value="{{firstName}} {{lastName}}"}}
```

## Accepted Values
The `value` parameter accepts:
- **Quoted strings** — `value="Draft"` or `value="https://example.com/{{ISBN}}"`
- **Unquoted numbers** — `value=42`, `value=3.14`
- **Boolean keywords** — `value=true`, `value=false`
- **Field references** — `value=Author` (resolves to whatever `Author` currently contains)
- **Subexpressions** — `value=(helperName arg1 arg2)` — any helper call, including nested ones such as `value=(formatDate "YYYY-MM-DD" (dateAdd 7 now))`

Arrays are not a native literal type, but `value=(arr "a" "b" "c")` works — the [[arr]] helper returns a real array that is stored and passed through the value pipeline intact.

> [!NOTE] Restricted Functionality Mode
> The `value=` expression is evaluated using [[Restricted Functionality Mode]] — a simplified rendering path. Field references, built-in fields, inline helpers, nested subexpressions, and Handlebars block helpers (`{{#if}}`, `{{#each}}`) all work normally. What does not work: [[Block Templates]] (partials) and `{{fieldInfo}}` declarations embedded inside the expression (they are silently ignored). If your `value=` expression calls another helper that internally tries to use partials, it will fail. See [[Restricted Functionality Mode]] for the complete supported/unsupported feature list.

## Default Value
If `value` is omitted, the field has no computed value and behaves normally — the user is prompted as usual.

## Automatic no-prompt
Setting `value` automatically applies the [[fieldInfo directives#no-prompt|no-prompt]] directive. You do not need to write `directives="no-prompt"` explicitly — it is added by the engine and specifying it yourself is redundant (though harmless).

If you need the field to remain visible in the prompting interface despite having a `value` expression, use `directives="yes-prompt"` to override the implicit suppression. In that case, `value` supplies the pre-filled suggestion rather than computing the final value silently.

## Dependency Tracking
If the `value` expression references another field, the engine tracks that field as a dependency and defers computation until the dependency is available:

```handlebars
{{fieldInfo AuthorURL value="https://author-db.com/{{Author}}"}}
```

If `Author` is not yet resolved when `AuthorURL` is first encountered, the computation is deferred. Once `Author` resolves — from user input, another `value=`, through [[Finalization|finalization]],  or an external data source — `AuthorURL` is computed automatically. If `Author` is never provided, `AuthorURL` remains empty.

This means you can safely reference fields defined elsewhere in the template or in higher-priority sources without worrying about declaration order.

## Resolution Priority
When `value` is declared at multiple levels — for example, in the global block and also in the main template — the most specific source wins. The [[Global Block and fieldInfo#fieldInfo Resolution Order|fieldInfo resolution order]] determines which `value` expression is used:

`global block` < `system block` < `block template` < `main template`

So a main template's `value` overrides a system block's `value`, which overrides the global block's `value`. Only one `value` expression ever reaches the resolution step — the one from the highest-priority source that declared it.

For how `value` fits among all field data sources (external data, YAML properties, prompting, etc.), see [[Field Data Sources]].

## Use Cases

### Static Literal Value
You can use the `value` parameter to define a static field that always has a specific value unless it is overridden. For instance, you can default a field `{{Status}}` to always have the value of "Draft" with the below expression:

```handlebars
{{fieldInfo Status value="Draft"}}
```

If this is declared in a [[Global Block]] or [[Intro to System Blocks|System Block]], you can add it to the YAML frontmatter as a property:
```yaml
status: "{{Status}}"
```

Then, any template can override that with a new value that is more appropriate for that template:

```md file="Resolution Template.md"
{{fieldInfo Status value="Resolved"}}
```

### Text Expansion
 You can also use the `value` parameter  to auto expand out a field into a larger set of text. For instance, add this to your Global Block:

```handlebars
{{fieldInfo LipSum value="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}}
```

 and now you can use the field `{{LipSum}}`  in your templates to automatically insert the full sentence into any instantiated content file.

### Computed Fields
A common use of the `value` parameter is to define a field whose value is always computed from an expression. The field behaves like an [[Custom Built-In Fields|implicit built-in]] — available wherever the field name appears, without user intervention:

```handlebars
{{fieldInfo InOneWeek value=(formatDate "YYYY-MM-DD" (dateAdd 7 now))}}
```

Note that the resolution of the value occurs at the point of [[Instantiation]] in this instance, given that all dependent fields and helpers (e.g. `now`) are known at that time. 

When declared in the [[Global Block]], `{{InOneWeek}}` becomes available in every template across the vault. See [[Global Block and Field Values]] for a detailed discussion of this pattern. 

### Readability: Aliasing Complex Expressions
Give a complex expression a short, readable name. Instead of repeating `{{firstName}} {{lastName}}` throughout a template, define it once:

```handlebars
{{fieldInfo FullName value="{{firstName}} {{lastName}}"}}

# {{FullName}}
By {{FullName}}
```

The expression evaluates fresh each time the field is rendered. In this instance, if either of the fields `{{firstName}}` or `{{lastName}}` are not known during [[Instantiation]], then the `{{fieldInfo}}` entry will remain in the [[WIP Stage|WIP Content File]] until [[Finalization]]. At that point, if either part is undefined, the output degrades gracefully to whatever is resolved. 

### Derived and Composed Fields
Build new fields from existing ones -- URLs, formatted strings, Markdown links:

```handlebars
{{fieldInfo ISBN-URL value="https://isbnsearch.org/isbn/{{ISBN}}"}}
{{fieldInfo AuthorAtWikipedia value=(wikipedia Author Author)}}
```

`ISBN-URL` silently provides a fully-formed URL wherever it's referenced. `AuthorAtWikipedia` generates a Markdown link to a Wikipedia search using whatever `Author` resolves to — or is empty if `Author` is not defined.

### Hierarchical Value Injection
[[Intro to System Blocks|System blocks]] can use `value` to inject folder-specific values into fields, making them available transparently to all templates in that folder's hierarchy.

A system block in a "Client Work" folder might declare:

```handlebars
{{fieldInfo Project value="Client Work"}}
{{fieldInfo BillingRate value=150}}
```

Any template instantiated under that folder receives `{{Project}}` and `{{BillingRate}}` without prompting. Templates deeper in the hierarchy can still override these by declaring their own `{{fieldInfo Project}}` — the most specific declaration wins. 

For more examples with System Blocks, see [[Using System Blocks and fieldInfo]]. See the page [[Global Block and Field Values]] for the vault-wide equivalent using the global block.

### Redefining Built-In Fields
`value` can override [[Built-In Fields|built-in fields]] entirely. The built-in's default formula is replaced at the priority level of the declaring source. Declared in the global block, the override applies vault-wide:

```handlebars
{{fieldInfo today value=(formatDate "MM/DD/YYYY")}}
```

This reformats `{{today}}` across all templates when included in the [[Global Block]]. See [[Global Block and Field Values#Example - Override Built-In Field|Override Built-In Field]] for a full discussion, and [[Modifying Built-In Field Behaviors]] for limitations, scoping, and prompting control.

### Redefining Built-In Fields with Conditionals
A more involved example: overriding `{{fileTitle}}` to enforce Zettelkasten-style timestamp IDs. Pairing it with an optional companion field keeps filenames both sortable and human-readable:

```handlebars
{{fieldInfo fileTitlePostFix "Describe this file (optional)"}}
{{fieldInfo fileTitle value="{{timestamp}}{{#if fileTitlePostFix}} - {{fileTitlePostFix}}{{/if}}"}}
```

When `fileTitlePostFix` is provided — say, "Meeting notes" — the file is named `20241113142530 - Meeting notes`. When left blank, the filename is just the timestamp. The `{{#if}}` block helper works inside a `value=` string expression because [[Restricted Functionality Mode]] supports Handlebars block helpers.


## Closing Comments

> [!WARNING]
> Overriding built-in fields is a vault-wide change. Any template expecting the standard format will silently receive the override. Document overrides clearly.

To define entirely new fields that behave like built-ins — rather than overriding existing ones — see [[Custom Built-In Fields]].



> [!DANGER] NOTES
> - **fileTitle + value=**: The `fileTitle` override example is unverified. Confirm that `value=` on `{{fileTitle}}` actually sets the output filename, and that the `{{#if fileTitlePostFix}}` block helper inside the string expression evaluates correctly at instantiation time. If `value=` does not work on `fileTitle`, replace the example with `suggest=` and note the difference.
> - **timestamp format**: Confirm the exact output format of `{{timestamp}}` for use in filenames — specifically whether it produces a filesystem-safe string (no colons, slashes, etc.).
> - **Argument order for formatDate**: Examples in this page use `(formatDate "FORMAT")` (one arg, defaults to current date) or `(formatDate "FORMAT" dateExpression)` (format first, then date). Using reversed argument order produces unexpected output — confirm this is clearly documented on the [[formatDate]] reference page.
> - **fieldOutput and value**: The page states that `value` is supported on `fieldOutput`/`fo`. Verify this is implemented and works correctly in the current engine build.
> 

