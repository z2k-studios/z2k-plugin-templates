---
sidebar_position: 30
sidebar_class_name: z2k-code
sidebar_label: "{{google}}"
---
# google Helper

The `google` Helper function is a simple function that returns a markdown link that performs a google search.

The format for the helper function is:
```
{{google searchtext displaytext}}
```

where:
- `google` is the predefined helper name used for making google search links
- `searchtext` is a text string that will be passed to google for searching. 
	- Note: this text will be "slugified" automatically, so there is no need to first perform [[format-string-slugify]] on the search text.
- `displaytext` is the optional parameter of the text to display for the google search link. If not specified, then it will display the google searchtext URL

## Examples
If you have the following text in your template
```
Search for Article online: {{google ArticleTitle ArticleTitle}}
```

Then if the user provided "AI and Intelligence: Effects of AI on the Size of Individuals' Lexicons" as the Article Title, then it would output:

```
Search for Article online: [AI and Intelligence: Effects of AI on the Size of Individuals' Lexicons](https://google.com/search?q=ai-and-intelligence-effects-of-ai-on-the-size-of-individuals-lexicons)
```

## Shorthand
Under the covers, the helper function `{{google searchtext displaytext}}` is shorthand for:

`{{url "https://google.com/search?q={{format-string-sluggify searchtext}}" displaytext}}`

