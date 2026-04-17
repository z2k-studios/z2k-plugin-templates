---
sidebar_position: 30
sidebar_class_name: z2k-code
aliases:
- Field Syntax
- Template Field Syntax
---
# Field Syntax
Z2K Templates uses a curly-brace syntax — borrowed from [Handlebars.js](https://handlebarsjs.com) — to embed fields in a template. This page discusses the syntax around specifying a field within the text of a template file. 
## Contents
- [[#In the Template Body]]
- [[#As Helper Parameters]]
- [[#Dot Notation]]
- [[#Special Forms]]

## In the Template Body
In a template file, a field is referenced by wrapping its name in double curly braces:

```md
{{fieldName}}
```

When the template is instantiated, Z2K replaces `{{fieldName}}` with the field's resolved value. The field name is case-sensitive.

## As Helper Parameters
The rule that trips up newcomers: curly braces are required in the template body, but disappear when a field is passed as a parameter.

Specifically, when a field is passed as an **argument to a helper function**, the curly braces are dropped:

```md
{{helperName fieldName}}
```

`fieldName` is not the literal text "fieldName" — it's a **reference** to the field by that name. The helper receives the field's resolved value. This is core Handlebars behavior: inside the outer `{{ }}`, bare unquoted words are field references.

To pass a **literal string** instead of a field reference, wrap it in double quotes:

```md
{{helperName "literal text"}}
```

The contrast is exact:
- `{{helper author}}` — passes the **value of the field** named `author`
- `{{helper "author"}}` — passes the **literal string** `author`
- `{{helper "{{author}}"}}` — passes a **string with the field value embedded within it**
	- In this last case, the field reference inside the quotes is resolved before the string is passed, and thus it yields a text string with the author field within it. If `{{author}}` is a field of type "text", then this will be equivalent to the first bullet. 
	- If author were of a different [[Field Types|field type]] (e.g. `{{helper "{{numField}}"}}`), note that using this format implies a conversion to text, whereas `{{helper numField}}` would preserve the numeric type of the parameter as it goes into the `helper` function. 
	
Parameters can be positional or named, and can mix field references and string literals freely:

```md
{{helper fieldA "some literal" fieldB}}
{{helper label=fieldA prefix="by "}}
```

> [!NOTE] Fields inside string parameters
> Z2K Templates also supports embedding field references inside string arguments using the `{{field}}` syntax within the string. For example: `{{helper "Written by {{author}}"}}`. See [[Using Fields in Parameters]] for the full treatment.

## Dot Notation
When input data contains nested objects, individual properties are accessed using dot notation — each `.` steps one level deeper into the object hierarchy.

```md
{{person.firstname}} {{person.lastname}}
```

In the template body, dot notation uses curly braces as usual. As a helper parameter, the same convention applies — no curly braces:

```md
{{helper person.firstname}}
```

Dot notation is most useful when working with structured data from [[JSON Packages]] or [[URI Actions]], where a single input object may carry multiple named properties. See [[JSON Field Data#Nested Objects and Dot Notation|Nested Objects and Dot Notation]] for an example.

> [!NOTE]
> The path base must be a literal field name. Computed expressions as path bases — e.g., `{{(lookup "key").child}}` — are not supported and will produce an error.

## Special Forms

### Template Comments
```md
{{! This is a comment }}
```

Comments are stripped from the output entirely. The created note will not contain them. Use them for in-template notes to yourself.

### Triple-Mustache
```md
{{{fieldName}}}
```

Outputs the field value without HTML escaping. Rarely needed in Obsidian, since Obsidian renders Markdown rather than HTML. See [[Unescaped Expressions]] for details.

### Whitespace Control
Appending `~` inside the braces trims surrounding whitespace on that side:

```md
{{~fieldName~}}
```

Useful for controlling line breaks and spacing in tightly formatted output. See [[Whitespace Control]].

> [!DANGER] INTERNAL NOTES
> - To output a literal `{{` without it being parsed as a field, use a Raw Block — see [[Raw Blocks]].

