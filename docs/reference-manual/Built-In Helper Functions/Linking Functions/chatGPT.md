---
sidebar_position: 30
sidebar_class_name: z2k-code
sidebar_label: "{{chatGPT}}"
---
# chatGPT Helper

The `chatGPT` Helper function lets you create HTML links that will start a new chat using information in your template fields. 

The format for the helper function is:
```
{{chatGPT chattext displaytext}}
```

where:
- `chatGPT` is the predefined helper name used for starting a chatGPT Conversation
- `chattext` is a text string that will be passed to chatGPT to start a conversation. 
	- Note: this text will be "slugified" automatically, so there is no need to first perform [[format-string-slugify]] on the chat text.
- `displaytext` is the optional parameter of the text to display for the chatgpt link. If not specified, then it will display the chattext.

## Examples
Here is an example of adding ChatGPT discussion prompts directly into a book's note.
```
# Book Discussion Prompts
- {{chatGPT "In {{BookTitle}} by {{BookAuthor}}, what central paradox or tension drives the book’s philosophical or emotional core?" "Paradox Lens"}}
- {{chatGPT "How does {{BookAuthor}} use what is _not said_—omission, ambiguity, or silence—to shape meaning in {{BookTitle}}?" "Voice and Silence"}}
- {{chatGPT "What kind of moral or existential climate does {{BookTitle}} create, and how do its characters adapt or perish within it?" "Moral Weather"}}
- {{chatGPT "If you were a character in {{BookTitle}}, which one would most challenge your own worldview, and why?" "Mirror Test"}}
- {{chatGPT "How does {{BookTitle}} by {{BookAuthor}} treat time—linear, cyclical, fractured, or irrelevant—and what does that say about its understanding of human experience?" "Temporal Drift"}}

```

## Shorthand
Under the covers, the helper function `{{chatGPT chattext displaytext}}` is shorthand for:

`{{url "https://chatgpt.com/?prompt={{format-string-sluggify chattext}}" displaytext}}`

