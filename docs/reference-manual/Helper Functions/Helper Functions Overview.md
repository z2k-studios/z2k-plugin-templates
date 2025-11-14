---
sidebar_position: 10
aliases:
- Helper Function
- Helper
- Helpers
---
# Helper Functions Overview
In [Handlebars](https://handlebarsjs.com/guide/expressions.html#helpers) speak, some `{{fields}}` are similar to functions in that they perform actions in addition to providing data. These special fields are called "Helper Functions", or oftentimes just "Helpers".

To quote the Handlebars spec:

> A Handlebars helper call is a simple identifier, followed by zero or more parameters (separated by a space). Each parameter is a Handlebars expression that is evaluated.

## Syntax
A helper function's syntax is 
> `{{helper-function-name optional-parameters}}`

Where:
- `helper-function-name` is the name of the helper function being used
- `optional-parameters` are zero or more parameters separated by spaces. A parameter can be any Handlebars expression.

## Distinguishing Helpers from Fields
Distinguishing between a `{{field}}` (which is data) and a `{{helper-function}}` (which is an action) can take a little getting use to it. In general, Helpers take parameters that are separated by spaces. Thus, if you see a `{{field with spaces}}`, then that is a clear sign it is a Helper Function. 

In Z2K Templates will also using the naming conventions to help distinguish between helper functions and fields. Helpers use a dash (`-`) to separate words in the name of the helper (e.g. `format-string`) where fields simply collapse the spaces (e.g. `yearMonth`). See [[Naming Conventions]] for more details. 

## Example Helper Function
Here is a quick barebones but real Helper Function: 

```
{{wikilink LastName}}
```

In this case, `wikilink` is the name of a helper called [[wikilink]]. It is followed by a space, which indicates that it is a Helper Function and not just a single field. Then, `LastName` is a parameter to the helper, which in this case is a user-inputted field that will then be modified. In this instance, the template plugin will convert the value of the `{{LastName}}` into a wikilink by surroundingi it with `[[`square brackets`]]`.

## More Details
To learn more about building powerful Helpers, please see the following pages:
- [[Using Fields in Parameters]]
- [[Using Nested Helper Functions]]
- [[User Defined Helper Functions]]
