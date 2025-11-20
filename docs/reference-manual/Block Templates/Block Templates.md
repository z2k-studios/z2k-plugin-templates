---
sidebar_position: 1
sidebar_folder_position: 140
aliases:
- Partials
- Partial Templates
- Block Template
---

The Z2K Template Plugin supports the concept of "*Partial Templates*", or also just called "*Partials*". These special templates are intended to be *block level* template text that can be inserted inside of another file. 

Partials are extremely useful for enforcing consistent naming and formatting of text blocks across multiple files.

# Block Template Naming Conventions
Block Templates' filenames must be prefixed with the text "`Partial - `". 
Note: this prefix can be changed inside the plugin's setting page.

# Inserting Blocks
Blocks can be inserted into a file via two methods:
1. By using the "Insert Block Template into Card" command inside Obsidian. This can be done via an Obsidian Command request or by right clicking in the text of an existing card.
2. By forcing a inclusion of the partial template's text using Handlebars' `{{> partialTemplateFile.md}}` field. 

# YAML Data and Partials
The Z2K Templates Plugin attempts to be smart at how to handle YAML frontmatter found in the partial template file being inserted. If the partial contains yaml data, it will extract those entries and add them into the card's YAML frontmatter. 

*Note:* The plugin will not perform any error checking. For instance, if the YAML field is already present in the destination file's YAML, a duplicate entry may occur. 

# Advanced Field Functions
Block Templates support the full range of advance formatting and prompting features. Thus, you can use builtin functions and advanced Handlebars syntax within the partial template, assuming the underlying feature is supported (see [[Handlebars Support]])

# Dev Notes:
*TODO: Move to Design Notes folder - but first review what items to share with users.*
Captures all the partials using the same scope logic as the templates, registers them with handlebars.

Do blocks template ever need block templates from other directories besides the template scope logic?
- Likely, yes
How should partials be referenced when they are in parent directories?
- Should be answered now
Passing context - this won't be allowed because we're not allowing fields.with.dots, right?
- Shouldn't worry about this right now
Does the prompt need to prompt for the fields in the partials?
- Yes
Should relative paths be relative to the template or relative to the new card location?
- donno, just do relative to template



When referencing block templates, use the name of the block template like this:
`{{> block template}}`

If there are multiple block templates with the same name, it will pick the one that is closest to the template, in this order:
1) Same folder
2) Parent folder
3) Grandparent folder
4) ...
5) Root folder
6) Child folder
7) Grandchild folder
8) ...
9) Any sibling folder/cousin folder (undefined order)

When using [[Block Templates]], the extra templates folder name can optionally be omitted from the path. This means that, for example, `/z2k/folderA/Templates/partial` can be referenced using `folderA/Templates/partial` or `folderA/partial`. In cases where this creates ambiguity, you must use the path with the Embedded Templates folder name, like `folderA/Templates/partial`.

Examples:

When using External Templates:
	If you're using:
	/External Templates/folderA/template
	This is the order of precedence for  `{{> partial}}`
	/External Templates/folderA/partial
	/External Templates/partial
	/External Templates/folderA/folderB/partial
	/External Templates/folderC/partial

When using Embedded Templates:
	If you're using:
	/z2k/folderA/Templates/template
	This is the order of precedence for `{{> partial}}`
	/z2k/folderA/Templates/partial
	/z2k/folderA/Templates/folderD/partial
	/z2k/Templates/partial
	/z2k/Templates/folderE/partial
	/z2k/folderA/folderB/Templates/partial
	/z2k/folderC/Templates/partial

Relative paths like ../partial are not supported at this time. Please submit a feature request if you would like this functionality.



==question==
Can you make a partial that is based on a field (eg use a multiselect to allow the user to choose a partial to import)

`{{< (random "Foo.md" "Bar.md")}}`