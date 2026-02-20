---
sidebar_folder_position: 70
sidebar_position: 1
doc_state: initial_ai_draft
---
# Overview
There are several helpers that share the same [[fieldInfo Parameters|parameters]] of [[reference-manual/fieldInfo Helper/fieldInfo Helper|fieldInfo]] and are part of a larger class of `fieldInfo` functions.

## fieldInfo Variations
Within the `{{fieldInfo}}` family of Helper Functions, there are:
- [[reference-manual/fieldInfo Helper/fieldInfo Helper|fieldInfo]] - A silent helper function that does not output anything in the final file
- [[fieldOutput Helper Variation|fieldOutput]] - Works just like `{{fieldInfo}}`, except that it outputs the value of the field when the data becomes available.
- [[fi Helper Variation|fi]] - An abbreviated version of `{{fieldInfo}}`
- [[fo Helper Variation|fo]] - An abbreviated version of `{{fieldOutput}}`
- 
## Why the Variations? 
- **Why `fieldInfo` Vs. `fieldOutput`?**
	- Sometimes you just need to add some quick prompt information to a field inside your template, but you do not want to disrupt the flow of the document. Use a `{{fieldOutput}}` helper. 
	- Sometimes you want to fine-tune the prompting interface with a number of options for a number of fields. This can make the template become messy as you embed the prompting information. Use `{{fieldInfo}}` here to group all of the prompting information together at the beginning of a section or file. When the final file is finalized (or a field is fully specified), these silent `{{fieldInfo}}` helpers will simply disappear.
- **Why have the abbreviated `{{fi}}` and `{{fo}}` helpers?**
	- `{{field-input}}` and `{{fieldOutput}}` are some serious workhorses in your Z2K Templates arsenal.  While using their full name is helpful for readability, sometimes it is easier to just use an abbreviated version if you are a pro user and just want to tweak a single parameter inline to your template text. 
