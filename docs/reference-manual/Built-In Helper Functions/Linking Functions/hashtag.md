---
sidebar_position: 15
sidebar_class_name: z2k-code
sidebar_label: "{{hashtag}}"
---
# hashtag Helper

The `hashtag` Helper function will construct a hashtag entry using `{{handlebars}}` expressions, without the template file [[Template Pollution|polluting]] your vault's content files. 

Take for instance the template text:

```md "Book Template.md"
- Book Genre: #Book/Genre/{{ChosenGenre}}
```

While this text appears innocuous, it introduces a subtle [[Template Pollution|pollution]] into your vault. There will be an actual `#Book/Genre/{{ChosenGenre}}` hash tag in your global hashtag list. For more information on this, please see the dedicated page on [[Template Pollution]].

To avoid this template pollution, simply use the `{{hashtag}}` Helper Function:

```md "Book Template.md"
- Book Genre: {{hashtag "Book/Genre/{{ChosenGenre}}" }}
```

This string inside your template will no longer be recognized as a hashtag in your vault, and when the template is instantiated into an actual content file, it will resolve into an action hashtag. For instance, if the User chose "SciFi" for the `{{ChosenGenre}}` field, it would output:

```md "Bio of a Space Tyrant - Piers Anthony.md"
- Book Genre: #Book/Genre/SciFi
```


## Syntax 

The format for the helper function is:
```
{{hashtag hashtag-expression}}
```

where:
- `hashtag` is the predefined helper name used for constructing hashtags
- `hashtag-expression` is a string representing a hashtag, typically with one of more `{{handlebars}}` expressions (e.g. [[Helper Functions]], [[Template Fields]])
	- Note: **DO NOT include the preceding `#` hashtag**. It will be outputted by the helper function.


## Tips and Notes


> [!TIP] Always use for Templated Fields
> We highly recommend that you always use the `{{hashtag}}` helper function for constructing hashtags with `{{fieldNames}}` and `{{helperFunctions}}` - even if you are using [[Template File Extensions]] to hide your templates from Obsidian. 


> [!NOTE] Don't Go Crazy
> Please note that the `hashtag-expression` parameter to [[hashtag]] is subject to the [[Restricted Functionality Mode]] for field replacements. If you have a complex handlebars expression, you may need to tone its functionality down.

