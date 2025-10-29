---
sidebar_position: 70
doc_state: initial_ai_draft
title: field-info directives Parameter
sidebar_label: directives
aliases:
- directive
- directives
- field-info directives Parameter
---
# field-info directives Parameter

## Overview
%% This section is included in the [[field-info Cheat Sheet]] through a direct include %%
The [[field-info directives|directives]] parameter is a `[`list`]` of strings, with each string being one of the following directives:

- **Miss Handling Special Cases**:
	- '[[#finalize-default|finalize-default]]' :: Instructs the plugin to use the value of the [[field-info default|default]] string as the resultant value of the field if the user has not provided an answer
	- '**[[field-info directives#finalize-preserve|finalize-preserve]]**' :: Instructs the plugin to preserve the `{{field}}` entry in the final generated file if the user does not specify a value
	- '**[[field-info directives#finalize-clear|finalize-clear]]**' :: Directs the plugin to clear out the value of this field if no value is provided
- **Required**: 
	- '**[[field-info directives#required|required]]**' :: Tells the [[Prompting Interface]] that a field requires a value in order to finalize the card
	- '**[[field-info directives#not-required|not-required]]**' :: Tells the [[Prompting Interface]] that a field does not require a value in order to finalize the card
- **Prompting**:
	- '**[[field-info directives#no-prompt|no-prompt]]**' :: Directs the [[Prompting Interface]] to skip prompting the user for a field
	- '**[[field-info directives#yes-prompt|yes-prompt]]**' :: Directs the [[Prompting Interface]] to force the prompting of a user for a field

## Syntax
The `directives` parameter *must* be specified with the `directives` keyword as it is only a [[field-info Syntax#Named Parameters|Named Parameter]]. Example usage:

```md title="Sample directives parameter"
{{field-info NoteTitle directives=['required']}}
```

The entries in the directives `[`list`]` must be strings and one of the ones listed above. The string literals can be specified with single `'` or double `"` quotes. If multiple are being listed, then separate them with commas. For instance:

```md title="Sample multiple directives parameter"
{{field-info YourName "Your Name?" "[[Me]]" directives=['required','finalize-default']}}
```

## Accepted Values
The `directives` value must be a `[`list`]` of strings, with the strings being one of the ones listed [[#Overview|above]].

## Default directives Value
If omitted, the default `directives` for a user defined field is:

> `[ 'yes-prompt', 'not-required', 'finalize-clear' ] `

**Details:**
- While `finalize-clear` is the default directive for finalizing, please note that there are additional forces to control [[Miss Handling]]
- Please note that if you are using `{{field-info}}` with [[Built-In Fields]], they may have alternatives default directives.

## Directives
For more details on each directive, see below:

### finalize-default
The `'finalize-default'` specifies that, if the user has not provide a value for the field upon [[Finalizing a File|finalization]], the plug-in will use the value of the [[field-info default|default]] parameter.  

**Notes**:
- Please see [[Miss Handling]] for more details. It works hand in hand with the [[YAML Configuration Fields]].
- This is likely the most commonly used directive. 
- If no default is given then it will use the empty string. 

**When this is useful**: 
- If you have specified a field with a default response, you can use this directive to cause the default string to be the [[field-info miss|miss]] string as well. This saves data entry time and prevents errors.


---
### finalize-preserve
The `'finalize-preserve'` specifies that, upon [[Finalizing a File|finalization]], if the user has not provide a value for the field, the plug-in will "preserve" this field in the final output. That is, it will keep the existing `{{fieldName}}` entry in the final output. Please see [[Miss Handling]] for more details.

This is similar to setting the [[field-info miss|miss]] parameter to be that of its own field name - but this method is much preferred, as it is less ambiguous. 

**When this is useful**: 
- When you have fields that you want to persist long after finalization. 


---
### finalize-clear
The `'finalize-clear'` specifies that, upon [[Finalizing a File|finalization]], if the user has not provide a value for the field, the plug-in will "clear" this field in the final output. All references to the `{{fieldName}}` will be cleared out with an empty string. Please see [[Miss Handling]] for more details.

**Notes**:
- This is the default setting for user defined fields
- This is similar to setting the [[field-info miss|miss]] parameter to be `miss=""`.

**When this is useful**: 
- If you have specified a field with a different "finalize" directive, setting it back to `'finalize-clear'` resets it back to the default. 

---
### required
The `'required'` directive is a useful tool for forcing a field to be filled in by a user in the [[Prompting Interface]] before the new file can be [[Finalizing a File|Finalized]].

Important note: the `'required'` directive only makes a field required at the [[Finalizing a File|finalization]] step, and not the initial "submit" stages. See [[Deferred Field Resolution]] for more details. 

**When this is useful**: Required fields are great for:
- Ensuring that the minimal, most important fields for a template are filled out.
- Notifying the user which fields are most important. 
- If some fields are needed for others, then these fields can be marked as required to force the dependencies to be populated. 

---
### not-required
The `'not-required'` directive overrides a `'required'` directive and resets it back to the "not required" default. 

**When this is useful**: This is useful for when a `required` directive has been used on a field in a [[Block Templates|Block Template]] (or [[Intro to System Blocks|System Block]]) and you would like to over-rule it in your template file to force it to be optional once again.

---
### no-prompt
The `'no-prompt'` directive instructs the [[Prompting Interface]] to skip presenting a user interface query for this field. This effectively hides the field from the user, causing the field to only be filled in through some other means.

**When this is useful**: Suppressing prompting can be useful in these types of situations:
- When fields are being filled in through some other means, like through separate automated [[URI Calls]] or [[Command Lists]].
- Sometimes it is helpful to use [[System Blocks]] to define a field and its value, so that any templates lower in the [[Hierarchical Template Folders]] can use the values as if they were user-entered fields. In this case, you will want to suppress prompting for them.

---
### yes-prompt
The `'yes-prompt'` directive instructs the [[Prompting Interface]] to present the field in the user interface. This is the default mode, and as such, this directive is rarely used. 

**When this is useful**: This is useful for when a `no-prompt` directive has been used on a field in a [[Block Templates|Block Template]] (or [[Intro to System Blocks|System Block]]) and you would like to over-rule it in your template file to force it to still be made visible. 





