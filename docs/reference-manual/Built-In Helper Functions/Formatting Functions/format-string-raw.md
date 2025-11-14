---
sidebar_position: 170
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-raw}}"
---
# format-string-raw Helper
The `format-string-raw` Helper function prevents Z2K from escaping any special characters inside the provided data, instead inserting the raw data directly into the template file. In addition, and character literals in the string (e.g. `\n`) will be replaced by their actual literal values (e.g. in this instance a newline character).

```
{{format-string-raw fieldname}}
```

where:
- `format-string-raw` is the predefined name of the helper function for inserting raw text
- `fieldname` is the name of the field that will receive the data to be capitalized

## Example
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

If instead the template has the text "`BeforeRaw {{format-string-raw Description}} AfterRaw`", it would result in:

```md
BeforeRaw This is some raw text that is already [[markdown formatted]], where I want to *preserve* that markdown formatting
And multilined. AfterRaw
```

