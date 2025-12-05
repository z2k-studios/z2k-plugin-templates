---
sidebar_position: 70
doc_state: revised_ai_draft_2
aliases:
  - Templates Workflow
  - Workflow
  - workflow
---

# A Typical Templates Workflow
Knowing the [[Lifecycle of a Template]], we can now build out a typical workflow for using Templates in an Obsidian setup. Let's step through how to put templates to use:

## Typical Workflow
1. First, **Design** new templates (or download sample ones from Z2K Studios) for the different types of notes in your vault. [[Template Stage#Learn by Doing Use Existing Cards to Build Templates|Use existing cards to help]] build out templates for your existing system. Store these into a [[Template Folders|Template Folder]], optionally organizing them [[Template Folder Hierarchies|hierarchically]].
2. Then, as you need new content files in your vault, [[Instantiation|instantiate]] new files with the [[Create new note]] Obsidian command. When you do, the plugin will:
	1. **[[Prompting Interface|Prompts]] you** for any missing data and fills them into the template text
	2. **Resolve** advanced features, like built-in fields and helper functions
	3. **Create a new [[WIP Stage|WIP Content File]]** with the template boilerplate text
3. You then can **[[WIP Stage#WIP Iterating|Iterate]]** on any remaining fields by using [[Continue filling note]] command. 
4. Finally, you [[Finalization|finalize]] your content file, in which case any remaining fields are resolved and all remaining handlebars are processed.
5. Later, you may wish to insert additional [[Block Templates]] into your content files to add further details in a structured manner.

## Notes
- For simple content files, steps 2-4 are often combined into a single file creation. 
- This is of course very simplified. If you haven't tried out some of the more advanced features to Z2K Templates, you are missing it. But… the above workflow still goes a long way to automating and standardizing the data in your Obsidian Vault. 