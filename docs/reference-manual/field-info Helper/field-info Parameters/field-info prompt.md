---
sidebar_position: 30
doc_state: initial_ai_draft
title: field-info prompt Parameter
sidebar_label: prompt
aliases:
- prompt
- field-info prompt Parameter
---

# field-info prompt
The optional `prompt` parameter in the [[field-info Helper]] informs the Z2K Templates Plugin what message to display inside the [[Prompting Interface]]. If omitted, the plugin will simply use the default. 
Human‑readable prompt text shown in the dialog. If omitted, the engine can fall back to the variable name or other heuristics.


Protip - reference other fields in your prompt


# field-info default
The `default` parameter in the [[field-info Helper]] specifies a string that represents the "default" value inside the [[Prompting Interface]].

## Syntax
The `default` parameter can be specified with the `default` keyword for the [[field-info Syntax#Named Parameters|Named Parameter]]. For example:

```md
{{field-info CharacterName prompt="Which Character?" default="Sherlock Holmes"}}
```

## Embedded Fields
Please note that the `default` parameter allows you to use `{{fields}}` inside it, thereby simplifying repetitive data entry and minimizing duplication errors. You can't go crazy with complex field entries (e.g. inserting a [[Block Templates|Block Template]] into a default value) - please see the article on [[Restricted Functionality Mode]]. But you can do most everything else, including most helper functions. 


> [!TIP] Simplified Data Entry
> Using embedded fields in your `default` prompt answer can lead to great simplification. For instance, say that you want to include a link to an Author's wikipedia page on a book review. You can present a default answer that includes a [[Linking Functions|linking helper function]] to perform a wikipedia search, but still allow the user to override and specify the actual answer:
> 
> ```md
> {{field-info WikipediaLink default="{{wikipedia BookAuthor}}"}}
> ```


## Uses
There are typically two ways in which the `default` parameter are used:
### Use: Prefilled Response
You can use the `default` value as a pre-filled quick response to a field prompt. Note, however, that the user will need to "[[Prompt Touching|touch]]" the value in order for the default to be accepted as the actual value. 

> [!TIP] Default + Miss
> One way to solve the need to "touch" the value for quick data entry is to provide a [[field-info miss|miss]] parameter with the same value. 
> 
> For example:
> ```md
> {{field-info TypeOfDay prompt="What type of day was it?" default="Normal" miss="Normal"}}
> ```

### Use: Guided Response
You can also use the `default` value to help guide the user on how to respond to the prompt. The [[Prompting Interface]] will pre-select the text allowing for quick replacement. For example:

```md
{{field-info HistoricFigureFullName default="John Wilkes Booth"}}
```

> [!TIP] Default Filenames
> In this way, the default response is very useful for the `{{fileTitle}}` [[Built-In Fields - File Data#Destination File Fields|built-in destination filename field]]. For instance, if you prefer to have your book reviews filenames be formatted as "*Title - Author*", you can provide that as a default and miss value:
> ```md
> {{field-info fileTitle default="{{BookTitle}} - {{BookAuthor}}" miss="{{BookTitle}} - {{BookAuthor}}"}}
> ```


## default vs. miss
The `default` value is similar to a `miss`, but logically separate:
- **Default values** are the pre-fed answer into the [[Prompting Interface]]. They do not actually become the value of the field unless the users [[Prompt Touching|touches]] the answer. 
- **Miss** values, on the other hand, are the value assigned to the field if no value was given by the user. This includes the instance where the user fails to [[Prompt Touching|touch]] the default answer in the prompting interface.

Separating the `default` value from the `miss` value allows you to make much more useful and streamlined prompting scenarios. For more information, please see [[Miss Handling]].

## default `default`
==The default `default` value (ha!) is `What is the value of {{fieldName}}?`== 