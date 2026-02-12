---
sidebar_position: 80
aliases:
- raw blocks
- rawblock
- raw block
---
# Raw Blocks
In standard Handlebars, raw blocks (`{{{{rawblock}}}}...{{{{/rawblock}}}}`) prevent template processing inside the block – mustache expressions are treated as literal text rather than being evaluated. Z2K Templates recognizes the syntax but behaves differently.

For the standard Handlebars behavior, see the [Handlebars Raw Blocks documentation](https://handlebarsjs.com/guide/expressions.html#literal-segments).

## Known Issue: Raw Blocks Do Not Suppress Evaluation
==This is a **bug**. Raw blocks should prevent template processing of their contents, matching standard Handlebars behavior. Currently, the syntax highlighter recognizes raw block syntax but the template engine does not implement the semantics.==

In standard Handlebars, a raw block like this:

```handlebars
{{{{raw}}}}
  {{field}} is not processed
{{{{/raw}}}}
```

Would output the literal text `{{field}} is not processed` – the expression is not evaluated.

In Z2K Templates, expressions inside a raw block are still evaluated normally:

```handlebars
{{{{raw}}}}
  {{field}} is still processed
{{{{/raw}}}}
```

If `field` has the value `Hello`, the output is `Hello is still processed` – not the literal `{{field}}` text.

> [!WARNING]
> Do not rely on raw blocks to escape or protect template expressions in Z2K Templates. They do not currently suppress evaluation. This will be fixed in a future release.

## Alternatives for Literal Output
Until raw blocks are fixed, if you need literal mustache syntax to appear in your rendered output – for example, when documenting templates or including Handlebars examples in your notes – consider these alternatives:

- **Template comments** with the example in the comment text (though comments are removed on [[Finalization]])

> [!DANGER] Notes for Review
> - **This is a confirmed bug.** See GitHub issue in z2k-template-engine for tracking.
> - The syntax highlighter recognizes raw blocks at lines 3285-3299 of `z2k-plugin-templates/main.tsx`, including whitespace control variants (`{{{{~raw~}}}}`). However, the template engine does not implement raw block semantics.
> - The Handlebars library itself supports raw blocks natively. The likely cause is that Z2K's AST preprocessing step interferes with or strips the raw block markers before Handlebars can handle them. Investigation needed.
> - The use case of embedding template examples in documentation templates is legitimate and important.
> - **Code blocks**: Markdown fenced code blocks (`` ``` ``) do **not** protect expressions from template processing. The template engine operates on the raw text before Markdown rendering — it has no awareness of Markdown syntax. `{{expressions}}` inside code fences will be evaluated. ==Needs verification== — this is based on code analysis (no code block handling found in either `z2k-template-engine/src/main.ts` or `z2k-plugin-templates/src/main.tsx`), but should be confirmed with a test.
> - Previously this page listed code blocks as a safe alternative. That claim has been removed pending verification.
