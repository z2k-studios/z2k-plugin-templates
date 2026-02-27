---
sidebar_position: 1
sidebar_folder_position: 120
doc_state: initial_ai_draft
title: fieldInfo Helper Function
sidebar_label: fieldInfo Helper
aliases:
- fieldInfo
- fieldInfo helper function
- fieldInfo Helper
- Field Info Helper Function
---
# fieldInfo Helper Function 

## Introduction
The `{{fieldInfo}}` helper function (and its various [[fieldInfo Variations|variations]] `{{fieldOutput}}`, `{{fi}}`, and `{{fo}}`) is a major workhorse for the Z2K Templates plugin. With this helper, you can control how a [[Template Fields|Template Field]] behaves and is handled by Z2K Templates. This includes:
- The [[fieldInfo type|type]] of data associated with the field
- The [[fieldInfo prompt|prompt string]] for the field 
- The [[fieldInfo suggest|suggested value]] to pre-fill in a prompting interface
- The [[fieldInfo fallback|fallback value]] to use if the user never provides a value
- Advanced [[fieldInfo directives]] to control how prompting and [[Fallback Behavior]] is performed

While using `{{fieldInfo}}` and its sibling `{{fieldOutput}}` is purely optional, you will quickly find that it can be a powerful tool for making your templates more professional and predictable. 

## Contents
Because `{{fieldInfo}}` is so powerful, its documentation is spread out over several pages:

- [[fieldInfo Cheat Sheet|Cheat Sheet]] - a brief one page summary of the `{{fieldInfo}}` helper function
- [[fieldInfo Syntax|Syntax]] - syntax of the underlying helper function
- [[fieldInfo Output|Output]] - what does the `{{fieldInfo}}` helper output?
- [[fieldInfo Parameters|Parameters]] - steps through `{{fieldInfo}}` (and `{{fieldOutput}}`) parameters
	- [[fieldInfo prompt|prompt]] Parameter - the prompt message displayed to the user
	- [[fieldInfo suggest|suggest]] Parameter - the suggested value to pre-fill in the prompt
	- [[fieldInfo type|type]] Parameter - the type of data associated with the field
	- [[fieldInfo fallback|fallback]] Parameter - the value used if the user never provides a value
	- [[fieldInfo directives|directives]] Parameter - advanced control of prompting
	- [[fieldInfo opts|opts]] Parameter - possible field values for singleSelect and multiSelect fields
	- [[fieldInfo value|value]] Parameter - manually assign values to a field
- [[fieldInfo Usage Tips|Usage Tips]] - tips to understanding how to use `{{fieldInfo}}` & best practices
- [[fieldInfo Examples|Examples]] - presents a number of example templates that make use of `{{fieldInfo}}`
- [[fieldInfo Variations]] - similar functions within the same family of helper functions
	- [[fieldOutput Helper Variation]] - sister function that outputs the field value 
	- [[fi Helper Variation]] - abbreviated version of `{{fieldInfo}}`
	- [[fo Helper Variation]] - abbreviated version of `{{fieldOutput}}`
- [[fieldInfo and Block Templates]] - steps through how to use `{{fieldInfo}}` with block templates

## See Also
- [[Modifying Built-In Field Behaviors|fieldInfo and Built-In Fields]] - how `{{fieldInfo}}` works with [[Built-In Fields]]

