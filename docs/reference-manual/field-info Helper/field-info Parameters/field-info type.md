---
sidebar_position: 20
doc_state: initial_ai_draft
title: field-info type Parameter
sidebar_label: type
aliases:
- type
- field-info type Parameter
---


### `type`
One of the supported prompting data types (see [[Prompting Data Types]]). For select types, you may append a colon‑delimited option list, e.g., `singleSelect:High,Medium,Low` or `multiSelect:Personal,Work`.
==Use a ! [ [  #Header ]] ==



The prompting language offers a number of dataTypes to insure inputted data conforms to expectations and provides consistency. Available datatypes include:

| DataType        | Description                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `text`          | Forces text input (default)                                                                                                 |
| `titleText`     | Forces text to have file-system compliant characters                                                                        |
| `number`        | Forces numeric only input                                                                                                   |
| `date`          | Offers a date picker to the user                                                                                            |
| `datetime`      | A time of day                                                                                                               |
| `boolean`       | Displays as a checkbox                                                                                                      |
| `singleSelect:` | Provides a drop down list to select a single item. Here the tag is followed by a comma separated list of available options  |
| `multiSelect:`  | Provides a drop down list to select multiple items. Here the tag is followed by a comma separated list of available options |
