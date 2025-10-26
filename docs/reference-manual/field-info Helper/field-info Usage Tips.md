---
sidebar_position: 50
doc_state: initial_ai_draft
title: field-info Usage Tips
sidebar_label: field-info Usage Tips
---

#Todo 

==Needs cleanup==

## Use a Hybrid  Parameters approach
- using the named arguments option will make your templates much more readable.
## Use Abbreviate Names if you are a pro

## Silencing output, Info Sections 
- Do you need to include a {{~}} prefix? what about a `{{no-prompt}}`
## Fields inside Parameters
- Did you know that field-info paramters can have fields in them as well? The prompting interface will dynamically update as you provide data for fields




## Field-info placements:

## Embedded field-outputs


Best practices for field info: either at the beginning at the end or use field output to put it embedded in the template file avoid YAML.
- General suggestion is i to try to be consistent in your template files. 
- If you typically finalize your template files into actual files immediately, then putting the field info at the top of the file can be a useful reminder that the card has not yet been finalized in the event you leave it in an un finalized state. 
- if, however, you frequently are leaving your notes in an un finalized state, then the a preamble of field sales will become annoying, and it is best to add them at the end of the file. 
- And then obviously, if you are just just using a quick prompt specification, often times it is better to just place it embedded with a field output command. 
- If you do the field info at the top or bottom, it's also useful to preface it with a comment to help visually separate them. Here is a sample field-info block