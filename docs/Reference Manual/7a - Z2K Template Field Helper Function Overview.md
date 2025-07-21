Z2K uses the "helper" functions defined in Mustache / [Handlebars](https://handlebarsjs.com/guide/expressions.html#helpers) to provide additional functionality when replacing Template Fields with data.

# Usage
See the [Handlebars](https://handlebarsjs.com/guide/expressions.html#helpers) specification on how to format use of Helper functions. To quote the Handlebars spec:

A Handlebars helper call is a simple identifier, followed by zero or more parameters (separated by a space). Each parameter is a Handlebars expression that is evaluated.

```
{{format-string-allcaps lastname}}
```

In this case, `format-string-allcaps` is the name of a helper, and `lastname` is a parameter to the helper, which in this case is the name of the template field to be replace. In this instance, the template will uppercase the `lastname` field from the input data.

## Usage - Nested Helper Functions
Please note that Helper functions can be nested using parenthesis. In Handlebars parlance, these are called [Subexpressions](https://handlebarsjs.com/guide/expressions.html#subexpressions). For instance, using the following field expression in a template:

```
{{url-named Book.URL (format-string-allcaps Book.Title)}}
```

will result in first capitalizing a field `{{Book.Title}}`, and then constructing a named URL using `{{Book.URL}}`. If the input data was:

```json
{
  book: {
    URL: "greatbooks.com/Tractatus",
    Title: "Tractatus Logico-Philosophicus"
  },
}
```

then the output of the above field expression would be

```markdown
[Tractatus Logico-Philosophicus](https://greatbooks.com/Tractatus)]
```

==#Todo: Not sure if the parenthesis will be viewed as nesting or literals==
==#Todo: Not sure if expressions are even support in the plugin==

# Z2K Custom Helper Functions
Note: currently, Z2K does not support registering custom functions (i.e. functions defined by the user). Stay tuned.

