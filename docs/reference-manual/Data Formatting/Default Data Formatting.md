---
sidebar_position: 52
---

When Template Fields are replaced with their corresponding data, a small amount of formatting is applied by default:

# Text Fields: Trimming Whitespace
All preceding or trailing white space in provided text data is preserved and passed through to the field by default. If you want to remove this white space, use the [[Built-In Helper Functions#format-string-trim Helper|format-string-trim Helper]] function. 

Note: If you want to remove the preceding and trailing whitespace in the template text around the `{{field}}`, use the Handlebars `~` expression (see [[Custom Field Formatting#Handlebars Whitespace Formatting|Handlebars Whitespace Formatting]])

# Text Fields: Escaped Characters
==*Todo: Is this the right default? I'm thinking you want the raw format to be the default and to create a helper function for escaping markdown. Or do we just support the triple `{{{` handlebars as is done in handlebars.js*== 
Incoming text is interpreted as being not markdown aware and therefore, any markdown related characters are replaced with "escaped" versions of those characters using the `\` character. 

For example, if you had a field named `Description` with the value below
```json
{
  Description: "This is some raw text that is already [[markdown formatted]], where I want to *preserve* that markdown formatting\nAnd multilined."
}
```

Then, if a template has the text "`Before {{Description}} After`", it would result in:

```md
Before This is some raw text that is already \[\[markdown formatted\]\], where I want to \*preserve\* that markdown formatting\\nAnd multilined. After
```

If instead, you want any markdown characters to be preserved (i.e. not escaped) and any string literals (e.g. `\n`) to be resolved, then use the [[Built-In Helper Functions#format-string-raw Helper|format-string-raw Helper Function]].

Continuing the above example, if instead the template has the text "`BeforeRaw {{format-string-raw Description}} AfterRaw`", it would result in:

```md
BeforeRaw This is some raw text that is already [[markdown formatted]], where I want to *preserve* that markdown formatting
And multilined. AfterRaw
```

# Date and Time Fields: Default Format
By default, all automated date fields will use the format "YYYY-MM-DD" for formatting, and automated time fields will use the format "HH:mm". You can change these formats through [[Built-In Helper Functions#format-date Helper|Z2K Templates' format-date Helper function]].

Note: For date and time template fields being populated by the user's data (i.e. not one of the [[Built-In Fields|Automated Template Fields]]), it will simply use the format provided in the source material. 