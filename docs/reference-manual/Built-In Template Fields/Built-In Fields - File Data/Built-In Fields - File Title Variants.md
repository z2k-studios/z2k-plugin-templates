---
sidebar_position: 10
sidebar_label: "{{fileTitle}} + Variants"
aliases:
- fileTitle
- noteTitle
- cardTitle
---
## Destination File Fields

| Field           | Value to be inserted   | Example                          |
| --------------- | ---------------------- | -------------------------------- |
| `{{fileTitle}}` | The title of this file | `Leaves of Grass - Walt Whitman` |
| `{{noteTitle}}` | The title of this note | `Leaves of Grass - Walt Whitman` |
| `{{cardTitle}}` | The title of this card | `Leaves of Grass - Walt Whitman` |

These three built-in fields are **functionally identical** - they fill-in with the actual title of the card file/card/note being created. 

### Why Three Versions?
Why have three versions of the same field?
- In short, readability. Some people like to refer to files as files, some as notes (e.g. Obsidian's default name), some as cards (Z2K System's [[#What is a Card?|preferred name]]).
- Choose the version that maps into your own system's nomenclature. 
- If you do not strongly embrace a particular name for a file in Obsidian, we recommend that you use `{{fileTitle}}` as the version to use in your templates. 
	- Examples in the documentation all use `{{fileTitle}}`

### What about `{{title}}`?
What about Obsidian's `{{title}}` field?
- Obsidian itself supports a field called `{{title}}` that represents the same concept. 
- We have elected to not support that version directly because it is highly ambiguous in our opinion (e.g. think of a template for book notes - does `{{title}}` refer to the book or the note about the book?). 
- We also wanted to avoid any conflicts with both the Obsidian template's plugin and the Z2K plugin actively using the same field name. 

###  What is a Card?
- The [[The Z2K System|Z2K System]] calls a file a "card" with the assumption that a file in the Z2K System can contain information that is not typically referred to as a "*note*". Z2K embraces the idea that each file in the system is merely a "container", and uses the word "*card*" - like the index card of an old school zettelkasten - to reflect that.

### `{{field-info}}` and `{{fileTitle}}`
Even though `{{fileTitle}}` is a [[Built-In Template Fields|Built-In Field]], you can still use the `{{field-info}}` function on the field to change how it is prompted for. In fact, that is the most common use of the `{{fileTitle}}` field - to use [[field-info Helper|field-info]] to specify a default name for a file. 

> [!TIP] Naming your Resultant Files with User Entered Fields
> The most common use of the `{{fileTitle}}` built-in field is to use it within a [[field-info Helper]]. With `{{field-info}}`, you can specify the prompting and naming of any resultant file created from the template. 
> 
> Using these two built-ins together is extremely useful, and as such there is a dedicated page just for discussing what you can do with them: see [[Built-In Fields and Field-Info#fileTitle and field-info|fileTitle and field-info]].

