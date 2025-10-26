---
sidebar_position: 60
doc_state: initial_ai_draft
title: field-info directives Parameter
sidebar_label: directives
aliases:
- directives
- field-info directives Parameter
---

# field-info directives Parameter
The [[field-info directives|directives]] parameter is a comma‑separated list for fine tuning the prompting-interfaces. Options include:

- Prompting:
	- **[[field-info directives#no-prompt|no-prompt]]** :: Directs the [[Prompting Interface]] to skip prompting the user for a field
	- **[[field-info directives#yes-prompt|yes-prompt]]** :: Directs the [[Prompting Interface]] to force the prompting of a user for a field
- Required: 
	- **[[field-info directives#required|required]]** :: Tells the [[Prompting Interface]] that a field requires a value in order to ==finalize== the card
	- **[[field-info directives#not-required|not-required]]** :: Tells the [[Prompting Interface]] that a field does not require a value in order to ==finalize== the card
- Miss Handling Special Cases:
	- **[[field-info directives#finalize-preserve|finalize-preserve]]** :: Instructs the plugin to preserve the `{{field}}` entry in the final generated file if the user does not specify a value
	- **[[field-info directives#finalize-clear|finalize-clear]]** :: Directs the plugin to clear out the value of this field if no value is provided
	- finalize-default :: 

## Syntax


## Examples




## Directives

### no-prompt

### yes-prompt


### required

### not-required


### finalize-preserve

finalize-preserve is actually equivalent to miss="\{\{theFieldName\}\}".  
miss="{{theFieldName}}" is a circular reference


### finalize-clear





