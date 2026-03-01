---
sidebar_position: 80
aliases:
- restricted functionality mode
- restricted mode
- reduced-set
- reduced rendering
---
# Restricted Functionality Mode
Certain contexts within Z2K Templates operate in a **restricted functionality mode** where only a subset of the full template engine capabilities are available. This is because these contexts are evaluated using a simplified rendering path rather than the full template rendering pipeline.

## When Is Restricted Functionality Mode Active?
Restricted functionality mode is active whenever Z2K Templates evaluates an expression that is embedded inside a string parameter value, rather than being rendered as part of the main template body. Specifically, this applies to:

- All [[fieldInfo Parameters]]:
	- **`prompt` parameters** in `{{fieldInfo}}` — the prompt text shown to the user
	- **`suggest` parameters** in `{{fieldInfo}}` — the suggested default value
	- **`fallback` parameters** in `{{fieldInfo}}` — the value used when no input is provided
	- **`value` parameters** in `{{fieldInfo}}` — pre-set field values
	- **`options` parameters** in `{{fieldInfo}}` — select/multi-select choices
- All [[fileTitle and Variations]] — when the file title is computed from template expressions

Any expression that can be used in the main template body — including [[Block Helpers]] like `{{#if}}` and `{{#each}}` — can also be embedded inside these parameter strings, and will be evaluated in restricted mode when they appear there. The behavior of those expressions is the same as in the main body, with the exceptions listed in [[#What Is Not Supported in Restricted Functionality Mode?]] above.

### What About YAML Frontmatter?
YAML frontmatter is **not** in restricted functionality mode. YAML values are rendered through the main rendering pipeline using with the full set of helpers and the same expression preservation logic as the template body. The only difference is that [[Block Templates]] (partials) are not available in YAML — but all helpers, fields, and block helpers work normally.

## What Is Supported in Restricted Functionality Mode?
In restricted functionality mode, the following features **work normally**:

- **Field references** — `{{fieldName}}` resolves to its value from the current context
- **[[Built-In Fields]]** — `{{date}}`, `{{time}}`, `{{year}}`, etc.
- **Inline [[Helper Functions]]** — `{{helperName arg1 arg2}}` calls work, including both [[Built-In Helper Functions]] and [[Custom Helper Functions]]
- **Nested helpers** — `{{outer (inner arg)}}` subexpressions work
- **Handlebars built-in block helpers** — `{{#if}}`, `{{#each}}`, `{{#unless}}`, `{{#with}}` work because they are native to Handlebars (see [[#Block Helpers vs Block Templates]])
- **Custom [[Block Helpers]]** — user-registered block helpers also work, as user helpers are passed into the rendering context

## What Is Not Supported in Restricted Functionality Mode?
The following features are **not available** in restricted functionality mode:

- **[[Block Templates]] (partials)** — `{{> block-name}}` syntax is not supported because block template partials are not registered in the restricted rendering context. Using this syntax will produce an error.
- **`{{fieldInfo}}` / `{{fi}}` declarations** — these are registered as no-ops. They won't cause errors, but they won't process metadata or affect field behavior. Defining field metadata inside a restricted context has no effect.
- **[[Template Comments]] line-aware removal** — comments are handled by Handlebars directly (stripped entirely) rather than Z2K Templates' line-aware removal logic.

## Block Helpers vs Block Templates
This is an important distinction:

- **Block helpers** (`{{#if}}`, `{{#each}}`, `{{#unless}}`, `{{#with}}`, and custom block helpers) are Handlebars language constructs that control rendering flow. They **work** in restricted mode — and identically to how they work in the main template body, because both paths run through the same underlying Handlebars compiler.
- **[[Block Templates]]** (partials, `{{> block-name}}`) are Z2K's modular template fragments. They **don't work** in restricted mode because no partials are registered in the rendering context.

Note that the [[Conditionals#Known Issue|deferred field limitation on block helpers]] — where `{{#if}}` evaluates immediately rather than being preserved for later resolution — is also not a restricted mode issue. It is a bug in the shared preprocessing step (`preserveExpressionsPreprocess`) used by both rendering paths. Block helpers have the same deferred-field behavior everywhere.

## Why Does This Restriction Exist?
The restricted rendering path exists because these contexts need to evaluate template expressions embedded inside parameter values — strings like `prompt="Enter a name for {{projectType}}"`. These embedded expressions need access to the current field context and helper functions, but don't need (and can't meaningfully use) the full template infrastructure like block template resolution, fieldInfo processing, or multi-pass rendering.

### How It Works Internally
When a `{{fieldInfo}}` parameter like `prompt="{{#if projectName}}Task for {{projectName}}:{{else}}Task name:{{/if}}"` is parsed, the outer Handlebars parser treats the `prompt` value as a string literal. The inner `{{#if}}` syntax is preserved as raw text. Later, this string is passed through to Handlebars, where the `{{#if}}` is parsed and evaluated as a real block helper.

> [!DANGER] INTERNAL NOTES
> - ==Needs testing==: Verify that `{{#if}}` and `{{#each}}` actually work inside fieldInfo parameters (e.g., `prompt="{{#if projectName}}Task for {{projectName}}{{else}}Task name{{/if}}"`). Code analysis confirms the path is: `StringLiteral.value` → `reducedRenderContent` → `Handlebars.compile` → native `#if` evaluation. This should work, but needs empirical verification.
> - ==Needs testing==: Verify that custom block helpers (user-defined) also work in restricted mode. They are passed via `userHelpers` into `allHelpers`, so they should work.
> - The code comment at line 366 ("fieldInfos and blocks are not supported") has been clarified in the docs as referring to block templates, not block helpers. Consider updating the code comment to be more precise: "fieldInfo declarations and block templates (partials) are not supported in reduced-set templates."
> - Are there additional contexts where restricted mode applies beyond the ones listed? All call sites of `reducedRenderContent` in the plugin: template title rendering (line 2122), fieldInfo `value` resolution (lines 2234, 4050), `prompt` resolution (line 4057), `suggest` resolution (line 4058), `fallback` resolution (line 4059), `opts` resolution (line 4064).
