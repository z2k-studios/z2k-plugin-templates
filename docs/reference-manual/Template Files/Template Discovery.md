---
sidebar_position: 55
doc_state: initial_ai_draft
aliases:
- discoverable
- discovered
- discovery
- template discovery
---
# How Does a Template File Become Discoverable?
While any [[Template Requirements#Must-Have Requirements|markdown file can be used as a template]], if you want to make a template be presented as a valid [[Types of Template Files#Document Templates|Document]] or [[Types of Template Files#Block Templates|Block]] Template, then you must make the template be *discoverable*.

For instance, when issuing a [[Create new note]] command, you are prompted to select a template to use:

![[CreateNewNote-SelectTemplate.png|Select Template Dialog]]

This documentation page steps through how to make templates be visible in this list.

## Understanding Context
The first key to template discovery is to understand the destination context within which the new note command has been issued. When a [[Create new note]] is given, the first question establishes the [[Create new note#Context|destination context]] for the new note (i.e. the destination folder). Once this context is specified, the templates plugin will then construct a list of templates that are valid for that destination. 

To do so, it looks for a `Templates` [[Template Folders|subfolder]] in the destination and adds all template files in that folder (and its subfolders). Then the plugin steps through each successive parent folder all the way up to the [[Templates Root Folder]] and look for additional Templates subfolders, adding their files to the list. Note: it does not travel back down into "sibling" folders.

For instance, consider the following folder structure and template files:

![[TemplateDiscovery-Context.png]]

If the context (destination folder) is "Interactions", then only the `Board Meeting` and `Business Meeting` templates will be presented to the user. If the context is "1 on 1's", then the `Mentoring Check In` template will also be presented. In both cases, however, the `Quarterly Financial Overview` template will not be presented. 

See [[Template Folder Hierarchies]] for more details.

## How To Make A Template Discoverable
### Method 1 : Beginner : Template Folder
To make a template discoverable, simply place the file into a [[Templates Folder]] under a destination folder (or any Template Folder in the path up to the [[Templates Root Folder]]). 

See the example above in [[#Understanding Context]] for an example. 

### Method 2 : Intermediate : z2k_template_type
You can also make a template discoverable by adding the YAML frontmatter property [[z2k_template_type]] and setting it to [[z2k_template_type#value -- document-template|document-template]] or [[z2k_template_type#value -- block-template|block-template]]. When using this method, you do not have to store the template file in a Templates folder. But it must be within the destination context (i.e. anywhere located in the path up to the [[Templates Root Folder]]).

For instance, consider this configuration:

![[TemplateDiscovery-EmbeddedTemplate.png]]

Here, the "Quick Interaction" template is embedded directly in the `\Interactions` folder and has the `z2k_template_type` property set to `document-template` (see the file's content on the right side of the image). This causes the file to be discoverable when creating a new note inside the `\Interactions` folder. 

## Method 3 :  Advanced : File Extensions
A third method for making a template file be discoverable is to use [[Template File Extensions|File Extensions]] and rename the file to have either a  [[Extension .template|.template]] or [[Extension .block|.block]] file extension. As was the case with the previous method, if you use file extensions, there is no longer a need to store the template into a [[Templates Folder]].

%% Note: this next section is directly included elsewhere %%
## Summary
1. Templates must exist within the [[Template Discovery#Understanding Context|destination context]] for the new instantiated file (i.e. somewhere within the destination's path up to the [[Templates Root Folder]]) .
2. **Template Folders:** Any template file in a [[Template Folders|Template Folder]] is presented to the user as a valid template. A few notes:
	1. The plugin uses the [[z2k_template_type]] property to determine if a template is a document template or a block template, defaulting to a full document template.
	2. If [[z2k_template_type]] is missing, then it uses [[Template File Extensions|File Extensions]] to identify if it is a document or block template.
	3. If it still can not differentiate between a block or document template, it will default to a template being a document template.
3. **YAML Property:** Any template file with the [[z2k_template_type]] property set to [[z2k_template_type#value -- document-template|document-template]] or [[z2k_template_type#value -- block-template|block-template]] value will be presented to the user as a valid template for the current context. 
	1. Note: This includes files in the destination path outside of [[Template Folders]]
4. **File Extension:** Any template file with the [[Extension .template|.template]] and [[Extension .block|.block]] [[Template File Extensions|File Extensions]] will be presented.
	1. Note: This includes files in the destination path outside of [[Template Folders]]
