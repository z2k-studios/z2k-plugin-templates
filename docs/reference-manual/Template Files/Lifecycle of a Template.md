---
sidebar_position: 40
---


Unlike other Templating solutions, Z2K Templates allows for an iterative process for filling out a Template. 
Explain how a template goes from a template to a partially filled card to a finalized card.
It is a novel concept to having some fields not be all the way filled in. 


==Alternative version:: [[What is Z2K Templates#Typical Workflow]]==
## Templates Workflow

The typical Z2K Templates workflow includes the following steps when you create a new note from a template:

1. **Parses** the template file, identifying placeholders and metadata.
2. **Prompts** you for any missing data using customizable dialogs for each [[Template Fields|field]] - see [[Prompting]]
3. **Resolves** your input along with [[Built-In Fields|built-in values]].
4. **Renders** a new file, merging YAML metadata and Markdown content into a finished document.
5. **Iterates** with the new file to continue to allow new data to be placed into fields as data becomes available.
6. **Finalize** the new document to process any unresolved fields - see [[Finalizing a File|Finalize]]


## Next Heading