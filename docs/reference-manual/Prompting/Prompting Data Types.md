---
sidebar_position: 64
---

The prompting language offers a number of dataTypes to insure inputted data conforms to expectations and provides consistency. Available datatypes include:

| DataType        | Description                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `text`          | Forces text input (default)                                                                                                 |
| `titleText`     | Forces text to have file-system compliant characters                                                                        |
| `number`        | Forces numeric only input                                                                                                   |
| `date`          | Offers a date picker to the user                                                                                            |
| `boolean`       | Displays as a checkbox                                                                                                      |
| `singleSelect:` | Provides a drop down list to select a single item. Here the tag is followed by a comma separated list of available options  |
| `multiSelect:`  | Provides a drop down list to select multiple items. Here the tag is followed by a comma separated list of available options |



From the source code:

type DataType = "text" | "number" | "date" | "datetime" | "boolean" | "singleSelect" | "multiSelect" | "titleText";
function isValidDataType(value: any): value is DataType {
	return ["text", "number", "date", "boolean", "singleSelect", "multiSelect", "titleText"].includes(value);
}
