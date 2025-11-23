---
sidebar_position: 30
doc_state: initial_ai_draft
title: field-info default Parameter
sidebar_label: default
aliases:
- default
- field-info default Parameter
---
# field-info default
The optional `default` parameter in the [[reference-manual/field-info Helper/field-info Helper]] specifies a string that represents the "default" value inside the [[Prompting Interface]].

## Syntax
The `default` parameter can be specified with the `default` keyword for the [[field-info Syntax#Named Parameters|Named Parameter]]. For example:

```md title="Sample default parameter"
{{field-info CharacterName prompt="Which Character?" default="Sherlock Holmes"}}
```

If you are using positional parameters, the `default` parameter directly follows the `prompt` parameter:

```md title="Sample named default parameter"
{{field-info SupportingCharacter "Supporting Character?" "John Watson"}}
```

## Accepted Values
The `default` value can accept either a string, number, boolean or list - depending (and matching) the specified [[field-info type|type]] of the field.

```md title="Sample Defaults"
{{field-info WorkoutDescription type="text" default="Exhausting"}}
{{field-info WorkoutDuration type="number" default=60}}
{{field-info HitPeakHR type="boolean" default=false}}
{{field-info TimeInPeak type="singleSelect" opts="15,30,45" default=15}}
{{field-info WorkoutType type="multiSelect" opts="cardio, aerobic" default="cardio"}}
{{field-info WorkoutDate type="date" default="{{today}}"}}
{{field-info WorkoutTime type="datetime" default="12:15 PM"}}
```

**Notes:**
- If the field [[field-info type|type]] is `singleSelect`, then the `default` should match the same type as the items in the [[field-info opts|opts]] list. 
- If the field [[field-info type|type]] is `date` or `datetime`, then the `default` should be a string. 

## Default default Value
If omitted, the default `default` value (ha!) is an empty string - that is, it will not display any default value at all.

## Embedded Fields
Please note that the `default` parameter allows you to use `{{fields}}` inside it, thereby simplifying repetitive data entry and minimizing duplication errors. You can't go crazy with complex field entries (e.g. inserting a [[Block Templates|Block Template]] into a default value) - please see the article on [[Restricted Functionality Mode]] for an idea of what you can do. But you can do most everything else, including most helper functions (see next section).

## Embedded Helper Functions
Embedded helper functions can also be used in [[field-info Parameters]] (with a [[Restricted Functionality Mode|few restrictions]]) The syntax is the same as the text in your markdown file. 

> [!TIP] Simplified Data Entry
> Using embedded helper fields in your `default` prompt answer can lead to great simplification. For instance, say that you want to include a link to an Author's wikipedia page on a book review. You can present a default answer that includes a [[Linking Functions|linking helper function]] to perform a wikipedia search, but still allow the user to override and specify the actual answer:
> 
> ```md
> {{field-info WikipediaLink default="{{wikipedia BookAuthor}}"}}
> ```

> [!TIP] Automated Answers with Built-In Helper Functions
> You can get really creative with your default answers by using the toolkit of available [[Built-In Helper Functions|built-in helper functions]]. 
> 
> For instance, say you want to include a link to a dedicated page for the author of a book/article. The below example takes an author's name from a prompted `{{Author}}` field, removes characters that would not make it friendly as a filename, and then adds the `[[` wikilink `]]` brackets around it  and presents a "|" alternative display that uses the entered `{{AuthorName}}` value as what to display in the link. 
> 
>  ```md
>  Link To Author Page : {{field-output AuthorPageInVault default="{{wikilink (format-string-file-friendly Author) Author}}"}}
>  ```

## Uses for the default Parameter
There are typically two ways in which the `default` parameter are used:
### Use #1: Prefilled Response
You can use the `default` value as a pre-filled quick response to a field prompt. Note, however, that the user will need to "[[Prompt Touching|touch]]" the value in order for the default to be accepted as the actual value.  

> [!TIP] `default` + `finalize-default`
> One way to solve the need to "touch" the value for quick data entry is to use the `finalize-default` [[field-info directives|directive]]. This instructs the plugin to use the default answer also as the [[Miss Handling|miss]] result
> 
> For example:
> ```md
> {{field-info TypeOfDay prompt="What type of day was it?" default="Normal" directives="finalize-default"}}
> ```


> [!TIP] Default Filenames
> In this way, the default response is very useful for the `{{fileTitle}}` [[Built-In Fields - File Data#Destination File Fields|built-in destination filename field]]. For instance, if you prefer to have your book reviews filenames be formatted as "*Title - Author*", you can provide that as a default and miss value:
> ```md
> {{field-info fileTitle default="{{BookTitle}} - {{BookAuthor}}" directives="finalize-default"}}
> ```


### Use #2: Guided Response
You can also use the `default` value to help guide the user on how to respond to the prompt. The [[Prompting Interface]] will pre-select the text allowing for quick replacement. For example:

```md
{{field-info FullName default="e.g. John Wilkes Booth"}}
```

## default vs. miss
The two parameters `default` and `miss` are similar, but logically separate:
- **Default values** are the pre-fed answer into the [[Prompting Interface]]. They do not actually become the value of the field unless the users [[Prompt Touching|touches]] the answer. 
- **Miss** values, on the other hand, are the value assigned to the field if no value was given by the user. This includes the instance where the user fails to [[Prompt Touching|touch]] the default answer in the prompting interface.

Separating the `default` value from the `miss` value allows you to make much more useful and streamlined prompting scenarios, including special handling for "unspecified" data. For more information, please see [[Miss Handling]].

> [!TIP] Still think `default` and `miss` are the same?
> If you still think that these two values should be in fact the same, then you are likely envisioning the [[#Use 1 Prefilled Response]] use case. If this is the way in which the majority of your templates are written in your vault, then you may wish to consider placing a default finalize [[YAML Configuration Properties]] in your [[Intro to System Blocks|System Blocks]] and setting it to be `finalize-default`. 
> 
> I.e. in your root level `Templates` folder, create/modify your `.system-block.md` file and insert into the YAML Frontmatter:
> ```yaml title=".system-block.md"
> z2k_template_default_miss_handling : default
> ```

