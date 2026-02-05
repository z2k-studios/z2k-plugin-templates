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

## Difference from Default Handlebars Behavior
In standard Handlebars, a raw block like this:

```handlebars
{{{{raw}}}}
  {{field}} is not processed
{{{{/raw}}}}
```

Would output the literal text `{{field}} is not processed` – the expression is not evaluated.

In Z2K Templates, raw block syntax is recognized by the [[Syntax Highlighting|syntax highlighter]] but **does not prevent template processing**. Expressions inside a raw block are still evaluated normally:

```handlebars
{{{{raw}}}}
  {{field}} is still processed
{{{{/raw}}}}
```

If `field` has the value `Hello`, the output is `Hello is still processed` – not the literal `{{field}}` text.

> [!WARNING]
> Do not rely on raw blocks to escape or protect template expressions in Z2K Templates. They do not suppress evaluation.

## Alternatives for Literal Output
If you need literal mustache syntax to appear in your rendered output – for example, when documenting templates or including Handlebars examples in your notes – consider these alternatives:

- **Template comments** with the example in the comment text (though comments are removed on [[Finalization]])
- **Code blocks** – fenced code blocks in Markdown are not processed by the template engine:

````md
```handlebars
{{this is literal text inside a code block}}
```
````

> [!DANGER] Notes for Review
> - The syntax highlighter recognizes raw blocks at lines 3285-3299 of `z2k-plugin-templates/main.tsx`, including whitespace control variants (`{{{{~raw~}}}}`). However, the template engine does not implement raw block semantics.
> - It's unclear whether this is intentional or an incomplete implementation. If it's a known limitation, it should be called out clearly. If it's a bug, it should be tracked.
> - Consider whether Z2K Templates should support raw blocks in the future – the use case of embedding template examples in documentation templates is legitimate.
> - Verify whether the Handlebars library itself handles raw blocks when Z2K compiles templates, or whether Z2K's preprocessing step strips the raw block markers before Handlebars sees them.
