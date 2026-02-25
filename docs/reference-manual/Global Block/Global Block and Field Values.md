---
sidebar_position: 35
aliases:
  - Global Block and Field Values
---
# The Global Block and Field Values
The [[Global Block and field-info|previous page]] covered using `{{field-info}}` in the global block to control how fields are prompted — their type, suggested values, and fallback behavior. This page covers a more advanced application: using the [[field-info value|field-info value Parameter]] to **assign computed values to fields globally**.

Rather than prompting the user, by using the [[field-info value|value]] parameter you define what a field *is* — an expression that evaluates automatically at creation time. Declared in the global block, these computed fields become available to every template in the vault without any explicit declaration in the template itself. 

With this technique, you can:
- [[#Examples - New Built-In Like Fields|Create new computed fields]] – 
	- The [[field-info value|value]] parameter on `{{field-info}}` lets you define entirely new computed fields – fields that don't require user input and resolve automatically. Declared globally, every template has access to them without any explicit inclusion. Technically they are not new [[Built-In Fields]], but they behave similarly. 
- [[#Example - Override Built-In Field|Redefine built-in fields]] – e.g., reformat `{{today}}` to use a different date format vault-wide


> [!WARNING] Advanced Technique
> Assigning computed field values in the global block is powerful but consequential: it makes your vault behave differently than a reader of any individual template would expect. A template referencing `{{InOneWeek}}` will resolve it silently — with no declaration in the template itself to explain where the value comes from. Use this technique deliberately, and document your global block so collaborators are not confused by fields that resolve without obvious origin.
>
> This is also a useful no-code alternative to [[User Defined Helper Functions|custom helpers]] for field-level customization: if you need a field that always evaluates to a simple computed expression, you can declare it once in the global block rather than writing a new helper function.

## Examples - New Built-In Like Fields
For instance, consider a field `{{InOneWeek}}` that always contains the date one week from now:

```handlebars
{{field-info InOneWeek value=(format-date "YYYY-MM-DD" (date-add 7 now))}}
```

`{{date-add 7 now}}` returns a date seven days out; `{{format-date}}` renders it as an ISO date string. With `directives="no-prompt"`, no prompt is shown – the value resolves silently. (Note: `value=` automatically applies `no-prompt`, so the directive is technically redundant here but harmless.)

> [!INFO] Use `value` suppresses prompting.
> When you use the [[field-info value|field-info value Parameter]], it automatically applies the `no-prompt` [[field-info directives|directive]] to the field. See the [[field-info value|value]] reference page for details.


Another example — a field that generates a Wikipedia search link for the `Author` field if it happens to be defined in the template:

```handlebars
{{field-info AuthorAtWikipedia value=(wikipedia Author Author)}}
```

`{{wikipedia Author Author}}` generates a Markdown link to a Wikipedia search for whatever `Author` resolves to, using `Author` as both the search term and the display text. If `{{Author}}` is not defined in the template, this field resolves to an empty value and can be safely ignored.

## Example - Override Built-In Field
The `value=` parameter can even redefine [[Built-In Fields|built-in fields]], giving you vault-wide control over their format or content. This example replaces the default `today` date format (`YYYY-MM-DD`) with a US-style format:

```handlebars
{{field-info today value=(format-date "MM-DD-YYYY")}}
```

`{{format-date}}` with no explicit date value defaults to the current date. Applied in the global block, this reformats `{{today}}` across every template in the vault.

> [!WARNING] Risk of Redefining Built-In Fields
> Overriding built-in fields globally affects all templates that use them, including any that expect the standard format. Use with care, and document the override so vault collaborators aren't surprised.

> [!DANGER] NOTES
> - **`AuthorAtWikipedia` when `Author` is undefined**: If `{{Author}}` is not defined in the current template, `(wikipedia Author Author)` receives an empty value and `AuthorAtWikipedia` resolves to an empty field. This is acceptable behavior — the field quietly produces nothing — but verify that finalization handles the null resolution path cleanly.
