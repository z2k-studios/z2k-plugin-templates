---
sidebar_position: 40
aliases:
- whitespace control
- tilde
- whitespace trimming
---
# Whitespace Control
Handlebars provides a whitespace control mechanism using tildes (`~`) inside expression delimiters. Z2K Templates fully supports this feature with no modifications to standard Handlebars behavior.

For complete details on the syntax, see the [Handlebars Whitespace Control documentation](https://handlebarsjs.com/guide/expressions.html#whitespace-control).

## Quick Reference
Tildes placed inside expression delimiters trim whitespace on the corresponding side:

- `{{~expression}}` – trims all whitespace **before** the expression
- `{{expression~}}` – trims all whitespace **after** the expression
- `{{~expression~}}` – trims whitespace on **both** sides

"Whitespace" here means spaces, tabs, and newlines between the expression and the nearest non-whitespace content.

## Example
Given this template with intentional blank lines:

```handlebars
Header

{{~field~}}

Footer
```

The tildes collapse the surrounding whitespace, producing:

```md
HeaderfieldValueFooter
```

Without tildes, the blank lines would be preserved:

```md
Header

fieldValue

Footer
```

## Whitespace Control Works Everywhere
Tildes can be combined with any Handlebars expression type:

| Expression Type | With Tildes |
|----------------|-------------|
| Regular field | `{{~field~}}` |
| Triple-mustache | `{{{~field~}}}` |
| Comment | `{{~! comment ~}}` |
| Long comment | `{{~!-- comment --~}}` |
| Block open | `{{~#if condition~}}` |
| Block close | `{{~/if~}}` |
| Partial | `{{~> blockName~}}` |

## Silent Helpers and Implicit Whitespace Handling
Some Z2K Templates helpers – known as [[Silent Helper Functions|silent helpers]] – produce no visible output. The most common is `{{field-info}}` (and its abbreviation `{{fi}}`), which declares metadata about a field but renders as an empty string.

Because these helpers output nothing, they can leave behind blank lines in your template. You might be tempted to use tildes to clean these up:

```handlebars
{{~field-info fieldName type="date"~}}
```

This works, but is usually unnecessary. Z2K Templates automatically removes the entire line during [[Finalization]] when a silent helper like `{{field-info}}` is the only content on that line – the same [[Template Comments#Difference from Default Handlebars Behavior|line-aware removal]] behavior that applies to [[Template Comments|comments]].

In practice, the cleanest approach is to place `{{field-info}}` declarations on their own lines and let Z2K Templates handle the whitespace for you:

```handlebars
{{field-info projectName type="text" prompt="Project name?"}}
{{field-info dueDate type="date" prompt="Due date?"}}
# {{projectName}}
Due: {{dueDate}}
```

> [!NOTE]
> Tildes are still useful with silent helpers when they share a line with other content and you want precise control over spacing – but for standalone declarations, Z2K Templates' automatic line removal is simpler.

> [!DANGER] Notes for Review
> - Whitespace control is standard Handlebars behavior with no Z2K-specific modifications. This page exists primarily to document the interaction with silent helpers and line-aware removal.
> - Verify that whitespace control tildes work correctly with `{{field-output}}` / `{{fo}}` as well.
> - The [[Silent Helper Functions]] page should cross-reference this page for whitespace guidance.
