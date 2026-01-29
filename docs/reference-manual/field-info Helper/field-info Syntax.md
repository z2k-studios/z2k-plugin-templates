---
sidebar_position: 20
doc_state: initial_ai_draft
title: field-info Syntax
sidebar_label: field-info Syntax
---
# field-info Syntax

The [[reference-manual/field-info Helper/field-info Helper]] function has a number of parameters (aka options) that allow a user to control the prompting interface. Parameters are all "named", meaning that you can specify a parameter with a `parameterName=` prefix. In addition the most commonly used parameters can be specified via their position. In the end, a [[#Hybrid Parameters|hybrid]] approach between [[#Named Parameters]] and [[#Positional Parameters]] is usually the best approach. 

## Overall structure

The overall helper structure is as follows:
> `{{field-info` ***fieldName*** ***[[optional-parameters]]***`}}`

where:
- `field-info` ==  the keyword for this helper function (required)
- ***fieldName*** == the field name that you are specifying prompting information for (required)
- ***optional-parameters*** == the [[field-info Parameters]] (see below)

## Specifying Parameters
The optional parameters range from prompting information to details on how to handle missing data. These parameters can be specified [[#Positional Parameters|positionally identified]], identified [[#Named Parameters|by name]], or a [[#Hybrid Parameters|hybrid of the two]].

## Named Parameters
Every parameter in `field-info` has a name that you use to specify which parameter is being set. The basic structure is `parameterName=value`.  The name of the parameters matches parameter names in the [[field-info Parameters#Overview|parameter list]] (`type`, `prompt`, `default`, `miss`, `directives`,`opts`, `value`). 

**Example:**
```md
{{field-info fieldName=BookTitle type="text" prompt="Short title for this book?" suggest="Untitled" fallback="" directives="required"}}
```

**Notes:**
- Parameters cannot be duplicated
- Parameters can be listed in any order
- Parameters that are not specified use their default value (see [[field-info Parameters]] for more details)
- The name to use ==is case sensitive==, please use all lowercase parameter names
- You can only specify one named parameter value per parameter name (i.e. you can't list two `prompt` parameters)

> [!Tip] Named Parameters == Clarity over Brevity
> Using Named Parameters makes your templates become more readable. There is no ambiguity what each parameter's value is. 

## Positional Parameters
The most commonly used parameters (`fieldName`, `prompt`, `suggest`, and `type`) can also be specified without a name prefix, and instead identified through their position in which they are listed after the field name.

Positional parameters are ordered in priority of importance and usage - thus allowing for shortened {{field-info}} entries. The order is as follows:

> `{{field-info` *([[field-info fieldName|fieldName]])* *([[field-info prompt|prompt]])* *([[field-info suggest|suggest]])* *([[field-info type|type]])*`}}`

**Examples:**
```md
{{field-info BookTitle "Title for this book?" "Persuasion" "text"}}
{{field-info BookAuthor "Author of this book?"}}
```

**Rules:**
- You can not skip over a positional parameter and specify another positional parameter
- You need not provide all positional parameters before switching to named Parameters in a [[#Hybrid Parameters]] approach


> [!Tip] Positional Parameters == Brevity over Clarity
> Using Positional Parameters allows you to tightly provide the basic prompting information in a compact way. You sacrifice some clarity in the meaning of each parameter for the sake of brevity. 

## Hybrid Parameters
You can use a hybrid approach that blends the two. You can start with positional parameters and then switch to named parameters (but just not back). In practice this is the easiest approach: let the `fieldName`, `prompt`, and `default` go unnamed, then name the more advanced parameters as needed. 

**Examples:**
```md
{{field-info BookTitle "Title for this book?" fallback="Untitled" directives="required"}}
{{field-info BookAuthor "Author for this book?" type="text" directives="required"}}
```

> [!Tip] Hybrid Approach == Clarity and Brevity Balanced
> Using a Hybrid approach is the sweet spot. We recommend you include the fieldName, prompt and optionally a default or type in your `field-info` parameters, and then name any remaining parameters you wish to use. This end result is both readable and succinct.


