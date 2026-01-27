---
sidebar_position: 40
sidebar_label: "2 - WIP Stage"
doc_state: revised_ai_draft_2
aliases:
- Work-in-Progress Stage
- Work-in-Progress Content File
- WIP Content File
- WIP Content Files
---
# Stage 2 - WIP Content File
The second [[Template Lifecycle Overview|stage]] of a [[Types of Template Files#Document Templates|Document Template]] is as a Work-in-Progress (WIP) Content File. In this stage, the template has been [[Instantiation|instantiated]] into a content file, but not all fields have been filled with data. 

![[Lifecycle of a Template - WIP Stage.jpeg]]

WIP content files exist in a half-template / half-content file state. WIP files resemble a content file as it is stored in the content area of the vault and may have partially filled in data. But so too does it resemble a template in that it still possesses unresolved [[Template Fields Overview|Template Fields]] and [[Helper Functions]].

## Why Allow Fields to Persist into Content Files? 
In a perfect world, one knows all the data that goes into a content file the moment when it is instantiated. But reality is messy and time is short, and thus Z2K Templates is designed to allow for fields to remain in a content file in an unfilled state. This is referred to as [[Deferred Field Resolution]] and is a unique [[Core Concepts of Z2K Templates#Deferred Resolution|core concept]] of the Z2K Templates Plugin. It is also a new feature in the world of [[Handlebars Support|Handlebars]] which, by default, assumes all information will be known before processing. The Templates plugin developers believe that this feature reflects the greater reality that data is fluid, and most certainly not always known at once. 

That said, there is no requirement to use [[WIP Stage|WIP Content Files]] - simply always click the [[Finalization|Finalize]] button on the [[Prompting Interface|prompting interface]] to bypass the WIP Content File stage. 

## How to Iterate on the WIP Content File?
While a content file exists in a WIP state, you can continue to iterate on the file with new data. Simply issue the [[Continue Filling in Data]] command and then selecting the "Save for now" button in the [[Prompting Interface|prompting dialog box]] to close out the current iteration.

## How are WIP Content Files Named?
WIP Content files are created with a filename that is specified by the user during the initial prompting interface. More advanced templates can assist in the naming of the content file through the use of the [[z2k_template_default_title]] [[YAML Configuration Properties|YAML Configuration Setting]] or the [[fileTitle and Variations|fileTitle]] built in field using [[field-info Helper|field-info]].

## Can I Add New Fields into WIP Content Files?
Definitely. For instance, it is common to insert new [[Block Templates]] into WIP Content files. With each insertion, a new set of fields will potentially be placed into the WIP file. 

## Must I Finalize?
Technically, a content file can remain in a WIP state forever (I.e. persist with unresolved fields). This is perfectly acceptable, although some may consider it to be a bit messy. But then, vaults, like brains, are messy. 

The biggest issue with never finalizing is the potential for some fields to inadvertently cause [[Template Pollution]] (see next section). 

## How to Avoid Template Pollution?
Because WIP content files exist inside the content area of the vault, it is important to minimize potential [[Template Pollution|pollution]] of vault metadata with `{{fields}}`. Pollution is where content files continue to have placeholder fields in places that there larger vault system expects to see real data.  See the [[Template Pollution#How To Minimize Template Pollution|pollution guidelines]] for how to minimize template pollution. 

## Can Any Field Be Deferred?
In short, no. For example:
- The built-in [[fileTitle and Variations|fileTitle field and its variations]] must be specified in order to [[Instantiation|instantiate]] a file. 
- And fields marked with the [[field-info directives#required|required directive]] must be entered upon [[instantiation]].

## Next Step: Finalize into a Finalized Content File
Once a WIP content file is ready to remove all signs of being from a template, the next step is to [[Finalization|Finalize]] the WIP content file into a [[Finalization Stage|finalized content file]]. 

