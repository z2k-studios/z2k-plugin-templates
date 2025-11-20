---
sidebar_position: 116
---

The Z2K Template plugin uses settings stored in the YAML fields of a template file to control how the Template plugin behaves. This allows the template plugin to behave differently on a per-template file basis. All fields are prefaced with `z2k_template` to separate them from other Z2K YAML configuration settings

# Using Template YAML Configuration Fields
The following fields can be inserted into the yaml text of the source template file directly. They are also allowed to be inserted into [[Intro to System Blocks|Intro to System Blocks]] to configure execution across a larger set of files as needed. 


# Supported YAML Configuration Fields

## z2k_template_default_miss_handling
This key specifies the default method that is used for handling data misses (i.e. when a user fails to provide data for a particular field). 

| Key                                  | Key Value  | Result                                                                                                                                                                                                                   |
| ------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `z2k_template_default_miss_handling` | `preserve` | (default) If a miss occurs for a field, the field will be preserved as is in the resultant                                                                                                                               |
| `z2k_template_default_miss_handling` | `clear`    | If a miss occurs for a field, it will clear the field from the result                                                                                                                                                    |
| `z2k_template_default_miss_handling` | `default`  | If a miss occurs for a field, it will use the value of the `default` response as specified in a `{{field-info}}` for the field. If no `default` has been provided, then it will clear the field from the resultant file. |

> [!TIP] Miss Handling is More Than This
> Note that field-level [[field-info directives|directives]] and [[field-info miss|miss]] parameters in a [[reference-manual/field-info Helper/field-info Helper|field-info]] statement can override these file-level requests. Please see [[Miss Handling]] for more details.



## z2k_template_default_prompt
This key specifies the default prompt to use for a field. Like the Default answer, this can use the built-in field `{{FieldName}}` to reference the field's name.

| Key                           | Key Value | Result                            |
| ----------------------------- | --------- | --------------------------------- |
| `z2k_template_default_prompt` | string    | Specifies a prompt string to use. |
Example:
	`z2k_template_default_prompt : "Please specify the value of {{FieldName)}}"`




## z2k_template_default_title
This key specifies the default title to use for a card upon creation. 

| Key                          | Key Value | Result                                                                                    |
| ---------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `z2k_template_default_title` | string    | Specifies a string to use as the title of a card after all fields have been prompted for. |
Example:
	`z2k_template_default_title : "{{BookTitle}} - {{BookAuthor}}"`
 

## z2k_template_name
This key specifies the name of the template to use for the `{{templateName}}` [[Built-In Fields - File Data#Template File Fields|File Data Built-In field]], overriding the actual name.  This will likely be used except for unusual circumstances where the template name needs to be different than the actual name.

| Key                 | Key Value | Result                                                                                           |
| ------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `z2k_template_name` | string    | Specifies a string to use as the title of the template for the `{{templateName}}` builtin field. |

## z2k_template_author
This key allows you to assign an "author name" to the template file. This can be useful when sharing the template file with others (e.g. you can provide a link to your website in the `z2k_template_author` text).

This field will also be used whenever the [[Built-In Fields|Built-In Field]] `{{templateAuthor}}` is used within the template file. See [[Built-In Fields - Template Data#templateAuthor|{{templateAuthor}}]] for more details.

| Key                   | Key Value | Result                                                                                                                                         |
| --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `z2k_template_author` | string    | Specifies a string that represents the author of a template. It will be used to fill in references to the  `{{templateAuthor}}` builtin field. |
## z2k_template_version
This key specifies the version of the template. This is useful to help distinguish between files created from different versions of the same template file.  

This field is also used as the value for the [[Built-In Fields|Built-In Field]] `{{templateVersion}}`. See [[Built-In Fields - Template Data#templateVersion|{{templateVersion}}]] for more details.

| Key                    | Key Value | Result                                                                                                                                                    |
| ---------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `z2k_template_version` | string    | Specifies a string that represents the version number of the template. It will be used to fill in references to the  `{{templateVersion}}` builtin field. |
