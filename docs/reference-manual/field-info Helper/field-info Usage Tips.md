---
sidebar_position: 50
doc_state: initial_ai_draft
title: field-info Usage Tips
sidebar_label: field-info Usage Tips
---

# field-info Usage Tips
The `{{field-info}}` built-in helper function (and its [[field-info Variations|Variations]]) is a powerful tool for making your templates more professional, systematic, and consistent. Because there are so many options for how to use these helper functions, here are some general guidelines and tips.

==Todo: these could use more details==

## field-info as decl / let
If you are a developer, one way to mentally think of the `{{field-info}}` command is as a field declaration operator (like `decl` or `let`). This is the built-in helper that you use to define what a field is and how it behaves. You do not strictly need to declare a new field with `{{field-info}}`, but conceptually it is useful to think of `{{field-info}}` performing a declaration. 


## field-info Blocks
If you have a number of prompting information for a number of fields, consider creating a "field-info Block" at the top or bottom of the file. Here, you have one `{{field-info}}` entry per line that specifies the prompting information for all of the primary fields in your template. 

### Example Field-Info Block
For example, the following template uses a field-info block at the top of the file:

```md title="Book Template.md"
{{! FIELD-INFO BLOCK -------------------------------------------------- }}
{{field-info fileTitle default="{{BookTitle}} by {{BookAuthor}}"}}
{{field-info BookTitle "Enter the Book Title (without subtitle)" directives="required"}}
{{field-info BookAuthor "Enter the Author name. If multiple authors, separate with semicolons"}}  
{{field-info BookGenre "What Genre is {{BookTitle}}?" type="multiselect" opts="#Genre/Fiction, #Genre/Biography, #Genre/Non-Fiction, #Genre/Reference"}}  
{{field-info Summary "Give a brief summary of {{BookTitle}}" }}
{{! ------------------------------------------------------------------- ~}}

My Book Review - {{BookTitle}} by {{BookAuthor}}  
  
# Citation  
- **Book Title**:: {{BookTitle}} 
- **Author**:: {{BookAuthor}}  
- **Genre**:: {{BookGenre}}
  
# Summary  
{{Summary}}  
  
```


> [!TIP] Use Tildes to clear out extra whitespace
> You can use the [[tilde]] command to remove whitespace above and below the field-info block. ==Need to verify it works on `{{! Comments ~}}`==

### Where to Place Field-Info Blocks?
The best practice for placement of field-info blocks: 
- Field Info Blocks are best placed either at the beginning or end of the file, but there is not hard set rule. 
- If you are just using a quick prompt specification, often times it is better to just place it embedded with a field output command. See the [[field-output Helper Variation]] for more information. 
- If you do the field info at the top or bottom, it's also useful to preface it with a comment to help visually separate them. See the sample field-info block [[#Example Field-Info Block|above]].
- We recommend that you **avoid putting field-info blocks inside the YAML frontmatter**, as it has strict rules for what is legal text in that section, and can easily be rewritten by other plugins. 
- General suggestion is aim for consistent field-info block placements across all of your template files. 
- Top versus bottom of the file?
	- If you typically finalize your template files into actual files immediately, then putting the field info at the top of the file can be a useful reminder that the card has not yet been finalized in the event you leave it in an unfinalized state. 
	- If, however, you frequently are leaving your notes in an unfinalized state, then a preamble of field-infos will become visually cluttered, and it is best to add them at the end of the file. 

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

