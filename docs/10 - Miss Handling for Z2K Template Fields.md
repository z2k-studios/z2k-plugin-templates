A miss is when a Template Field exists in a template but does not have any data provided for it during an update action.

Miss Handling is different from Z2K than for classic Handlebars Field Replacement for a number of reasons:
1. Some cards are repeatedly being operated on, with not all data known at once (e.g. Log Files that are updated throughout the day).
2. Some cards will have data that is not known at creation (e.g. say, creating a card for a book, you will not know how you will rate it until you are finished)

By default, if a field is not provided with data during a processing event, the field will remain in the file untouched. There are two ways this default handling can be overriden:

# Override - Default Answer
If a field specifies a [[5c - Z2K Template Fields and Prompting#^DefaultAnswer|Default Answer]], then that is a signal that unspecified fields should be filled in with that Default Answer upon use of the template file.

# Override - Default Miss Handling 
If a template file contains in its YAML code includes the key `z2k_template_default_miss_handling`, it will use the method specified in the key's value:

| Key                                  | Key Value  | Miss Handling                                                                                    |
| ------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------ |
| `z2k_template_default_miss_handling` | `preserve` | (default) If a miss occurs for a field, the field will be preserved as is in the resultant file. |
| `z2k_template_default_miss_handling` | `clear`    | If a miss occurs for a field, it will clear the field from the resultant file.                   |
See [[9c - Z2K Template YAML Configuration Fields]] for more details.

# Override - clear and preserve Helper functions
If a field uses the [[7b - Built-In Helper Functions|built-in helper functions]] `clear` or `preserve`, it will override the default handling for that particular field, allowing for fine grain control of miss handling. 

# Implementation Notes

1. This will require potentially a branched copy of handlebars/mustache.js. Or you can preprocess the data and add a custom helper around every field that will do the preservation step.
	1. Tip: Use https://jsfiddle.net/76484/bpoezqga/ to explore Handlebars implementation
2. Other implementations that were considered:
	2. Airship implements a [$def helper](https://jsfiddle.net/76484/bpoezqga/)
	3. You can also register a [helper](https://jsfiddle.net/76484/bpoezqga/) to re-output the field: 
3. Need documentation on what to do if both the  `clear`  is used and a default value is used. 

- Replacement Control Helpers:
	- {{xx FieldName}} - says clear the field if it is not present 
		- Property: If data for the field is not provided, do you a) leave the field intact, b) clear the field, c) insert the default answer
	- {{xd FieldName||Default Answer}} - says to insert the field's Default Answer
	- OR 
	- {{preserve FieldName}} - says to preserve this field if no value is provided
	- {{noPrompt Fieldname}} - says to never prompt the user for this field
		-  Property to say don't prompt the user for this field, just leave in the file? - Think Logs


By default a variable "miss" returns an empty string. This can usually be configured in your Mustache library. The Ruby version of Mustache supports raising an exception in this situation, for instance.


[https://stackoverflow.com/questions/8978779/how-can-i-plug-a-strategy-to-deal-with-missing-attributes-when-using-mustache-te](https://stackoverflow.com/questions/8978779/how-can-i-plug-a-strategy-to-deal-with-missing-attributes-when-using-mustache-te)


https://stackoverflow.com/questions/17133367/finding-missing-variables-in-a-mustache-template

This way you can handle empty values so you still get ProductVersion:

Product Version={{#Version}}{{{Version}}}{{/Version}}{{^Version}}''{{/Version}}
Where {{^Version}}{{/Version}} is called an inverted section and will be rendered if the value of that section's tag is null, undefined, false, falsy or an empty list. As it is explained in the doc.



