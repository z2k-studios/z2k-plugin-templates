---
sidebar_position: 20
sidebar_class_name: z2k-code
doc_state: initial_ai_draft
aliases:
- .template
---
# The .template File Extension

## Overview
[[Types of Template Files#Document Templates|Document Templates]] can be stored with the `.template` extension. 

Conceptually:
- `.template` files correspond to `z2k_template_type: document-template`.
- They are intended to represent whole-file templates for particular card types or note types.

Once a template is stable, you can convert it from `.md` to `.template` to hide it from normal workflows while still keeping it in the vault.

## Typical use:
- Folder: a template folder under [[Template Folders]].
- Files inside:
	- `Person – Base.template`
	- `Meeting – 1 on 1.template`
	- `Project – Master.template`


## Advantages of using .template file extensions
- Reduces [[Template Pollution|Pollution]] noise across Obsidian
    - Excluded from most search results, Dataview/Bases queries, tag/property dashboards, daily-work views.
    - Makes the vault’s “real content” much clearer.
- Clear visual separation
       - In file explorer, .template immediately signals: _this is machinery, not content_.
    - Helps avoid editing the wrong file when working quickly.      
- Safer long-term as templates grow
    - As your vault scales to dozens of templates, the templates' content no longer pollute entity tables, person directories, project dashboards, etc.  
- Better for team/shared vaults
    - Collaborators immediately know what is a template vs. what is a real note.

## Disadvantages of using .template file extensions
- Some Obsidian tools ignore non-.md files
    - Core properties panel will not show up.
    - Some plugins (especially Dataview, calendar tools, content dashboards) may skip reading .template files altogether.
    - This is desired when templates are stable — but annoying when editing them.    
- Editing friction 
    - You lose some niceties of the Markdown editor, possibly not being able to view them at all within Obisidian.     
- You may forget to convert back when editing
    - If you want to refine a template, you might need to temporarily switch it back to .md for a smoother workflow.
- New users may not realize templates are editable    
    - The unfamiliar extension creates mental distance, which is good structurally but can confuse members of a shared vault or future you.
- Backup / sync systems that filter by extension
    - Rare, but some tools assume everything meaningful is .md. If you rely heavily on third-party vault-processing scripts, .template adds complexity.