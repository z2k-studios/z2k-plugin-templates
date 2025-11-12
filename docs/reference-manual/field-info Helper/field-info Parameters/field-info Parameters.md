---
sidebar_position: 1
sidebar_folder_position: 40
doc_state: initial_ai_draft
title: field-info Parameters
sidebar_label: field-info Parameters
---
# field-info Parameters

# Overview
There are a number of [[field-info Parameters|parameters]] that can be used with `{{field-info}}`:

**Positional + Named Parameters:**
- **[[field-info fieldName|fieldName]]** :: the name of the field you are providing data for (**required**) 
- **[[field-info prompt|prompt]]** :: The prompt message to display; can use `{{fields}}` inside it
- **[[field-info default|default]]** :: The default field result to prefill in the prompt dialog box. Only accepted if "touched".
- **[[field-info type|type]]** :: Type of field ("text", "number", "date", "datetime", "boolean", "singleSelect", "multiSelect", "titleText";)

**Named Only Parameters:**
- [[field-info opts|opts]] :: A comma separated string list of available options for singleSelect and multiSelect types
- **[[field-info miss|miss]]** :: The field result that will be used if the use never attempts to answer the prompt
- **[[field-info directives|directives]]** :: A comma separated list of directives for advanced usage
- **[[field-info value|value]]** :: An advanced use case where you pre-fill a value into a field, skipping prompting

To understand the difference between positional vs. named parameter usage, please see [[field-info Syntax]].

# Details

## Syntax Details
To understand how to use them in the syntax of the helper function, see the page on [[field-info Syntax|syntax]].

## Parameter Types and Defaults
The following table shows the accepted data types and default values for each parameter type:

| Parameter Name | Data Type                                                     | Default Value                               |
| -------------- | ------------------------------------------------------------- | ------------------------------------------- |
| `fieldName`    | Unquoted name of field                                        | (required field, no default)                |
| `prompt`       | String                                                        | `"{{format-string-spacify fieldName}}"`     |
| `default`      | String, number, boolean, list                                 | `""`                                        |
| `type`         | String                                                        | `"text"`                                    |
| `opts`         | String containing a comma separated list of Strings           | `""`                                        |
| `miss`         | String, number, boolean, list                                 | (determined by [[Miss Handling]] procedure) |
| `directives`   | String containing a comma separated list of directive strings | `""`                                        |
| `value`        | String, Number, Boolean, list                                 | `""`                                        |

## Tips

> [!TIP] Fields In parameters
> Did you know that `{{field-info}}` parameters can have fields in them as well? The prompting interface will dynamically update as you provide data for fields referenced in the prompting and default answers.

## Devilish Details
Some little tiny details for those of you who like to touch the boundaries
- fieldNames are "literals", meaning that they do not have quotes around them
- Strings:
	- To specify strings, you can use either double quotes (`"`) or single quotes (`'`). 
		- Tip: Use one if the string contains the other. 
- Dates:
	- when specifying a date to a parameter that is expecting a value, always use strings.
- Multiple `{{field-info}}` entries for the same `fieldName` are merged; with "later" declarations override earlier ones. This includes `{{field-info}}` information included in [[Block Templates]] and [[Intro to System Blocks|System Blocks]], which are interpreted "first". If there is a collision of multiple definitions for a parameter, then the "outer" specifications taking precedence over the included block templates.
	- Tip: This is useful for allowing file templates to override prompts inside a block template.


