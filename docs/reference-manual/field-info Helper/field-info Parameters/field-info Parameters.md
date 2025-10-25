---
sidebar_position: 1
sidebar_folder_position: 40
doc_state: initial_ai_draft
title: field-info Parameters
sidebar_label: field-info Parameters
---
# field-info Parameters

# Overview
There are a number of [[field-info Parameters|Parameters]] that can be used with `{{field-info}}`:
- **[[field-info fieldName|fieldName]]** :: the name of the field you are providing data for (required) 
- **[[field-info type|type]]** :: Type of field ("text", "number", "date", "datetime", "boolean", "singleSelect", "multiSelect", "titleText";)
- **[[field-info prompt|prompt]]** :: The prompt message to display; can use `{{fields}}` inside it
- **[[field-info default|default]]** :: The default field result to prefill in the prompt dialog box. Only accepted if "touched".
- **[[field-info miss|miss]]** :: The field result that will be used if the use never attempts to answer the prompt
- **[[field-info directives|directives]]** :: A comma separated list of directives (see [[#Directives|below]]) for advanced usage
- **[[field-info value|value]]** :: An advanced use case where you pre-fill a value into a field, skipping prompting

# Details
## Syntax Details
To understand how to use them in the syntax of the helper function, see the page on [[field-info Syntax|syntax]].

## Tips

> [!TIP] Fields In Parameters
> Did you know that `{{field-info}}` parameters can have fields in them as well? The prompting interface will dynamically update as you provide data for fields referenced in the prompting and default answers.

## Devilish Details
Some little tiny details for those of you who like to touch the boundaries
- ALL parameters are strings, and thus need quotes around their values. 
	- ==If you want to use quotes inside a parameter, we suggest using…==
- Technically, all parameters are optional beyond the field name, and thus `{{field-info MyField}}` is a technically valid use of the helper function, but without any parameters, it has nothing to-do and thus is simply ignored. ==Correct?==
- When using named or hybrid parameters, you can only specify one named parameter per parameter type (i.e. you can't list two `prompt` parameters)
- Multiple `{{field-info}}` entries for the same `fieldName` are merged; with "later" declarations override earlier ones. ==Is this correct?==
- When using [[Block Templates]], multiple `{{field-info}}` specifications for the same `fieldName` are merged. If there is a collision of multiple definitions for a parameter, then the "outer" specifications taking precedence over the included block templates.
	- This is useful for allowing file templates to override prompts inside a block template.





> [!DANGER] Internal Notes
> 1) **Conflict Resolution Rule**. We state that earlier (outer) declarations are overridden by later declarations for the same field. In partial composition, do we want the opposite precedence? Please verify the intended policy and adjust wording.  

The general format for specifying a prompt, default answer, and miss expression for a field is:

```md
{{FieldName|dataType|Prompt with spaces|Default Answer|Miss Expression}}
```

Where:
- `FieldName` (Required)
	- The `FieldName` portion is the field name, which must follow the normal naming conventions mentioned in [[Naming Conventions|Naming Conventions]]
- `dataType` (Optional, default: text)
	- The dataTypes specifies the type of data that is being prompted for. See [[#Data Types]] below for more details.
- `Prompt with spaces` (Optional)
	- `Prompt with spaces` is a suggested prompt to display to the user to describe the data to enter. 
	- This prompt may contain `{{fields}}`, in which case it will use the current known value for other fields (advanced feature)
	- This prompt may contain built-in field `{{FieldName}}` that refers to the actual FieldName that has been spacified and converted to lowercase. 
	- Note: this may be empty, in which case Z2K will ask generically for data using just the field name, or the default prompt phrase. See [[YAML Configuration Fields]]
- `Default Answer` (Optional) ^DefaultAnswer
	- This is the default answer to provide to the user to help with answering or minimize data entry
	- Note: This can use other Template Fields, but it is fine if they remain unresolved if those fields have not yet been specified `{{fields}}`.
- `Miss Expression` (Optional)
	- If the user never attempts to answer this field name, then this prompt parameter provides the text to use for the field replacement
	- Note: This can use other Template fields and will be resolved at the end of execution.
	- Note: an answer to the prompt that is empty (i.e. empty string) is not considered a miss.
	- Note: The presence of a miss answer implies that this field replacement overrides any default miss handling. That is, if the default miss handling is to preserve the field, by specifying a miss expression will force that field to be resolved to the provided `Miss Expression`.

## Additional Notes:
- If you want to use a default answer but just have Z2K use the default prompt, simply leave the `Prompt with spaces` section empty (i.e. `{{FieldName||Default Answer}}`)
- The `|Default Answer` section is optional, thus `{{Emotion|What is the dominant emotion of the day?}}` is a valid field. It will not provide a default answer when querying the user.
- If the field is further processed by a helper function, simply include that in the `FieldName` section, for instance: `{{format-number-toFixed (Temperature|What is today's temperature?|70) 2}}`
- Note: you can use spaces in and around the pipe characters for readability. Any preceding or trailing whitespace will be stripped. For instance `{{FieldName| | Default Answer }}` is the same as `{{FieldName||Default Answer}}`.  Do note, however, that spaces are not allowed in the FieldName section due to it being interpreted as a [[Built-In Helper Functions|Helper Function]]. Therefore, the first pipe must not have a space in between the FieldName and the pipe symbol..
