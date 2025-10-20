---
sidebar_folder_position: 70
sidebar_position: 1
doc_state: initial_ai_draft
---
# Overview
There are several helpers that share the same [[field-info Parameters|parameters]] of [[field-info Helper|field-info]] and are part of a larger class of `field-info` functions.

## field-info Variations
Within the `{{field-info}}` family of Helper Functions, there are:
- [[field-info Helper|field-info]] - A silent helper function that does not output anything in the final file
- [[field-output Helper|field-output]] - Works just like `{{field-info}}`, except that it outputs the value of the field when the data becomes available.
- [[fi Helper|fi]] - An abbreviated version of `{{field-info}}`
- [[fo Helper|fo]] - An abbreviated version of `{{field-output}}`
- 
## Why the Variations? 
- Why `field-info` Vs. `field-output`?
	- Sometimes you just need to add some quick prompt information to a field inside your template, but you do not want to disrupt the flow of the document. Use a `{{field-output}}` helper. 
	- Sometimes you want to fine-tune the prompting interface with a number of options for a number of fields. This can make the template become messy as you embed the prompting information. Use `{{field-info}}` here to group all of the prompting information together at the beginning of a section or file. When the final file is created, these silent `{{field-info}}` helpers will simply disappear.
- Why have duplicate abbreviated helpers?
	- `{{field-input}}` and `{{field-output}}` are some serious workhorses in your Z2K Templates arsenal.  While using their full name is helpful for readability, sometimes it is easier to just use an abbreviated version if you are a pro user and just want to tweak a single parameter inline to your template text. 
