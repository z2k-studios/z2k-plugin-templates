The Z2K Template plugin uses settings stored in the YAML fields of a template file to control how the Template plugin behaves. This allows the template plugin to behave differently on a per-template file basis. All fields are prefaced with `z2k_template` to separate them from other Z2K YAML configuration settings

# Using Template YAML Configuration Fields
The following fields can be inserted into the yaml text of the source template file directly. They are also allowed to be inserted into [[9b - Z2K System YAML Files|Z2K System YAML Files]] to configure execution across a larger set of files as needed. 


# Supported YAML Configuration Fields

## z2k_template_default_miss_handling
This key specifies the default method that is used for handling data misses (i.e. when a user fails to provide data for a particular field). See [[10 - Miss Handling for Z2K Template Fields]] for more details. 

| Key                                  | Key Value  | Result                                                                                           |
| ------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------ |
| `z2k_template_default_miss_handling` | `preserve` | (default) If a miss occurs for a field, the field will be preserved as is in the resultant file. |
| `z2k_template_default_miss_handling` | `clear`    | If a miss occurs for a field, it will clear the field from the resultant file.                   |

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
This key specifies the name of the template to use for the `{{templateName}}` builtin field, overriding the actual name.  This will likely be used except for unusual circumstances where the template name needs to be different than the actual name.

| Key                 | Key Value | Result                                                                                           |
| ------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `z2k_template_name` | string    | Specifies a string to use as the title of the template for the `{{templateName}}` builtin field. |

 
# Notes

1. Note: If you include multiple, conflicting YAML Configuration Field entries (e.g. from multiple layers of System YAML files, or by including a partial), you may experience inconsistent enforcement of those configuration settings.
