In many circumstances, a template will be activated directly by the user by using a "New Card" command. In these instances, a template file can help specify how to prompt the user for data for each field in the template file. It uses the `|` symbol to specify how to prompt the user for the data.

# General Format
The general format for specifying a prompt, default answer, and miss expression for a field is:

```md
{{FieldName|dataType|Prompt with spaces|Default Answer|Miss Expression}}
```

Where:
- `FieldName` (Required)
	- The `FieldName` portion is the field name, which must follow the normal naming conventions mentioned in [[3 - Z2K Template Field Naming Conventions|Template Field Naming Conventions]]
- `dataType` (Optional, default: text)
	- The dataTypes specifies the type of data that is being prompted for. See [[#Data Types]] below for more details.
- `Prompt with spaces` (Optional)
	- `Prompt with spaces` is a suggested prompt to display to the user to describe the data to enter. 
	- This prompt may contain `{{fields}}`, in which case it will use the current known value for other fields (advanced feature)
	- This prompt may contain built-in field `{{FieldName}}` that refers to the actual FieldName that has been spacified and converted to lowercase. 
	- Note: this may be empty, in which case Z2K will ask generically for data using just the field name, or the default prompt phrase. See [[10 - Z2K Template Fields Global YAML Settings]]
- `Default Answer` (Optional) ^DefaultAnswer
	- This is the default answer to provide to the user to help with answering or minimize data entry
	- Note: This can use other Template Fields, but it is fine if they remain unresolved if those fields have not yet been specified `{{fields}}`.
- `Miss Expression` (Optional)
	- If the user never attempts to answer this field name, then this prompt parameter provides the text to use for the field replacement
	- Note: This can use other Template fields and will be resolved at the end of execution.
	- Note: an answer to the prompt that is empty (i.e. empty string) is not considered a miss.
	- Note: The presence of a miss answer implies that this field replacement overrides any default miss handling. That is, if the default miss handling is to preserve the field, by specifying a miss expression will force that field to be resolved to the provided `Miss Expression`.

# Additional Notes:
- If you want to use a default answer but just have Z2K use the default prompt, simply leave the `Prompt with spaces` section empty (i.e. `{{FieldName||Default Answer}})
- The `|Default Answer` section is optional, thus `{{Emotion|What is the dominant emotion of the day?}}` is a valid field. It will not provide a default answer when querying the user.
- If the field is further processed by a helper function, simply include that in the `FieldName` section, for instance: `{{format-number-toFixed (Temperature|What is today's temperature?|70) 2}}`
- Note: you can use spaces in and around the pipe characters for readability. Any preceding or trailing whitespace will be stripped. For instance `{{FieldName| | Default Answer }}` is the same as `{{FieldName||Default Answer}}`.  Do note, however, that spaces are not allowed in the FieldName section due to it being interpreted as a [[7b - Built-In Helper Functions|Helper Function]]. Therefore, the first pipe must not have a space in between the FieldName and the pipe symbol..

# Data Types
The prompting language offers a number of dataTypes to insure inputted data conforms to expectations and provides consistency. Available datatypes include:

| DataType        | Description                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `number`        | Forces numeric only input                                                                                                   |
| `date`          | Offers a date picker to the user                                                                                            |
| `boolean`       | Displays as a checkbox                                                                                                      |
| `singleSelect:` | Provides a drop down list to select a single item. Here the tag is followed by a comma separated list of available options  |
| `multiSelect:`  | Provides a drop down list to select multiple items. Here the tag is followed by a comma separated list of available options |

# Prompting Built-in Helper Functions
There a several built in helper functions for adjusting how fields are prompted for:

| Function    | Description                                                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clear`     | Specifies that a field should clear itself if no data was provided (see [[9 - Miss Handling for Z2K Template Fields\|Miss Handling]] for more details)    |
| `preserve`  | Specifies that a field should preserve itself if no data was provided (see [[9 - Miss Handling for Z2K Template Fields\|Miss Handling]] for more details) |
| `no-prompt` | Specifies that a field should not be included in the UI to prompt the user for values.                                                                    |
| `required`  | Specifies that a field is required for input before proceeding. Note: if a default value is provided, then that is sufficient for proceeding forward      |

# Examples


# Implementation Details
See the ChatGPT chat on implementation 
https://chatgpt.com/share/67ba03b7-44f0-8007-be1d-0267208ea8f3

