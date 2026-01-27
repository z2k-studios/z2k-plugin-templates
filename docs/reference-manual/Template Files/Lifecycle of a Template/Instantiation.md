---
sidebar_position: 30
sidebar_label: "--> Instantiation -->"
doc_state: revised_ai_draft_2
aliases:
- instantiation
- Instantiate
- instantiate
- instantiated
- Instantiating
- instantiating
- Instantiation Transition 
---
# Transition - Instantiation
Once a template file has been [[Template Stage|created]], the next step is to **instantiate** the template into a content file in the vault. 

![[Lifecycle of a Template - Instantiate Transition.jpeg]]

"Instantiate" means that the templates plugin will make a *copy* of the template file, prompt you to provide missing data, and then save the new version in the vault in a folder that holds normal content files. 

Thus, instantiating is all about transitioning from a template into an actual content file in the vault. 
## How to Instantiate 
The most basic and common way to instantiate a new content file from a template is to issue the [[Create new note]] command using the command prompt. 

There are many other more advanced ways to cause an instantiation:
- Using other [[Command Palette]] comands
- Using [[Quick Create Commands]]
- Using [[URI Calls]]
- Using [[Command Lists]]
## What Exactly Happens During Instantiation?
Here are the specific actions taken during instantiation: 
- a copy of the template is made into the destination content folder
- the new content file will be given a file name that is determined via the prompting interface (or possibly defined inside the template itself)
- a prompting interface is presented to the user to provide any data currently available to fill the template
- all helper functions that operate on known data are then executed
- all fields with provided data are replaced with the data provided
- all system blocks for the destination context are inserted into the instantiated file
- Certain [[YAML Configuration Properties]] are adjusted to reflect instantiation (e.g. the [[z2k_template_type]] property is reconfigured to [[z2k_template_type#value -- wip-content-file|wip-content-file]]). 
- then, if the user has requested finalization via the prompting interface, it will also perform the actions taken during the [[Finalization|Finalization Transition]].
## Types of Instantiated Content Files
When instantiating a template file, the prompting interface will give a choice to either =="`Save for now`" or "`Finalize`"==. This choice decides whether or not to proceed forward with a [[WIP Stage|WIP Content File]] (Stage 2) or go directly to a [[Finalized Stage|Finalized Content File]] (Stage 3). 

Which route you take depends on whether or not you have all of the data needed in order to complete the transformation of the template into a content file. If not all data is known, then a WIP Content File is created that still retains template fields inside it. 
## Instantiation Output
Once you have instantiated a template, what is the output? It is either:
- Stage 2: a [[WIP Stage|WIP Content File]] that you continue to iterate providing data for, or
- Stage 3: a [[Finalized Stage|Finalized Content File]], that is the ultimate end result for a template. This is created by piggy backing a [[Finalization|Finalize]] transition. 