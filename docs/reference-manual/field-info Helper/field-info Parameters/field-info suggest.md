---
sidebar_position: 30
doc_state: initial_ai_draft
title: field-info suggest Parameter
sidebar_label: suggest
aliases:
- suggest
- field-info suggest Parameter
---
# field-info suggest
The optional `suggest` parameter in the [[reference-manual/field-info Helper/field-info Helper]] specifies a string that pre-fills the input field in the [[Prompting Interface]].

## Syntax
The `suggest` parameter can be specified with the `suggest` keyword for the [[field-info Syntax#Named Parameters|Named Parameter]]. For example:

```md title="Sample suggest parameter"
{{field-info CharacterName prompt="Which Character?" suggest="Sherlock Holmes"}}
```

If you are using positional parameters, the `suggest` parameter directly follows the `prompt` parameter:

```md title="Sample positional suggest parameter"
{{field-info SupportingCharacter "Supporting Character?" "John Watson"}}
```

## Accepted Values
The `suggest` value can accept either a string, number, boolean or list - depending (and matching) the specified [[field-info type|type]] of the field.

```md title="Sample Suggestions"
{{field-info WorkoutDescription type="text" suggest="Exhausting"}}
{{field-info WorkoutDuration type="number" suggest=60}}
{{field-info HitPeakHR type="boolean" suggest=false}}
{{field-info TimeInPeak type="singleSelect" opts="15,30,45" suggest=15}}
{{field-info WorkoutType type="multiSelect" opts="cardio, aerobic" suggest="cardio"}}
{{field-info WorkoutDate type="date" suggest="{{today}}"}}
{{field-info WorkoutTime type="datetime" suggest="12:15 PM"}}
```

**Notes:**
- If the field [[field-info type|type]] is `singleSelect`, then the `suggest` value should match the same type as the items in the [[field-info opts|opts]] list.
- If the field [[field-info type|type]] is `date` or `datetime`, then the `suggest` value should be a string.

## Default suggest Value
If omitted, the `suggest` parameter defaults to an empty string - that is, no pre-filled value will appear in the prompt.

## Embedded Fields
Please note that the `suggest` parameter allows you to use `{{fields}}` inside it, thereby simplifying repetitive data entry and minimizing duplication errors. You can't go crazy with complex field entries (e.g. inserting a [[Block Templates|Block Template]] into a suggest value) - please see the article on [[Restricted Functionality Mode]] for an idea of what you can do. But you can do most everything else, including most helper functions (see next section).

## Embedded Helper Functions
Embedded helper functions can also be used in [[field-info Parameters]] (with a [[Restricted Functionality Mode|few restrictions]]) The syntax is the same as the text in your markdown file. 

> [!TIP] Simplified Data Entry
> Using embedded helper fields in your `suggest` value can lead to great simplification. For instance, say that you want to include a link to an Author's wikipedia page on a book review. You can present a suggested answer that includes a [[Linking Functions|linking helper function]] to perform a wikipedia search, but still allow the user to override and specify the actual answer:
> 
> ```md
> {{field-info WikipediaLink suggest="{{wikipedia BookAuthor}}"}}
> ```

> [!TIP] Automated Answers with Built-In Helper Functions
> You can get really creative with your suggested values by using the toolkit of available [[Built-In Helper Functions|built-in helper functions]]. 
> 
> For instance, say you want to include a link to a dedicated page for the author of a book/article. The below example takes an author's name from a prompted `{{Author}}` field, removes characters that would not make it friendly as a filename, and then adds the `[[` wikilink `]]` brackets around it  and presents a "|" alternative display that uses the entered `{{AuthorName}}` value as what to display in the link. 
> 
>  ```md
>  Link To Author Page : {{field-output AuthorPageInVault suggest="{{wikilink (format-string-file-friendly Author) Author}}"}}
>  ```

## Uses for the suggest Parameter
There are typically two ways in which the `suggest` parameter is used:
### Use #1: Prefilled Response
You can use the `suggest` value as a pre-filled quick response to a field prompt. Note, however, that the user will need to "[[Prompt Touching|touch]]" the value in order for the suggestion to be accepted as the actual value.  

> [!TIP] `suggest` + `finalize-suggest`
> One way to solve the need to "touch" the value for quick data entry is to use the `finalize-suggest` [[field-info directives|directive]]. This instructs the plugin to use the suggested value also as the [[Fallback Behavior|fallback]] value
> 
> For example:
> ```md
> {{field-info TypeOfDay prompt="What type of day was it?" suggest="Normal" directives="finalize-suggest"}}
> ```


> [!TIP] Suggested Filenames
> In this way, the suggested value is very useful for the `{{fileTitle}}` [[Built-In Fields - File Data#Destination File Fields|built-in destination filename field]]. For instance, if you prefer to have your book reviews filenames be formatted as "*Title - Author*", you can provide that as a suggest and fallback value:
> ```md
> {{field-info fileTitle suggest="{{BookTitle}} - {{BookAuthor}}" directives="finalize-suggest"}}
> ```


### Use #2: Guided Response
You can also use the `suggest` value to help guide the user on how to respond to the prompt. The [[Prompting Interface]] will pre-select the text allowing for quick replacement. For example:

```md
{{field-info FullName suggest="e.g. John Wilkes Booth"}}
```

## suggest vs. fallback
The two parameters `suggest` and `fallback` are similar, but logically separate:
- **Suggest values** are the pre-filled answer in the [[Prompting Interface]]. They do not actually become the value of the field unless the user [[Prompt Touching|touches]] the answer.
- **Fallback** values, on the other hand, are the value assigned to the field if no value was given by the user. This includes the instance where the user fails to [[Prompt Touching|touch]] the suggested answer in the prompting interface.

Separating the `suggest` value from the `fallback` value allows you to make much more useful and streamlined prompting scenarios, including special handling for "unspecified" data. For more information, please see [[Fallback Behavior]].

> [!TIP] Still think `suggest` and `fallback` are the same?
> If you still think that these two values should be in fact the same, then you are likely envisioning the [[#Use 1 Prefilled Response]] use case. If this is the way in which the majority of your templates are written in your vault, then you may wish to consider placing a default finalize [[YAML Configuration Properties]] in your [[Intro to System Blocks|System Blocks]] and setting it to be `finalize-suggest`.
>
> I.e. in your root level `Templates` folder, create/modify your `.system-block.md` file and insert into the YAML Frontmatter:
> ```yaml title=".system-block.md"
> z2k_template_default_fallback_handling: finalize-suggest
> ```

