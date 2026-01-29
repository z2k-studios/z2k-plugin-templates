---
sidebar_position: 60
doc_state: initial_ai_draft
title: field-info fallback Parameter
sidebar_label: fallback
aliases:
- fallback
- field-info fallback Parameter
---
# field-info fallback
The optional `fallback` parameter in the [[reference-manual/field-info Helper/field-info Helper]] specifies a string that will be assigned to a field if the user has failed to specify a value for it. This occurs at [[Finalization]] - before that point, the `fallback` parameter is ignored.

## Syntax
The `fallback` parameter can be specified with the `fallback` keyword for the [[field-info Syntax#Named Parameters|Named Parameter]]. For example:

```md
{{field-info CharacterName prompt="Which Character?" fallback="Unknown Character"}}
```

If you are using positional parameters, please see the [[field-info Syntax]] for more [[field-info Syntax#Positional Parameters|information on its position]].

## Default fallback Value
If omitted, then the plugin uses the [[Fallback Behavior]] procedure to determine what to do with the field. By default, this will result in using an empty string as the fallback value - that is, all references to the `{{fieldName}}` will just simply be removed. But there are other ways to modify the final output using [[field-info directives]] or [[Fallback Handling YAML fields]]. See [[Fallback Behavior]] for more details.

## Embedded Fields and Helper Functions
The `fallback` parameter allows for the use of embedded fields and helper functions directly into the `fallback` string value. This allows for some advanced auto-filling of values in the event that a user fails to provide a response.

## Example
Take for example a daily health log template that tracks, say, heart palpitations:
```md title="Template - Daily Health Log.md"
# Heart
- Number of Heart Palpitations :: {{fo NumPalpitations "number" prompt="How many heart palpitations did you have today? Leave blank if none." directives="finalize-clear"}}
- Possible Causes :: {{fo PossibleCauses prompt="Possible causes?" fallback="{{if NumPalpitations}}N/A{{else}}Unknown Causes{{/if}}"}}
```
In this instance, the `fallback` value for "Possible Causes" will either be "N/A" or "Unknown Causes" based on whether or not the user has entered in a number (or also the number 0) for the number of headaches. 

## Uses for the fallback Parameter

### Use: YAML fields
Specifying `fallback` values for fields that are used in the YAML frontmatter is highly advised. In this case, the assignment of an empty string to a YAML field can cause troubles down the road when indexing answers (e.g. data type issues). Therefore specifying a fallback value for a YAML entry is highly advisable.

### Use: Standardized Non-Answers
The more your templates can standardize non-answers by using the `fallback` parameter, the more your resulting files can behave consistently, and thus be searchable/indexable. Depending on the context, `""`, `0`, `"N/A"`, `"Unspecified"` can all be valid and mean different things. By using a `fallback` value, you can control explicitly what the "unspecified" value is.

Take for instance filling in a log value that is readable by dataView or Bases. If it is a ranking from 1 to 10, the default fallback behavior will leave that to be empty. By specifying a fallback value of "0", you can now filter those files out from your query with a consistent value.

==How do you specify a numeric fallback value?==

### Use: Prefilled Response
You can use the `fallback` value as a pre-filled quick response to a field prompt. When combined with setting the `suggest` value to the same setting, it obviates the need for the user to "[[Prompt Touching|touch]]" the value in order for the suggestion to be accepted as the actual value.

> [!TIP] Suggest + Fallback
> An example of removing the need to "touch" the value for quick data entry is shown below. The trick is to provide a [[field-info fallback|fallback]] parameter with the same value as the [[field-info suggest|suggest]] parameter value.
>
> For example:
> ```md
> {{field-info TypeOfDay prompt="What type of day was it?" suggest="Normal" fallback="Normal"}}
> ```


## fallback vs. suggest
![[field-info suggest#suggest vs. fallback]]

## Finalize Directives and YAML Configuration Fields
The [[reference-manual/field-info Helper/field-info Helper|field-info]] related helper functions also support the `directives` parameter (see [[field-info directives|directives]]). There are several "finalize" directives that also influence the processing of a field with no value. Also, a template or block template can specify default fallback behavior for all fields in a file - see [[YAML Configuration Properties]].

For the most complete and consolidated understanding of how fallback behavior is performed, please see the documentation page [[Fallback Behavior]].



