---
sidebar_position: 10
doc_state: revised_ai_draft_2
---
# Lifecycle Overview
![[Lifecycle of a Template - Large.gif]]
## Stages: From Template to Content File 
The lifecycle of a [[Types of Template Files#Document Templates|Document Template]] is defined by **three file stages*:
- **Stage 1**: [[Template Stage]]  - Creating the Document Template Itself
- **Stage 2**: [[WIP Stage]] - Iterating over a partially completed Work-in-Progress (WIP) content file
- **Stage 3**: [[Finalized Stage]] - Finalizing the final content file

## Transitions: Instantiating and Finalizing
Transitioning from one stage to another is associated with two actions:
- *Transitioning* ***out of Stage 1*** is referred to as [[Instantiation]]. This is where a template is converted into a content file in the vault.
- *Transitioning* ***into Stage 3*** is referred to as [[Finalization]]. This is where a template or WIP content file is finalized, thereby removing all remaining unresolved template fields.

> [!NOTE] Instantiation AND Finalization
> It is possible (and often is done) to both instantiate and finalize a template in one single action, skipping the WIP stage entirely, as represented by the overarching arrow connecting Instantiation with Finalization shown at the end of the above animation.

## Mapping to a Workflow
Finally, please see the [[Typical Templates Workflow]] to see how the Template Lifecycle maps into a general workflow for using templates in a vault.
## Notes

> [!NOTE] Lifecycle of Document Templates, not Block Templates
> Please note that this lifecycle refers to the life of a full [[Types of Template Files#Document Templates|Document Template]]. Block Templates can be inserted at any point, and will cause the current content file to be reset into a [[WIP Stage]] if the block template has any unresolved fields within it. As such, the lifecycle of a [[Block Template]] centers around the [[WIP Stage#WIP Iterating|WIP Iterating Stage]].





