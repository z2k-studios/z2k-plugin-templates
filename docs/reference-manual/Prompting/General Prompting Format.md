---
sidebar_position: 62
---

The general format for specifying a prompt, default answer, and miss expression for a field is:

```md
{{FieldName|dataType|Prompt with spaces|Default Answer|Miss Expression}}
```

Where:
- `FieldName` (Required)
	- The `FieldName` portion is the field name, which must follow the normal naming conventions mentioned in [[Template Field Naming Conventions|Template Field Naming Conventions]]
- `dataType` (Optional, default: text)
	- The dataTypes specifies the type of data that is being prompted for. See [[#Data Types]] below for more details.
- `Prompt with spaces` (Optional)
	- `Prompt with spaces` is a suggested prompt to display to the user to describe the data to enter. 
	- This prompt may contain `{{fields}}`, in which case it will use the current known value for other fields (advanced feature)
	- This prompt may contain built-in field `{{FieldName}}` that refers to the actual FieldName that has been spacified and converted to lowercase. 
	- Note: this may be empty, in which case Z2K will ask generically for data using just the field name, or the default prompt phrase. See [[Z2K Template YAML Configuration Fields]]
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
