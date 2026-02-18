---
sidebar_position: 50
doc_state: initial_ai_draft
title: fieldInfo Usage Tips
sidebar_label: fieldInfo Usage Tips
---

# fieldInfo Usage Tips
The `{{fieldInfo}}` built-in helper function (and its [[fieldInfo Variations|Variations]]) is a powerful tool for making your templates more professional, systematic, and consistent. Because there are so many options for how to use these helper functions, here are some general guidelines and tips.

==Todo: these could use more details==

## fieldInfo as decl / let
If you are a developer, one way to mentally think of the `{{fieldInfo}}` command is as a field declaration operator (like `decl` or `let`). This is the built-in helper that you use to define what a field is and how it behaves. You do not strictly need to declare a new field with `{{fieldInfo}}`, but conceptually it is useful to think of `{{fieldInfo}}` performing a declaration. 

## fieldInfo Blocks
If you have a number of prompting information for a number of fields, consider creating a "fieldInfo Block" at the top or bottom of the file. Here, you have one `{{fieldInfo}}` entry per line that specifies the prompting information for all of the primary fields in your template. 

### Example Field-Info Block
For example, the following template uses a fieldInfo block at the top of the file:

```md title="Book Template.md"
{{! FIELD-INFO BLOCK -------------------------------------------------- }}
{{fieldInfo fileTitle suggest="{{BookTitle}} by {{BookAuthor}}"}}
{{fieldInfo BookTitle "Enter the Book Title (without subtitle)" directives="required"}}
{{fieldInfo BookAuthor "Enter the Author name. If multiple authors, separate with semicolons"}}  
{{fieldInfo BookGenre "What Genre is {{BookTitle}}?" type="multiselect" opts="#Genre/Fiction, #Genre/Biography, #Genre/Non-Fiction, #Genre/Reference"}}  
{{fieldInfo Summary "Give a brief summary of {{BookTitle}}" }}
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
> You can use the [[tilde]] command to remove whitespace above and below the fieldInfo block. ==Need to verify it works on `{{! Comments ~}}`==

### Where to Place Field-Info Blocks?
The best practice for placement of fieldInfo blocks: 
- Field Info Blocks are best placed either at the beginning or end of the file, but there is not hard set rule. 
- If you are just using a quick prompt specification, often times it is better to just place it embedded with a field output command. See the [[fieldOutput Helper Variation]] for more information. 
- If you do the field info at the top or bottom, it's also useful to preface it with a comment to help visually separate them. See the sample fieldInfo block [[#Example Field-Info Block|above]].
- We recommend that you **avoid putting fieldInfo blocks inside the YAML frontmatter**, as it has strict rules for what is legal text in that section, and can easily be rewritten by other plugins. 
- General suggestion is aim for consistent fieldInfo block placements across all of your template files. 
- Top versus bottom of the file?
	- If you typically finalize your template files into actual files immediately, then putting the field info at the top of the file can be a useful reminder that the card has not yet been finalized in the event you leave it in an unfinalized state. 
	- If, however, you frequently are leaving your notes in an unfinalized state, then a preamble of fieldInfos will become visually cluttered, and it is best to add them at the end of the file. 

## Readability
To make your templates more readable, we encourage you to:
- Use a [[fieldInfo Syntax#Hybrid Parameters|Hybrid Parameter]] approach for inline `{{fieldOutput}}` functions, and the longer [[fieldInfo Syntax#Named Parameters|Named Parameter]] approach for `{{fieldInfo}}` blocks.


## fieldInfo collisions
It is possible to have multiple fieldInfos for the same field. In fact, doing so allows for some fancy vault work when used [[Template Folder Hierarchies]] in [[Intro to System Blocks|System Blocks]] - see  [[Using System Blocks and fieldInfo]] for more information. 

Defining different values to fieldInfo parameters for the same field results in value "collisions". Please see [[Field Data Sources#Field Metadata Resolution|Field Info Metadata Collision Resolution]] for details on how collisions are resolved. 

## Pro-Users
Once you have graduated to a power-user level, consider the following options:
- Use the `{{fi}}` and `{{fo}}` abbreviations (see [[fieldInfo Variations]])
- Did you know that fieldInfo parameters can have fields in them as well? The prompting interface will dynamically update as you provide data for fields. The prompting interface will automatically sort the fields in the prompting interface in the order of dependencies.

## Whitespace
When using the [[Silent Helper Functions|silent]] `{{fieldInfo}}` helper (unlike its non-silent sibling `{{fieldOutput`), we recommend using one `{{fieldInfo}}` per line with no intermingling with other fieldInfos or text on that line. 

If you want to embed the fieldInfo directives inside body text of your template, consider using the `{{fieldOutput}}` helper function instead (see [[fieldOutput Helper Variation]])


## Global Field Infos

==Mention somewhere that only fields that are actually referenced somewhere are displayed in the prompting interface. This allows for fieldInfo's to be defined in the global system block to set values or prompting information for fields in templates globally. If any particular template does not use those fields, it will not prompt for them==