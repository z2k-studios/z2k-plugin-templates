---
sidebar_position: 30
sidebar_class_name: z2k-code
doc_state: initial_ai_draft
aliases:
- .block
---
# The .block File Extension

## Overview
[[Types of Template Files#Block Templates|Block Templates]] can be stored with the `.block` extension. 

Conceptually:
- Using `.block` as a file extension is another way to signal that a file is a block template, in addition to setting the [[z2k_template_type]] property to  `block-template`.
- [[Block Templates]] are intended to represent template snippets that are then placed into other template or content files. For example, they can be header sections, checklists, YAML stubs, or small structural units.

You will typically insert block templates into other templates and content files via block-template specific commands and helpers. Please see [[Block Templates]] for more details. 

Once a block template is stable, you can convert it from `.md` to `.block` to hide it from normal workflows while still keeping it in the vault. 

## Typical use:
- Folder: a template folder under [[Template Folders]].
- Files inside:
	- `GeoContext.block`
	- `Book Excerpt.block`
	- `Copyright Notice.block`
	- `Project – Status Table.block`
	- `Journal – End-of-Day Questions.block`

## Advantages of using .block file extensions
- Reduces [[Template Pollution|Pollution]] noise across Obsidian
    - Excluded from most search results, Dataview/Bases queries, tag/property dashboards, daily-work views.
    - Makes the vault’s “real content” much clearer.
- Clear visual separation
	- In file explorer, the `.block` file extension immediately signals "This is a block template"
    - Helps avoid editing the wrong file when working quickly.      
- Safer long-term as templates grow
    - As your vault scales to dozens of templates, the templates' content no longer pollute entity tables, person directories, project dashboards, etc.  
- Better for team/shared vaults
    - Collaborators immediately know what is a template vs. what is a real note.

## Disadvantages of using .block file extensions
- The .block file disappears from Obsidian and is not longer directly editable
	- Although, you can use the [[Make .template and .block templates visible-hidden]] command to re-enable them 
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
