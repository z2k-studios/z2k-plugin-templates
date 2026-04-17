---
sidebar_position: 1
sidebar_folder_position: 40
doc_state: initial_ai_draft
title: fieldInfo Parameters
sidebar_label: fieldInfo Parameters
z2k_validation_ok: 2
---
# fieldInfo Parameters

# Overview
There are a number of [[fieldInfo Parameters|parameters]] that can be used with `{{fieldInfo}}`:

**Positional + Named Parameters:**
- **[[fieldInfo fieldName|fieldName]]** :: the name of the field you are providing data for (**required**) 
- **[[fieldInfo prompt|prompt]]** :: The prompt message to display; can use `{{fields}}` inside it
- **[[fieldInfo suggest|suggest]]** :: The suggested value to pre-fill in the prompt dialog box. Only accepted if "touched".
- **[[fieldInfo type|type]]** :: Type of field ("text", "number", "date", "datetime", "boolean", "singleSelect", "multiSelect", "titleText";)

**Named Only Parameters:**
- **[[fieldInfo opts|opts]]** :: A comma separated string list of available options for singleSelect and multiSelect types
- **[[fieldInfo fallback|fallback]]** :: The value used if the user never provides a value
- **[[fieldInfo directives|directives]]** :: A comma separated list of directives for advanced usage
- **[[fieldInfo value|value]]** :: An advanced use case where you pre-fill a value into a field, skipping prompting

To understand the difference between positional vs. named parameter usage, please see [[fieldInfo Syntax]].

# Details

## Syntax Details
To understand how to use them in the syntax of the helper function, see the page on [[fieldInfo Syntax|syntax]].

## Parameter Types and Defaults
The following table shows the accepted data types and default values for each parameter type:

| Parameter Name | Data Type                                                     | Default Value                               |
| -------------- | ------------------------------------------------------------- | ------------------------------------------- |
| `fieldName`    | Unquoted name of field                                        | (required field, no default)                |
| `prompt`       | String                                                        | `"{{formatStringSpacify fieldName}}"`     |
| `suggest`      | String, number, boolean, list                                 | `""`                                        |
| `type`         | String                                                        | `"text"`                                    |
| `opts`         | String containing a comma separated list of Strings           | `""`                                        |
| `fallback`     | String, number, boolean, list                                 | (determined by [[Fallback Behavior]] procedure) |
| `directives`   | String containing a comma separated list of directive strings | `""`                                        |
| `value`        | String, Number, Boolean, list                                 | `""`                                        |

## Tips

> [!TIP] Fields In parameters
> Did you know that `{{fieldInfo}}` parameters can have fields in them as well? The prompting interface will dynamically update as you provide data for fields referenced in the prompting and suggest values.

## Devilish Details
Some little tiny details for those of you who like to touch the boundaries
- fieldNames are "literals", meaning that they do not have quotes around them
- Strings:
	- To specify strings, you can use either double quotes (`"`) or single quotes (`'`). 
		- Tip: Use one if the string contains the other. 
- Dates:
	- when specifying a date to a parameter that is expecting a value, always use strings.
- Multiple `{{fieldInfo}}` entries for the same `fieldName` are merged; with "later" declarations override earlier ones. This includes `{{fieldInfo}}` information included in [[Block Templates]] and [[Intro to System Blocks|System Blocks]], which are interpreted "first". If there is a collision of multiple definitions for a parameter, then the "outer" specifications taking precedence over the included block templates.
	- Tip: This is useful for allowing file templates to override prompts inside a block template.


