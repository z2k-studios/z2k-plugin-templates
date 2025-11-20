---
sidebar_position: 50
sidebar_class_name: z2k-code
sidebar_label: "{{wikipedia}}"
---
# wikipedia Helper

The `wikipedia` Helper function is a simple function that returns a markdown link that performs a wikipedia search.

The format for the helper function is:
```
{{wikipedia searchtext displaytext}}
```

where:
- `wikipedia` is the predefined helper name used for making wikipedia search links
- `searchtext` is a text string that will be passed to wikipedia for searching. 
	- Note: this text will be "slugified" automatically, so there is no need to first perform [[format-string-slugify]] on the search text.
- `displaytext` is the optional parameter of the text to display for the wikipedia search link. If not specified, then it will display the wikipedia searchtext URL

## Examples
If you have the following text in your template
```
Author on Wikipedia: {{wikipedia BookAuthor "(wikipedia)"}}
```

Then if the user provided "Ludwig Wittgenstein" as the BookAuthor, then it would output:

```
Author on Wikipedia: [(wikipedia)](https://en.wikipedia.org/w/index.php?search=Ludwig-Wittgenstein)
```

## Shorthand
Under the covers, the helper function `{{wikipedia searchtext displaytext}}` is shorthand for:

`{{url "https://en.wikipedia.org/w/index.php?search={{format-string-sluggify searchtext}}" displaytext}}`

