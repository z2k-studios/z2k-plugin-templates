---
sidebar_position: 10
---

## format-string Helper
Z2K allows you to provide a very simple string formatting helper function `format-string` for adding additional characters around a field. 

The nomenclature for the `format-string` is:

```
{{format-string fieldname quoted-format-string}}
```

where:
	- `format-string` is the predefined name of the helper function for formatting strings
	- `fieldname` is the name of the field that will receive the data to be formatted
	- `quoted-format-string` is a hard coded string of how the string should be formatted. It should contain a `{0}` to specify where the string should be inserted

Examples:
- `{{format-string PassingIdea "- {0}"}}` -- If the phrase "Life is Beautiful!" is passed in for the `PassingIdea` field, then it will put it into a bulleted list, i.e. output `- Life is Beautiful!`

Why use this instead of simply embedding the additional text directly in the template file? There are times when you want the additional text to be added, but only if valid data is being sent in.  

For instance, imagine having a program that will fill in data for the current temperature. If you create the template to read:
```
- Temperature:: {{Temperature}} degrees F
```

Then if there was not a temperature provided on a given day, the field could result in:
```
- Temperature::  degrees F
```

which is ambiguous at best.

Instead, you could use `format-string` to make the units conditional on if there is valid data:

```
- Temperature:: {{format-string Temperature "{0} degrees F"}}
```

