---
sidebar_position: 20
doc_state: initial_ai_draft
title: field-info prompt Parameter
sidebar_label: prompt
aliases:
- prompt
- field-info prompt Parameter
---

# field-info prompt parameter
The frequently used, but optional, `prompt` parameter in the [[reference-manual/field-info Helper/field-info Helper]] informs the Z2K Templates Plugin what message to display inside the [[Prompting Interface]]. 

## Syntax
The `prompt` parameter is the first parameter after that `fieldName` and as such, when used, it typically specified [[field-info Syntax#Positional Parameters|positionally]] (i.e. directly after the `fieldName` and without a named parameter format). For instance:

```md title="Sample prompt parameter"
{{field-info CharacterName "Which Character?" "Sherlock Holmes"}}
```

The `prompt` parameter can be specified with the `prompt` keyword for the [[field-info Syntax#Named Parameters|Named Parameter]] if you want greater clarity. For example:

```md title="Sample named prompt parameter"
{{field-info SupportingCharacter prompt="Supporting Character?" suggest="John Watson"}}
```

If you are using positional parameters, please see the [[field-info Syntax]] for more  [[field-info Syntax#Positional Parameters|information on its position]].

## Accepted Values
The `prompt` is always a string.

## Default prompt Value
If omitted, the default `prompt` value is the field name itself. The plugin will make its best attempt to "prettify" the field name for use in the prompting interface (e.g. similar to the output of the [[Built-In Helper Functions|built-in helper]] `{{format-string-spacify}}`).

## Embedded Fields
The `prompt` parameter allows you to use `{{fields}}` inside it. This is really useful for making a prompting interface that feels more natural. 

You can't go crazy with complex field entries (e.g. inserting a Block Template into a default value) - please see the article on [[Restricted Functionality Mode]] for field-info parameters. But you can do most everything else, including most helper functions. 

For instance, let's take the classic "Book Review" template. You can use a prompt that includes information from previously supplied fields to dynamically change the prompts for subsequent fields. 

```md title="Book Review Template.md"
# Summary
- Book Author :: {{fo BookAuthor "Who is the author of the book?" directives="required"}}
- Book Title :: {{fo BookTitle "What book did {{BookAuthor}} write?"}}
```

In this example, the prompt for the Title will automatically include the author's name as you type it into the Author field.

## Embedded Helper Functions
You can also use [[Built-In Helper Functions|built-in helpers]] in the prompt interface (again, some [[Restricted Functionality Mode|limitations]]).

Take for instance the previous example. Say you want to have a prompt for the title that handles the case where a user has not yet written an author's name in (and possible never will). You can use a simple `{{if}}` helper function to display an alternative prompt instead.

```md title="Book Review Template #2.md"
# Summary
- Book Author :: {{fo BookAuthor "Who is the author of the book?"}}
- Book Title :: {{fo BookTitle "{{#if BookAuthor}}What book did {{BookAuthor}} write?{{else}}What is the title of the book?{{/if}}"}}
```

%% ==Validate that this bad boy actually works== %%

> [!TIP] Readability and Usability
> These advanced `prompt` settings can seem like a bit much. But using customized prompts are a way to really add polish to the quality of your template files. Make use of prompts to:
> 1. Provide details of what exactly is being asked for.
> 2. Provide Tips on how to answer
> 3. Provide suggested answers to consider (or move these to the [[field-info suggest|suggest]] parameter)
> 4. Soften the otherwise quite utilitarian [[Prompting Interface]], welcoming users to provide as much detail as possible. 




