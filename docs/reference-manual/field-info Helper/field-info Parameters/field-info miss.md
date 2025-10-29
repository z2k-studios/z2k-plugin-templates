---
sidebar_position: 60
doc_state: initial_ai_draft
title: field-info miss Parameter
sidebar_label: miss
aliases:
- miss
- field-info miss Parameter
---
# field-info miss
The optional `miss` parameter in the [[field-info Helper]] allows you to specifies a string that will be assigned to a field if the user has failed to specify a value for it. This occurs at [[Finalizing a File|Finalization]] - before that point, the `miss` parameter is ignored.

## Syntax
The `miss` parameter can be specified with the `miss` keyword for the [[field-info Syntax#Named Parameters|Named Parameter]]. For example:

```md
{{field-info CharacterName prompt="Which Character?" miss="Unknown Character"}}
```

If you are using positional parameters, please see the [[field-info Syntax]] for more  [[field-info Syntax#Positional Parameters|information on its position]].


## Default miss Value
If omitted, then the plugin uses the [[Miss Handling]] procedure to determine what to do with the field. By default, this will result in using an empty string as the miss value - that is, all referenced to the `{{fieldName}}` will just simply be removed. But there are other ways to modify the final output using with [[field-info directives]] or [[Miss Handling YAML fields]]. See [[Miss Handling]] for more details.

## Embedded Fields and Helper Functions
The `miss` parameter allows for the use of embedded fields and helper functions directly into the `miss` string value. This allows for some advanced auto-filling of values in the event that a user fails to provide a response. 

## Example
Take for example a daily health log template that tracks, say, heart palpitations:
```md title="Template - Daily Health Log.md"
# Heart
- Number of Heart Palpitations :: {{fo NumPalpitations "number" prompt="How many heart palpitations did you have today? Leave blank if none." directives="clear"}}
- Possible Causes :: {{fo PossibleCauses prompt="Possible causes?" miss="{{if NumPalpitations}}N/A{{else}}Unknown Causes{{/if}}"}}
```
In this instance, the `miss` value for "Possible Causes" will either be "N/A" or "Unknown Causes" based on whether or not the user has entered in a number (or also the number 0) for the number of headaches. 

## Uses for the miss Parameter

### Use: YAML fields
Specifying `miss` values for fields that are used in the YAML frontmatter is highly advised. In this case, the assignment of an empty string to an YAML field can cause troubles down the road when indexing answers (e.g. data type issues). Therefore specifying a default miss value for a YAML entry is highly advisable. 

### Use:  Standardized Non-Answers
The more your templates can standardize non-answers by using the `miss` parameter, the more your resulting files can behave consistently, and thus be searchable/indexable. Depending on the context, `""`, `0`, `"N/A"`, `"Unspecified"` can all be valid and mean different things. By using a `miss` value, you can control explicitly what the "unspecified"  value is. 

Take for instance filling in a log value that is readable by dataView or Bases. If it is a ranking from 1 to 10, the default miss handling will leave that to be empty. By specifying a miss value of "0", you can now filter those files out from your query with a consistent value.

==How do you specify a numeric miss value?==

### Use: Prefilled Response
You can use the `miss` value as a pre-filled quick response to a field prompt. When combined with setting the `default` value to the same setting, then it obviates the need for the user to "[[Prompt Touching|touch]]" the value in order for the default to be accepted as the actual value. 

> [!TIP] Default + Miss
> An example of removing the need to "touch" the value for quick data entry is shown below. The trick is to provide a [[field-info miss|miss]] parameter with the same value as the [[field-info default|default]] parameter value.. 
> 
> For example:
> ```md
> {{field-info TypeOfDay prompt="What type of day was it?" default="Normal" miss="Normal"}}
> ```


## miss vs. default
![[field-info default#default vs. miss]]

## Finalize Directives and YAML Configuration Fields
The [[field-info Helper|field-info]] related helper functions also support the `directives` parameter (see [[field-info directives|directives]]). There are several "finalize" directives that also influence the processing of a missed field. Also, a template or block template can specify a default miss handling for all fields in a file - see [[YAML Configuration Fields]]. 

For the most complete and consolidated understanding of how to miss handling is performed, please see the documentation page [[Miss Handling]].



