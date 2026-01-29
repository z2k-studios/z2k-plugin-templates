---
sidebar_position: 20
sidebar_class_name: z2k-code
sidebar_label: "{{url}}"
---
# url Helper

The `url` Helper function converts a text URL string into a markdown formatted link. 

The format for the helper function is:
```
{{url fieldname displaytext}}
```

where:
- `url` is the predefined helper name used for converting a field into a markdown link
- `fieldname` is the name of the field that will be outputted as an internet link
- `displaytext` is an optional text parameter that contains the text to display for the link. If missing, then `displaytext` will be set to the same value as `fieldname`.

When the plugin replaces the Helper function in the final outputted file, it will have the format of:

```md
[displaytext](fieldvalue)
```

## Examples

Suppose the following template file excerpt:

```md title="Book Template.md"
{{field-info fileTitle suggest="{{format-string-file-friendly BookTitle}}"}}
{{field-info ISBN-URL value="https://isbnsearch.org/isbn/{{format-string-sluggify ISBN}}"}}

# Links to More Information
- Book URL :: {{url BookURL BookTitle}}
- Author URL :: {{url AuthorURL "Link to {{Author}}"}}
- ISBN URL :: {{url ISBN-URL "{{ISBN}}"}}

```

If the user the supplies the following data:
- Author : Walt Whitman
- Book Title : Leaves of Grass
- BookURL : https://whitmanarchive.org/published-writings/leaves-of-grass/1855
- Author URL : https://en.wikipedia.org/wiki/Walt_Whitman
- ISBN: 978-1-59853-097-1

It then will output

```md title="Leaves of Grass.md"

# Links to More Information
- Book URL :: [Leaves of Grass](https://whitmanarchive.org/published-writings/leaves-of-grass/1855)
- Author URL :: [Link to Walt Whitman](https://en.wikipedia.org/wiki/Walt_Whitman)
- ISBN URL :: [978-1-59853-097-1](https://isbnsearch.org/isbn/978-1-59853-097-1)

```

## Uses
In general, it is best to ask for data from the user without the use of wikilink brackets so that the original data can be kept "pure". Use the `{{wikilink}}` function to wrap a field value into a link to the field data. 


> [!TIP] Why not just add the brackets to the template?
> You may ask, why not just add the brackets around the field inside your template? For example:
> ```md Book Template.md
> - Link to [[{{BookAuthor}}]]
> ```
> You could do this, but if your template is stored as part of your vault, then you will be populating unresolved links with bogus document names. That is, in your list of known documents you will now see "`{{BookAuthor}}"` as a valid link inside your vault. By using the `{{wikilink}}` helper function, you prevent this bogus links in your template files from polluting your link list.


## Tips

> [!TIP] Sluggify Unstructured Data
> If you are building a URL using generic user inputted data, it is best to [[format-string-slugify|slugify]] the data before building a URL from it. This will ensure that any characters that are not URL friendly will get properly escaped.
> 
> For instance, suppose you want to make an automatic link to a Book Title at Powell's Books for purchase. You can construct a search URL with the structure `https://www.powells.com/books/search?query={{BookTitle}}`. But simply using `{{BookTitle}}` inside the URL will result in an issue for any spaces in the field data (or colons, etc.). By using the [[format-string-slugify]] helper function, you can fix this issue. Here is the full fix:
> 
> ```md title="Book Template.md"
>- Book Purchase Link: {{url "https://www.powells.com/books/search?query={{format-string-slugify BookTitle}} "{{BookTitle}}"}}
> ```


