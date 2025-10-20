---
sidebar_position: 1
sidebar_folder_position: 110
doc_state: initial_ai_draft
title: field-info Helper Function
sidebar_label: field-info Helper
aliases:
- Field Info Helper Function
- field-info
- field-info helper function
---
# field-info Helper Function - Introduction

The `{{field-info}}` helper function (also abbreviated to `{{fi}}`) is a major workhorse for the Z2K Templates plugin. With this helper, you can control how a [[Template Fields|Template Field]] behaves and is handled by Z2K Templates. This includes:
- The [[field-info type|type]] of data associated with the field
- The [[field-info prompt|prompt string]] for the field 
- The [[field-info default|default value]] to use in a prompting interface
- The [[field-info miss|"miss" value]] to use for the field if it is not specified
- Advanced [[field-info directives]] to control how prompting is performed

While using `{{field-info}}` (and its sibling `{{field-output}}`) is purely optional, you will quickly find that it can be a powerful tool for making your templates professional and more predictable. 
## Contents

Because `{{field-info}}` is so powerful, its documentation is spread out over several pages:

- [[field-info Cheat Sheet|Cheat Sheet]] - a brief one page summary of the `{{field-info}}` helper function
- [[field-info Syntax|Syntax]] - syntax of the underlying helper function
- [[field-info Output|Output]] - what does the `{{field-info}}` helper output?
- [[field-info Parameters|Parameters]] - steps through `{{field-info}}` (and `{{field-output}}`) parameters
	- [[field-info type|type]] Parameter
	- [[field-info prompt|prompt]] Parameter
	- [[field-info default|default]] Parameter
	- [[field-info miss|miss]] Parameter
	- [[field-info value|value]] Parameter
	- [[field-info directives|directives]] Parameter
- [[field-info Usage Tips|Usage Tips]] - tips to understanding how to use `{{field-info}}`
- [[field-info Examples|Examples]] - presents a variety of `{{field-info}}` related examples
- [[field-info Variations]] - similar functions within the same family of helper functions
	- [[field-output Helper]] - sister function that outputs the field value 
	- [[fi Helper]] - abbreviated version of `{{field-info}}`
	- [[fo Helper]] - abbreviated version of `{{field-output}}`
