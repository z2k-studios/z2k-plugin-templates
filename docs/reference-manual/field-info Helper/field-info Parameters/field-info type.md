---
sidebar_position: 40
doc_state: initial_ai_draft
title: field-info type Parameter
sidebar_label: type
aliases:
- type
- field-info type Parameter
---
# field-info type
The optional `type` parameter in the [[field-info Helper]] specifies what type of value should be associated with the field. The value can be one of a number of [[#Accepted Values]].

## Syntax
The `type` parameter can be specified with the `type` keyword for the [[field-info Syntax#Named Parameters|Named Parameter]]. For example:

```md title="Sample default parameter"
{{field-info FavoritePhilosopher prompt="Who had the best thoughts?" type="string"}}
```

If you are using positional parameters, the `type` parameter directly follows the `default` parameter:

```md title="Sample named default parameter"
{{field-info FavoriteWriter "Best style?" "James Joyce" "string"}}
```

## Accepted Values
The `type` value must be one of the following values (for reference, the impact on the [[Prompting Interface]] is also given):

| DataType       | Impact on the [[Prompting Interface per Type]]                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `text`         | Forces text input (default)                                                                                                            |
| `filenameText` | Forces text to have file-system compliant characters                                                                                   |
| `number`       | Forces numeric only input                                                                                                              |
| `date`         | Offers a date picker to the user                                                                                                       |
| `datetime`     | A time of day                                                                                                                          |
| `boolean`      | Displays as a checkbox                                                                                                                 |
| `singleSelect` | Provides a drop down list to select a single item. (Note: the possible options are specified with the [[field-info opts]] parameter.)  |
| `multiSelect`  | Provides a drop down list to select multiple items. (Note: the possible options are specified with the [[field-info opts]] parameter.) |

## Default type Value
If omitted, the default `type` value is a string.

## Devilish Details
- In general, it is safe to assume all fields are simply strings (that's ultimately how they are inserted into the final file, after all). 
- Using other data types is largely a user-interface feature. For instance, using a `date` type will present the user with a date picker interface rather than text box. 
- Assigning the correct type will prevent things like data entry errors (for instance, typo letters in numeric values)
- It is best to assume that `singleSelect` and `multiSelect` typed fields are `[`list`]` of strings. They can be others, but we have not tested that fully. 
