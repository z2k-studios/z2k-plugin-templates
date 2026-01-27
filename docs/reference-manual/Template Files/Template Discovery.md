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
So if you have been reading the reference manual linearly (you have our compliments), you now know how to [[Template Requirements|make a markdown file be a template file]]. But… just because it is a template file does not make the template file be *discoverable* when creating a new note.

For instance, when issuing a [[Create new note]] command, you are prompted to select a template to use:

![[CreateNewNote-SelectTemplate.png|Select Template Dialog]]

This documentation page steps through how to make templates be visible in this list.

## Discoverability is a Feature
This concept of *discoverability* is powerful, as it allows you to present only the templates that are relevant for the destination folder where you are creating a new file. Without this feature, as your vault grows, so too will your list of templates, and the simple act of choosing a template from a long list of options can become laborious.

## Understanding Context
The first key to template discovery is to understand the destination context within which the new note command has been issued. When a [[Create new note]] is given, the first question establishes the [[Create new note#Context|destination context]] for the new note (i.e. the destination folder). Once this context is specified, the templates plugin will then construct a list of templates that are valid for that destination. 

To build the list of relevant templates for a given destination folder, the plugin:
1. Looks `Templates` [[Template Folders|subfolder]] in the destination and adds all template files from that folder.
2. Looks in the destination folder itself for any markdown files that is using a [[Template File Extensions|Template File Extension]] or has been marked as a Template File with a [[YAML Configuration Properties|YAML Configuration Setting]].
3. The plugin then steps through each successive parent folder all the way up to the [[Templates Root Folder]] and look for additional Templates subfolders and files, adding their template names to the list of allowable templates for that destination. Note in particular: it does not travel back down into any "sibling" folders.

%% This has been included within the Templates Hierarchies page %%
## Discovery Example
To understand [[Template Discovery]] better, let's step through an example. Consider the following folder structure and template files:

![[TemplateDiscovery-Context.png]]

Now, suppose a user issues the [[Create new note]] command. The first thing it does is to have the user specify the destination context (destination folder) of the file to be created. 

In this example,
- If the destination context is "Interactions", then only the `Board Meeting` and `Business Meeting` templates will be presented to the user. 
- If the destination context is "1 on 1's", then the `Mentoring Check In` template will also be presented in addition to the `Board Meeting` and `Business Meeting` templates. 
- In both of the above cases, however, the `Quarterly Financial Overview` template will not be presented as a valid template for that destination.

## Additional Details
See [[Template Folder Hierarchies]] for more details.
