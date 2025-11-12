---
sidebar_position: 50
doc_state: initial_ai_draft
title: field-info Usage Tips
sidebar_label: field-info Usage Tips
---

# field-info Usage Tips
The `{{field-info}}` built-in helper function (and its [[field-info Variations|Variations]]) is a powerful tool for making your templates more professional, systematic, and consistent. Because there are so many options for how to use these helper functions, here are some general guidelines and tips.

## Field-Info Blocks
If you have a number of prompting information for a number of fields, consider creating a "field-info Block" at the top or bottom of the file. Here, you have one `{{field-info}}` entry per line that specifies the prompting information for all of the primary fields in your template. 

Tip: you can use the [[tilde]] command to remove whitespace above and below the field-info block. 

==clean up==
The best practice for placement of field-info blocks: 
Best practices for field info: either at the beginning at the end or use field output to put it embedded in the template file avoid YAML.
- General suggestion is i to try to be consistent in your template files. 
- If you typically finalize your template files into actual files immediately, then putting the field info at the top of the file can be a useful reminder that the card has not yet been finalized in the event you leave it in an un finalized state. 
- if, however, you frequently are leaving your notes in an un finalized state, then the a preamble of field sales will become annoying, and it is best to add them at the end of the file. 
- And then obviously, if you are just just using a quick prompt specification, often times it is better to just place it embedded with a field output command. 
- If you do the field info at the top or bottom, it's also useful to preface it with a comment to help visually separate them. Here is a sample field-info block

## Readability
To make your templates more readable, we encourage you to:
- Use a [[field-info Syntax#Hybrid Parameters|Hybrid Parameter]] approach for inline `{{field-output}}` functions, and the longer [[field-info Syntax#Named Parameters|Named Parameter]] approach for `{{field-info}}` blocks.

## Pro-Users
Once you have graduated to a power-user level, consider the following options:
- Use the `{{fi}}` and `{{fo}}` abbreviations (see [[field-info Variations]])
- Did you know that field-info parameters can have fields in them as well? The prompting interface will dynamically update as you provide data for fields. The prompting interface will automatically sort the fields in the prompting interface in the order of dependencies.

## Whitespace
When using the [[Silent Helper Functions|silent]] `{{field-info}}` helper (unlike its non-silent sibling `{{field-output`), we recommend using one `{{field-info}}` per line with no intermingling with other field-infos or text on that line. 

If you want to embed the field-info directives inside body text of your template, consider using the `{{field-output}}` helper function instead (see [[field-output Helper Variation]])

