---
sidebar_position: 50
sidebar_label: "--> Finalization -->"
doc_state: revised_ai_draft_2
aliases:
- Finalize
- finalize
- Finalized
- finalized
- Finalization
- finalization
- Finalizing a File
- Finalization Transition
---
# Transition - Finalization
Once a content file is ready to have all templating information removed, it is ready for **finalization**.

![[Lifecycle of a Template - Finalize Transition.jpeg]]

After finalization, the resultant [[Finalized Stage|Finalized Content File]] is considered "complete" from a templates perspective, as there are no longer any templates related work to be done.

## How to Finalize
The simplest way to finalize a content file is through the Finalize button on the [[Prompting Interface]]. This appears:
- during the initial [[Instantiation|instantiation]] when a user issues a [[Create new note]] command.
- or during [[WIP Stage#WIP Iterating|WIP Iterating]] when a user issues a [[Continue filling note]] command. 

In addition, there are other ways that finalization can occur, including :
- Using other [[Command Palette]] comands
- Using [[Quick Create Commands]]
- Using [[URI Calls]]
- Using [[Command Lists]]

## What Exactly Happens During Finalization?
The following is a list of actions performed by the Templates Plugin during finalization:
- any additionally provided field data is inserted into the content file
- all remaining fields that do not have data are processed using [[Miss Handling]] rules
- all remaining helper functions are performed
- all [[Silent Helper Functions]] and [[Handlebars Comments]] are cleared
- all formatting instructions are performed
- certain [[YAML Configuration Properties]] are adjusted to reflect finalization (e.g. the [[z2k_template_type]] property is reconfigured to [[z2k_template_type#value -- finalized-content-file|finalized-content-file]]).

## Are All Fields Removed?
Technically, no. It is possible to configure some fields to linger past even finalization. For instance, if a field is specified to be [[field-info directives#finalize-preserve|preserved]], they will continue to persist even past finalization. 

## Finalization Output
Once you have finalized a content file, what is the output? Well, duh - a [[Finalized Stage|Finalized Content File]].
