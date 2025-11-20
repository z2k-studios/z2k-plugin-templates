---
sidebar_position: 10
sidebar_class_name: z2k-code
sidebar_label: "{{wikilink}}"
---
# wikilink Helper

The `wikilink` Helper function is a very frequently used helper function to format a piece of text as a wikilink (i.e. surround the text with `[[` and `]]`). Obsidian refers to wikilinks as "[internal links](https://help.obsidian.md/links)" This allows you to change a field into a link to another item in your vault.

The format for the helper function is:
```
{{wikilink fieldname displaytext}}
```

where:
- `wikilink` is the predefined helper name used for converting fields to wikilinks
- `fieldname` is the name of the field that will be outputted as a wikilink
- `displaytext` is the optional parameter of the text to display for the wikilink. If not specified it will not use an alternative text string.

The output of the function will be:
> `[[fieldvalue]]` *(if displaytext parameter is NOT provided)*, or
> `[[fieldvalue|displaytext]]` *(if displaytext parameter is provided)*

## Examples
Some examples:
- `{{wikilink yesterday}}` -- This would output `[[2025-01-08]]` if today was 2025-01-09.
- `{{wikilink today "today"}}` - This would output `[[2025-01-09|today]]`
- `{{wikilink BookAuthor}}` -- If the Book Author was "Walt Whitman", it would output `[[Walt Whitman]]`

## Uses
In general, it is best to ask for data from the user without the use of wikilink brackets so that the original data can be kept "pure". Use the `{{wikilink}}` function to wrap a field value into a link to the field data. 


> [!TIP] Why not just add the brackets to the template?
> You may ask, why not just add the brackets around the field inside your template? For example:
> ```md Book Template.md
> - Link to [[{{BookAuthor}}]]
> ```
> You could do this, but if your template is stored as part of your vault, then you will be populating unresolved links with bogus document names. That is, in your list of known documents you will now see "`{{BookAuthor}}"` as a valid link inside your vault. By using the `{{wikilink}}` helper function, you prevent this bogus links in your template files from polluting your link list.


## Tips

> [!TIP] Make Unstructured Data by File Friendly Before Wikilinking
> If you are building a wikilink using generic (i.e. unstructured) user inputted data, it is best to [[format-string-file-friendly|make the data be file friendly]] before building a wikilink from it. This will ensure that any characters that are not file friendly will get properly removed.
> 
> For instance, suppose you want to make an wikilink to an book title that a user specifies. Because it can be common to include characters like a `:` colon, this can cause errors in the resultant link name. 
> 
> The solution is simple, however. Simply use the [[format-string-file-friendly]] helper function to clean up the data before outputting it into a wikilink. For example:
> 
> ```md title="Author Template.md"
>- Most Famous Book : {{wikilink (format-string-file-friendly FamousBook)}} FamousBook}}
> ```
> 
> In this instance, if the user specifies "2001: A Space Odyssey", then the plugin will output
> 
> ```md title="Arthur C. Clarke.md"
>- Most Famous Book : [[2001 A Space Odyssey|2001: A Space Odyssey]]
> ```
> 


