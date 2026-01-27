---
sidebar_position: 20
title: Template Requirements
---
# Template File Requirements
Let's talk about what makes a Template File a Template File. There are three ways to signal that a markdown file in your vault should be treated as a template file, depending on the complexity of your vault configuration. 

## Standard Method : Use a Template Folder
The easiest and most standard way to make a markdown file be a template file is to move it into a [[Templates Folder]].  It's that simple. 

Template Folders are specially named folders (by default, "Templates") that can be created throughout your vault.

> [!NOTE] Not all Templates Files Can Be Seen Everywhere in the Vault
> Template Folders are context sensitive, so not all Templates will be visible based on the destination folder for the content file you are generating - please see [[Template Discovery#Understanding Context|Understanding the Destination Context]] for more details and an example.

## Advanced Method : Use the Template YAML Setting
For those that want to store their templates alongside actual content files in the same folder, the plugin supports a second method to signify that a file is a template. The plugin recognizes template files that have a special YAML frontmatter property [[z2k_template_type]] that is set to [[z2k_template_type#value -- document-template|document-template]] or [[z2k_template_type#value -- block-template|block-template]]. 

When using this method, Templates become *embedded* directly into the same folder - and thus you can remove the proliferation of Templates subfolders. When using this method, the template file is still influenced by the destination context (i.e. to be useable, the template must be located in the vault's folder tree somewhere within the path up to the [[Templates Root Folder]]).

For instance, consider this configuration:

![[TemplateDiscovery-EmbeddedTemplate.png]]

Here, the "Quick Interaction" template is embedded directly in the `\Interactions` folder and has the `z2k_template_type` property set to `document-template` (see the file's content on the right side of the image). This causes the file to be discoverable when creating a new note inside the `\Interactions` folder. 

## Professional Method : Use File Extensions
A third method for making a template file be discoverable is to use [[Template File Extensions|File Extensions]] and rename the file to have either a  [[Extension .template|.template]] or [[Extension .block|.block]] file extension. As was the case with the previous method, if you use file extensions, there is no longer a need to store the template into a [[Templates Folder]].

This method is considered an advanced method and should be used by users comfortable with manually changing file extensions in the event there is an issue. Please see [[Template File Extensions]] for more details.
