---
sidebar_position: 35
sidebar_label: Storing Block Templates
---
# Where Do You Store Block Templates?
We recommend storing your Block Templates directly in the [[Template Folders|Template Folder]] that is most relevant [[Destination Context|contextually]]. In general, block templates benefit from higher scopes, so consider moving them into higher parent folders in your path. 

Please note that because Block Templates are identified via their [[YAML Configuration Properties|YAML Configuration Property]], they can be store either in the templates folder or directly in the content folders. For the most part, the decision is one of cleanliness - do you want to move all your block templates into the same folder as your document templates, or have them more embedded with your content files.

That said, storing them in your Templates folder is recommended for organization purposes.

## Intermixing Document and Block Templates

> [!NOTE] The Plugin Filters Block Templates from Document Template Pick Lists
> If you are worried about block templates making your document template [[Create new note#Select Template|Select Template pick lists]] cluttered, rest easy. The plugin automatically excludes block templates when building document template selection lists, so they won't clutter your template picker.
>  
> This also works vice versa - document templates will not appear in block template pick lists for the [[Insert block template]] command. 
