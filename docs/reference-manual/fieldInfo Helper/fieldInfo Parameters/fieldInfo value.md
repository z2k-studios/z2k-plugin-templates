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
> The `value` expression is evaluated using [[Restricted Functionality Mode]] — a simplified rendering path. Field references, built-in fields, inline helpers, nested subexpressions, and Handlebars block helpers (`{{#if}}`, `{{#each}}`) all work normally. What does not work: [[Block Templates]] (partials) and `{{fieldInfo}}` declarations embedded inside the expression (they are silently ignored). If your `value` expression calls another helper that internally tries to use partials, it will fail. See [[Restricted Functionality Mode]] for the complete supported/unsupported feature list.

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

If `Author` is not yet resolved when `AuthorURL` is first encountered, the computation is deferred. Once `Author` resolves — from user input, another `value`, through [[Finalization|finalization]],  or an external data source — `AuthorURL` is computed automatically. If `Author` is never provided, `AuthorURL` remains empty.

This means you can safely reference fields defined elsewhere in the template or in higher-priority sources without worrying about declaration order.

## Resolution Priority
When `value` is declared at multiple levels — for example, in the global block and also in the main template — the most specific source wins. The [[Global Block and fieldInfo#fieldInfo Resolution Order|fieldInfo resolution order]] determines which `value` expression is used:

`global block` < `system block` < `block template` < `main template`

So a main template's `value` overrides a system block's `value`, which overrides the global block's `value`. Only one `value` expression ever reaches the resolution step — the one from the highest-priority source that declared it.

> [!NOTE] External overrides take precedence over `value`
> Field data supplied externally — via [[URI Actions|URI parameters]] or a [[JSON Packages|JSON Package]] — overrides a `value` declaration, even one in the main template. If you pass `Author="Isaac Asimov"` from a URI and the template declares `{{fi Author value="Anonymous"}}`, the external value wins. This is intentional: it allows automation to pre-fill or override fields in templates that have defaults set via `value`.

For how `value` fits among all field data sources (external data, YAML properties, prompting, etc.), see [[Field Data Sources]].

## Use Cases
The `value` parameter enables a wide range of patterns — from simple constants to computed fields to parameterized block template composition. See [[fieldInfo value Use Cases]] for the full catalog with examples.

## Closing Comments

> [!WARNING]
> Overriding built-in fields in a global block is a vault-wide change. Any template expecting the standard format will silently receive the override. Document overrides clearly.

To define entirely new fields that behave like built-ins — rather than overriding existing ones — see [[Custom Built-In Fields]].



> [!DANGER] INTERNAL NOTES
> - **fileTitle + value**: The `fileTitle` override example is unverified. Confirm that `value` on `{{fileTitle}}` actually sets the output filename, and that the `{{#if fileTitlePostFix}}` block helper inside the string expression evaluates correctly at instantiation time. If `value` does not work on `fileTitle`, replace the example with `suggest` and note the difference.
> - **timestamp format**: Confirm the exact output format of `{{timestamp}}` for use in filenames — specifically whether it produces a filesystem-safe string (no colons, slashes, etc.).
> - **Argument order for formatDate**: Examples in this page use `(formatDate "FORMAT")` (one arg, defaults to current date) or `(formatDate "FORMAT" dateExpression)` (format first, then date). Using reversed argument order produces unexpected output — confirm this is clearly documented on the [[formatDate]] reference page.
> - **fieldOutput and value**: The page states that `value` is supported on `fieldOutput`/`fo`. Verify this is implemented and works correctly in the current engine build.
> 

