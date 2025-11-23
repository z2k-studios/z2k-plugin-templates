---
sidebar_folder_position: 60
sidebar_position: 1
---
# Lifecycle of a Template

## Contents
- [[Lifecycle of a Template Overview]] - 
- [[Initial Instantiation into a Content File]] - What happens during initial rendering 
- [[Deferred Field Resolution]] - Reviews how an instantiated content file iterates on fields
- [[Finalizing a File]] - Review what happens when an instantiated file is finalized

## Chicken Scratch

==LOADS OF WORK TO DO HERE. This is all chicken scratch==

Unlike other Templating solutions, Z2K Templates allows for an iterative process for filling out a Template. 
Explain how a template goes from a template to a partially filled out note (instantiated template) to a finalized card.
It is a novel concept to having some fields not be all the way filled in until later (i.e. [[Deferred Field Resolution]])


==Alternative version:: [[What is Z2K Templates#Typical Workflow]]==


Talk about how you have template file creating a new content file (e.g. [[Create new note]]) that iterates through [[Continue filling note]] commands to flesh out any remaining fields. Also note that a non-finalized note can continue to have new block templates inserted into . Finally, you go through the finalize stage. 
But even after that, you can use the [[Insert block template]] to insert more templated text into a content file. 

Also, at the very end, you can alwys use the content file to create a new card with another template file (e.g. [[Create note from selected text]])


## Typical Workflow
How do you put templates into use? Here are the steps:
1. First, **Create** templates for the different types of notes in your vault.
2. Then you can **Create New Notes from a Template** with a new Obsidian command. When you do, the plugin will:
	1. **Prompt you** for any missing data and fills them into the template text
	2. **Resolve** advanced features, like built-in fields and helper functions
	3. **Create the new card** with the template boilerplate text
3. You then can **Iterate** on any remaining fields until you issue the **Finalize** command, in which case any remaining fields are resolved.

## Templates Workflow

The typical Z2K Templates workflow includes the following steps when you create a new note from a template:

1. **Parses** the template file, identifying placeholders and metadata.
2. **Prompts** you for any missing data using customizable dialogs for each [[Template Fields|field]] - see [[Prompting]]
3. **Resolves** your input along with [[Built-In Fields|built-in values]].
4. **Renders** a new file, merging YAML metadata and Markdown content into a finished document.
5. **Iterates** with the new file to continue to allow new data to be placed into fields as data becomes available.
6. **Finalize** the new document to process any unresolved fields - see [[Finalizing a File|Finalize]]


## Next Heading