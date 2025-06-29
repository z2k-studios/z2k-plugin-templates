Z2K Template Fields use predefined "built-in" helper functions to format the data being entered into a field.  The current list of predefined helper functions are:

| Helper Function Name                              | Purpose                                                                                                                                                                                              | Parameters (beyond the field name)    |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **[[#Formatting Helper Functions\|FORMATTING:]]** |                                                                                                                                                                                                      |                                       |
| `format-date`                                     | Formats a date with a moment.js format string (see [[#format-date Helper\|format-date Helper]])                                                                                                      | `quoted-format-string`                |
| `format-string`                                   | Formats a string with additional text (see [[#format-string Helper\|format-string Helper]])                                                                                                          | `quoted-format-string`                |
| `format-string-to-upper`                          | Formats a string into all caps (see [[#format-string-to-upper Helper\|format-string-to-upper Helper]])                                                                                               | *(none)*                              |
| `format-string-to-lower`                          | Formats a string into all lowercase (see [[#format-string-to-lower Helper\|format-string-to-lower Helper]])                                                                                          | *(none)*                              |
| `format-string-spacify`                           | Converts a string collapsed of Spaces into a name with spaces.                                                                                                                                       |                                       |
| `format-string-trim`                              | Removes all preceding and trailing whitespace from a field (see [[#format-string-trim Helper\|format-string-trim Helper]])                                                                           | *(none)*                              |
| `format-string-raw`                               | Prevents any escaping of characters in the final output (default mode for text replacement is to escape markdown relevant characters)  (see [[#format-string-raw Helper\|format-string-raw Helper]]) | *(none)*                              |
| `format-string-bulletize`                         | Formats the source data (which may be multilined) into a bulleted list using dashes (see [[#format-string-bulletize Helper\|format-string-bulletize Helper]])                                        | `indentation-level` and `bullet-char` |
| `format-number`                                   | Formats a number with a format string                                                                                                                                                                | `quoted-format-string`                |
| `format-number-toFixed`                           | Formats a number to a fixed number of decimal places                                                                                                                                                 | `number-of-decimals`                  |
|                                                   |                                                                                                                                                                                                      |                                       |
| **LINKING:**                                      |                                                                                                                                                                                                      |                                       |
| `wikilink`                                        | Formats a field as if it were a wikilink (see [[#wikilink Helper]] below)                                                                                                                            | *(none)*                              |
| `wikilink-named`                                  | Formats a field as if it were a wikilink with an alternative name (see [[#wikilink-named Helper]] below)                                                                                             | `name`                                |
| `url`                                             | Formats a field as if it were a URL (see [[#url Helper]] below)                                                                                                                                      | *(none)*                              |
| `url-named`                                       | Formats a field as if it were a wikilink with an alternative name (see [[#url-named Helper]] below)                                                                                                  | `name`                                |
|                                                   |                                                                                                                                                                                                      |                                       |
| **PROMPTING:**                                    |                                                                                                                                                                                                      |                                       |
| `clear`                                           | Specifies that a field should clear itself if no data was provided (see [[9 - Miss Handling for Z2K Template Fields\|Miss Handling]] for more details)                                               |                                       |
| `preserve`                                        | Specifies that a field should preserve itself if no data was provided (see [[9 - Miss Handling for Z2K Template Fields\|Miss Handling]] for more details)                                            |                                       |
| `no-prompt`                                       | Specifies that a field should not be included in the UI to prompt the user for values.                                                                                                               |                                       |
| `required`                                        | Specifies that a field is required for input before proceeding. Note: if a default value is provided, then that is sufficient for proceeding forward                                                 |                                       |
|                                                   |                                                                                                                                                                                                      |                                       |
| **MISC:**                                         |                                                                                                                                                                                                      |                                       |
| `geocontext-basic`                                | Formats a [[GeoContext]]                                                                                                                                                                             | *(tbd)*                               |
|                                                   |                                                                                                                                                                                                      |                                       |


# Formatting Helper Functions
## format-date Helper
Z2K has a template field helper function called `format-date` for formatting date-time. It is one of the built-in formatting helpers implemented by Z2K. To use the helper function, use the following nomenclature:

```
{{format-date fieldname quoted-format-string}}
```

where:
	- `format-date` is the predefined name of the helper function for formatting dates
	- `fieldname` is the name of the field that will receive the data to be formatted
	- `quoted-format-string` is a hard coded string of how the date or time should be formatted
	

Examples:
- `{{format-date yesterday "YYYY-MM-DD"}}` -- This would output `2025-01-08`
- `{{format-date yearQuarter "YYYY-[Q]QQ"}}` -- This would output `2025-Q01`

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

## format-string-to-upper Helper
If you want to force the data being used for a Z2K Template Field to be rendered in all caps, use the `format-string-to-upper` Helper function:

```
{{format-string-to-upper fieldname}}
```

where:
	- `format-string-to-upper` is the predefined name of the helper function for formatting text to all caps
	- `fieldname` is the name of the field that will receive the data to be capitalized


## format-string-to-lower Helper
Use the `format-string-to-lower` Helper function to format a Template Field into all lowercase letters.

```
{{format-string-to-lower fieldname}}
```

where:
	- `format-string-to-lower` is the predefined name of the helper function for formatting text to all lowercase
	- `fieldname` is the name of the field that will receive the data to be capitalized

## format-string-spacify Helper
If you want to convert a collapsed string of words back into an expression with spaces, use this helper function. For instance, this will convert an expression `ThisIsACollapsedSentence` back into `This is a Collapsed Sentence`.

```
{{format-string-spacify fieldname}}
```

where:
	- `format-string-allcaps` is the predefined name of the helper function for formatting back into an expression with spaces.
	- `fieldname` is the name of the field that will receive the data to be capitalized


## format-string-trim Helper
If you want to trim any white space at the beginning or end of the text being provided to a field, use the `format-string-trim` Helper function:

```
{{format-string-trim fieldname}}
```

where:
	- `format-string-trim` is the predefined name of the helper function for trimming whitespace at the beginning and end of provided data.
	- `fieldname` is the name of the field that will receive the data to be trimmed

==todo: use fiddler to make sure this helper is actually even needed ==


## format-string-raw Helper
The `format-string-raw` Helper function prevents Z2K from escaping any special characters inside the provided data, instead inserting the raw data directly into the template file. In addition, and character literals in the string (e.g. `\n`) will be replaced by their actual literal values (e.g. in this instance a newline character).

```
{{format-string-raw fieldname}}
```

where:
	- `format-string-raw` is the predefined name of the helper function for inserting raw text
	- `fieldname` is the name of the field that will receive the data to be capitalized

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

# format-string-bulletize Helper
The `format-string-bulletize` Helper function will take a text and bulletize it (i.e. insert a `- ` at the beginning of each line.) This is particularly useful for multi-line text.

The nomenclature for the `format-string-bulletize` is:
`{{format-string-bulletize fieldname indentation-level bullet-char}}`

where:
	- `format-string-bulletize` is the predefined name of the helper function for bulletizing
	- `fieldname` is the name of the field that will receive the data to be bulletized
	- `indentation-level` is a numeric value for the number of spaces to insert before the bullet character
	- `bullet-char` is a string that specifies what type of bullet should be used (typically `"*"` or `"-"` )

## format-number Helper
The formatNumber helper formats a number using the [Numeral.js ↗](http://numeraljs.com/) library. Note that the value must be a number and the format must be a string

The nomenclature for the `format-number` is:

```
{{format-number fieldname quoted-format-string}}
```

where:
	- `format-number` is the predefined name of the helper function for formatting numbers
	- `fieldname` is the name of the field that will receive the data to be formatted
	- `quoted-format-string` is a hard coded string of how the number should be formatted.

Examples:
- `{{format-number MinutesWalked '0,0'}}` -- If the number 1400 is passed in for the `MinutesWalked` field, then it will output `1,400`


## format-number-toFixed Helper
Z2K includes a basic number formatter to help control how numbers are formatted when being passed into a field replacement. It uses the javascript function `toFixed` to format a number to a fixed number of decimal places.

The nomenclature for the `format-number-toFixed` is:

`{{format-number-toFixed fieldname number-of-decimal-places}}`

where:
	- `format-number-toFixed` is the predefined name of the helper function for formatting numbers to a fixed number of decimal places
	- `fieldname` is the name of the field that will receive the numeric data to be formatted
	- `number-of-decimal-places` is a hard coded number that is the number of decimal places the number should be formatted to. 

Examples:
- `{{format-number-toFixed Weight 0}}` -- If the number 158.56 is passed in for the `Weight` field, then it will output `158`

## wikilink Helper
The `wikilink` Helper function is a very frequently used helper function to format a piece of text as a wikilink.

The format for the helper function is:
```
{{wikilink fieldname}}
```

where:
	- `wikilink` is the predefined name used for converting fields to wikilinks
	- `fieldname` is the name of the field that will receive be outputted as a wikilink


## wikilink-named Helper

This is for `[[foo|bar]]` 


## url Helper

## url-named Helper


## geocontext-basic Helper


