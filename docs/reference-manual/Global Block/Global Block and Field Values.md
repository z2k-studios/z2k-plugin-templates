---
sidebar_position: 35
aliases:
  - Global Block and Field Values
---
# The Global Block and Field Values
The [[Global Block and fieldInfo|previous page]] covered using `{{fieldInfo}}` in the global block to control how fields are prompted — their type, suggested values, and fallback behavior. This page covers a more advanced application: using the [[fieldInfo value|fieldInfo value Parameter]] to **assign computed values to fields globally**.

Rather than prompting the user, by using the [[fieldInfo value|value]] parameter you define what a field *is* — an expression that evaluates automatically at creation time. Declared in the global block, these computed fields become available to every template in the vault without any explicit declaration in the template itself. 

With this technique, you can:
- [[#Examples - New Built-In Like Fields|Create new computed fields]] – 
	- The [[fieldInfo value|value]] parameter on `{{fieldInfo}}` lets you define entirely new computed fields – fields that don't require user input and resolve automatically. Declared globally, every template has access to them without any explicit inclusion. Technically they are not new [[Built-In Fields]], but they behave similarly. 
	- See also [[Custom Built-In Fields]] for more details
- [[#Example - Override Built-In Field|Redefine built-in fields]] – 
	- You can also use the [[fieldInfo value]]  parameter to redefine the existing built-in fields defined in the Z2K Templates plugin 
	- See the [[Modifying Built-In Field Behaviors]] page for more details. 


> [!WARNING] Advanced Technique
> Assigning computed field values in the global block is powerful but consequential: it makes your vault behave differently than a reader of any individual template would expect. A template referencing `{{InOneWeek}}` will resolve it silently — with no declaration in the template itself to explain where the value comes from. Use this technique deliberately, and document your global block so collaborators are not confused by fields that resolve without obvious origin.
>
> This is also a useful no-code alternative to [[Custom Helper Functions]] for field-level customization: if you need a field that always evaluates to a simple computed expression, you can declare it once in the global block rather than writing a new helper function. See [[Modifying Built-In Field Behaviors|Built-In Fields and Field-Info]].

## Examples - New Built-In Like Fields
For instance, consider a field `{{InOneWeek}}` that always contains the date one week from now:

```handlebars
{{fieldInfo InOneWeek value=(formatDate "YYYY-MM-DD" (dateAdd 7 now))}}
```

`{{dateAdd 7 now}}` returns a date seven days out; `{{formatDate}}` renders it as an ISO date string. With `directives="no-prompt"`, no prompt is shown – the value resolves silently. (Note: `value=` automatically applies `no-prompt`, so the directive is technically redundant here but harmless.)

> [!INFO] Using `value` suppresses prompting.
> When you use the [[fieldInfo value|fieldInfo value Parameter]], it automatically applies the `no-prompt` [[fieldInfo directives|directive]] to the field. See the [[fieldInfo value|value]] reference page for details.


Another example — a field that generates a Wikipedia search link for the `Author` field if it happens to be defined in the template:

```handlebars
{{fieldInfo AuthorAtWikipedia value=(wikipedia Author Author)}}
```

`{{wikipedia Author Author}}` generates a Markdown link to a Wikipedia search for whatever `Author` resolves to, using `Author` as both the search term and the display text. If `{{Author}}` is not defined in the template, this field resolves to an empty value and can be safely ignored.

## Example - Override Built-In Field
The `value=` parameter can even redefine [[Built-In Fields|built-in fields]], giving you vault-wide control over their format or content. This example replaces the default `today` date format (`YYYY-MM-DD`) with a US-style format:

```handlebars
{{fieldInfo today value=(formatDate "MM-DD-YYYY")}}
```

`{{formatDate}}` with no explicit date value defaults to the current date. Applied in the global block, this reformats `{{today}}` across every template in the vault.

> [!WARNING] Risk of Redefining Built-In Fields
> Overriding built-in fields globally affects all templates that use them, including any that expect the standard format. Use with care, and document the override so vault collaborators aren't surprised.

For limitations on built-in overrides — including why certain approaches fail — see [[Modifying Built-In Field Behaviors]].

> [!DANGER] NOTES
> - **wikipedia helper behavior**: When `{{Author}}` is not defined, `(wikipedia Author Author)` receives an empty value and `AuthorAtWikipedia` resolves to an empty string. This is acceptable — the field quietly produces nothing. Confirm finalization handles the empty resolution path cleanly and does not leave a `{{AuthorAtWikipedia}}` placeholder in the output.
> - **Scope of this page**: This page covers computed fields declared in the global block. For folder-scoped computed fields using system blocks, see [[Using System Blocks and fieldInfo]]. For creating custom built-in fields via JavaScript, see [[Custom Built-In Fields]].
