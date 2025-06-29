Z2K Template Fields uses settings stored in the YAML code of a template file to specify global settings for field replacement on a per-template file basis. All fields are prefaced with `z2k_template` to separate them from other Z2K YAML configuration settings


# z2k_template_default_miss_handling
This key specifies the default method that is used for handling data misses (i.e. when a user fails to provide data for a particular field). See [[9 - Miss Handling for Z2K Template Fields]] for more details. 

| Key                                  | Key Value  | Result                                                                                           |
| ------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------ |
| `z2k_template_default_miss_handling` | `preserve` | (default) If a miss occurs for a field, the field will be preserved as is in the resultant file. |
| `z2k_template_default_miss_handling` | `clear`    | If a miss occurs for a field, it will clear the field from the resultant file.                   |

# z2k_template_default_prompt
This key specifies the default prompt to use for a field. Like the Default answer, this can use the built-in field `{{FieldName}}` to reference the field's name.

| Key                           | Key Value | Result                            |
| ----------------------------- | --------- | --------------------------------- |
| `z2k_template_default_prompt` | string    | Specifies a prompt string to use. |
Example:
	`z2k_template_default_prompt : "Please specify the value of {{FieldName)}}"`

# z2k_template_default_title
This key specifies the default title to use for a card upon creation. 

| Key                          | Key Value | Result                                                                                    |
| ---------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `z2k_template_default_title` | string    | Specifies a string to use as the title of a card after all fields have been prompted for. |
Example:
	`z2k_template_default_title : "{{BookTitle}} - {{BookAuthor}}"`
 
 
# Implementation Notes

1. Make sure you first process any "Partial" templates, as the YAML specification may come from a partial template.
