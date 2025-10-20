---
sidebar_position: 20
doc_state: initial_ai_draft
title: field-info Syntax
sidebar_label: field-info Syntax
---
# field-info Syntax

The [[field-info Helper]] function has a number of parameters (aka options) that allow a user to control the prompting interface. These parameters can either be identified by their position within the `{{field-info}}`, by *naming* each parameter, or by a combination of both approaches.

## Overall structure

The overall helper structure is as follows:
> `{{field-info` ***fieldName*** ***[[optional-parameters]]***`}}`

where:
- `field-info` ==  the keyword for this helper function (required)
- ***fieldName*** == the field name that you are specifying prompting information for (required)
- ***optional-parameters*** == the [[field-info Parameters]] (see below)

## Specifying Parameters
The optional parameters range from prompting information to details on how to handle missing data. These parameters can be specified [[#Positional Parameters|positionally identified]], identified [[#Named Parameters|by name]], or a [[#Hybrid Parameters|hybrid of the two]].

### Positional Parameters
Positional Parameters are identified by the order that they are listed after the field name. You can not skip a parameter, but you can end providing parameters before the end of all possible parameters. Here is an example:

```md
{{field-info BookTitle "text" "Short title for this book?" "Untitled" "required"}}
```

The order they are accepted are as follows:
- **[[field-info fieldName|fieldName]]** :: the name of the field you are providing data for (required) 
- **[[field-info type|type]]** :: Type of field ("text", "number", "date", "datetime", "boolean", "singleSelect", "multiSelect", "titleText";)
- **[[field-info prompt|prompt]]** :: The prompt message to display; can use `{{fields}}` inside it
- **[[field-info default|default]]** :: The default field result to prefill in the prompt dialog box. Only accepted if "touched".
- **[[field-info miss|miss]]** :: The field result that will be used if the use never attempts to answer the prompt
- **[[field-info directives|directives]]** :: A comma separated list of directives (see [[#Directives|below]]) for advanced usage
- **[[field-info value|value]]** :: An advanced use case where you pre-fill a value into a field, skipping prompting

Note that the parameters are ordered in priority of importance and usage - thus allowing for shortened {{field-info}} entries.

> [!Tip] Positional Parameters == Brevity over Clarity
> Using Positional Parameters allows you to tightly provide the basic prompting information in a compact way. You sacrifice some clarity in the meaning of each parameter for the sake of brevity. 

### Named Parameters
By using Named Parameters for field-info, you specify each parameter by its name. The basic structure is `parameterName="value"`.  The name of the parameters matches parameter names in the list above (`type`, `prompt`, `default`, `miss`, `directives`,`value`). For example:

```md
{{field-info fieldName=BookTitle type="text" prompt="Short title for this book?" default="Untitled" miss="" directives="required"}}
```
Notes:
- Parameters cannot be duplicated
- Parameters can be listed in any order
- The name to use ==is case sensitive==, please use all lowercase parameter names

> [!Tip] Named Parameters == Clarity over Brevity
> Using Named Parameters makes your templates become more readable. There is no ambiguity what each parameter's value is. 

### Hybrid Parameters
You can use a hybrid approach that blends the two. You can start with unnamed parameters and then switch to named parameters (but just not back). In practice this is the easiest approach: let the `fieldName` and `type` go unnamed, then name the more advanced parameter you need to set. 

For example:
```md
{{field-info BookTitle "text" prompt="Short title for this book?" directives="required"}}
   ```

> [!Tip] Hybrid Approach == Clarity and Brevity Balanced
> Using a Hybrid approach is the sweet spot. We recommend you include the fieldName and type in your field-info parameters, and then name any remaining parameters you wish to use. This end result is both readable and succinct.

## Devilish Details
- When using named or hybrid parameters, you can only specify one named parameter per parameter type (i.e. you can't list two `prompt` parameters)



> [!DANGER] OPEN QUESTIONS / ACTION ITEMS
> 1) **Directive Catalog**. Please confirm the authoritative list of recognized directives the engine accepts and rejects. Current docs assume at least `no-prompt`; additional candidates (`required`, `auto`/`autofill`, `hidden`) are inferred from typical workflow needs and partial code hints.  
> 2) **Miss + Directives**. Should `miss` semantics ever be coupled to directives (e.g., `required` + `miss="clear"` hard‑errors on finalize)? Clarify UI behavior and error surfaces.  
> 3) **`field-output` Implementation**. Confirm whether it should: (a) render the resolved value *post‑prompt*, (b) accept the same argument grammar as `field-info`, and (c) honor formatting helpers inline (e.g., `{{format-date (field-output date) "YYYY‑MM‑DD"}}`).  
> 4) **Validation Messages**. Are there standard, user‑facing error strings for invalid directives or types we should document verbatim? If so, surface them here for consistency across UI and docs.


