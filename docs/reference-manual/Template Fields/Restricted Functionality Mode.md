---
sidebar_position: 50
aliases:
- restricted functionality mode
- restricted mode
- reduced-set
- reduced rendering
---
# Restricted Functionality Mode

Certain contexts within Z2K Templates operate in a **restricted functionality mode** where only a subset of the full template engine capabilities are available. This is because these contexts must be evaluated using a simplified rendering path rather than the full template rendering pipeline.

## When Is Restricted Functionality Mode Active?

Restricted functionality mode is active in the following contexts:

- **`prompt` parameters** in `{{field-info}}` — the prompt text shown to the user
- **`suggest` parameters** in `{{field-info}}` — the suggested default value
- **`fallback` parameters** in `{{field-info}}` — the value used when no input is provided
- **`value` parameters** in `{{field-info}}` — pre-set field values
- **`options` parameters** in `{{field-info}}` — select/multi-select choices
- **Template title rendering** — when the file title is computed from template expressions

## What Is Supported?

In restricted functionality mode, the following features **work normally**:

- **Field references** — `{{fieldName}}` resolves to its value from the current context
- **[[Built-In Fields]]** — `{{date}}`, `{{time}}`, `{{year}}`, etc.
- **Inline [[Helper Functions]]** — `{{helperName arg1 arg2}}` calls work, including both [[Built-In Helper Functions]] and [[User Defined Helper Functions|user-defined helpers]]
- **Nested helpers** — `{{outer (inner arg)}}` subexpressions work
- **Handlebars built-in block helpers** — `{{#if}}`, `{{#each}}`, `{{#unless}}`, `{{#with}}` work at the Handlebars level

## What Is Not Supported?

The following features are **not available** in restricted functionality mode:

- **`{{field-info}}` / `{{fi}}` declarations** — these are registered as no-ops. They won't cause errors, but they won't process metadata or affect field behavior. Defining field metadata inside a restricted context has no effect.
- **[[Block Templates]] (partials)** — `{{> block-name}}` syntax is not supported because block template partials are not registered in the restricted rendering context. Using this syntax will produce an error.
- **[[Template Comments]] line-aware removal** — comments are handled by Handlebars directly (stripped entirely) rather than Z2K Templates' line-aware removal logic.

## Why Does This Restriction Exist?

The restricted rendering path exists because these contexts need to evaluate template expressions embedded inside parameter values — strings like `prompt="Enter a name for {{projectType}}"`. These embedded expressions need access to the current field context and helper functions, but don't need (and can't meaningfully use) the full template infrastructure like block template resolution, field-info processing, or multi-pass rendering.


> [!DANGER] Notes for Review
> - The code comment at line 366 of `z2k-template-engine/src/main.ts` says "field-infos and blocks are not supported in reduced-set templates." Clarify whether "blocks" here means block templates (partials) or also Handlebars block helpers (`#if`, `#each`). Code analysis suggests block helpers DO work since they're native Handlebars, but this should be verified with tests.
> - ==Needs testing==: Verify that `{{#if}}` and `{{#each}}` actually work inside field-info parameters (e.g., `prompt="{{#if projectName}}Task for {{projectName}}{{else}}Task name{{/if}}"`). The Block Helpers page currently says they don't work in these contexts.
> - YAML frontmatter may also use restricted rendering — check whether field expressions in YAML values go through `reducedRenderContent` or the full pipeline.
> - Are there additional contexts where restricted mode applies beyond the ones listed? Search for all call sites of `reducedRenderContent` in the plugin source.
