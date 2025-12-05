---
sidebar_position: 20
doc_state: revised_ai_draft_2
aliases:
- Template Creation Stage
---
# Stage 1 - Template Creation
The first [[Template Lifecycle Overview|stage]] of a [[Types of Template Files#Document Templates|Document Template]] is all about creating the template file itself. 

![[Lifecycle of a Template - Template Stage.jpeg]]

A template is a standard markdown file that is then saved in a [[Template Folders|Template Folder]]. While a template file can be like any other markdown content file in the vault, a template file becomes useful once you:
- a) have inserted [[Template Fields]] and [[Helper Functions]] to automate and standardize the placement of future content within the template file structure, and 
- b) moved the template into a [[Template Folders|Template Folder]] so that it can be recognized by the plugin as a valid template file. 

See [[Template Requirements]] for more details on what is necessary to make a file become a template. 

## Creating a Template
To create a template, simply start a new markdown file inside a [[Template Folders|Template Folder]]. That's it, fundamentally. But to build a *good* template, we recommend building one from an existing card:

### Learn by Doing: Use Existing Cards to Build Templates
The easiest way to begin creating a template file is to start with an existing card in your vault that holds an actual instance of the content abstraction you wish to make. This is also the preferred way, as it surfaces all the small formatting and content decisions needed to make a good template using real data. 

For instance, if you are creating a template file for people contact cards in your vault, start first by designing an actual card for a real person. Then, make a copy of that file and move it into a template folder, renaming it into the abstract concept (e.g. "`Contact.md`"). Then systematically replace any instance-specific data associated with that initial person with corresponding `{{fields}}` to parameterize the content for future template instantiations. 

> [!TIP] Template Validation
> An added bonus for using an existing content card as a basis for a new template file is that you can then easily test and validate your template. Simply instantiate a new content file with the same content as your original card and compare the finalized end result with your original content file. 

## Multiple Template Flavors
Please note that there is nothing wrong with saving multiple flavors of a template for a particular abstraction with different template files. For instance, you may have specialized templates for  for business vs. personal contacts.

> [!TIP] Template Flavors Love Block Templates
If you do create multiple flavors of a template abstraction, then you may wish to consider using [[Block Templates]] to help standardize the sections that are common and unchanging across all flavors. 

## Next Step: Instantiate into a WIP Content File
Once you have created a template file, the next step is to [[Instantiation|Instantiate]] the template file into a content file. 

