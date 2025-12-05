---
sidebar_position: 20
title: Template Requirements
---
# Template File Requirements
Let's talk about what makes a Template File a Template File. We break it down based on what a Template File *must* have, *should* have, and *could* have.

- [[#Must-Have Requirements]]
	1. [[#It Must Be a Text File]]
- [[#Should-Have Requirements]]
	1. [[#It Should Have Template Fields]]
	2. [[#It Should be in a Templates Folder, At Least Initially]]
- [[#Could-Have Requirements]]
	1. [[#It Could Have Template YAML Settings]]


> [!NOTE] Template Files are defined by usage, not structure
> As you will see below, there are few hard requirements for a file to be considered a template file. **A template file really is defined by usage, not structure or even strictly its location in the vault**. 

## Must-Have Requirements
### It Must Be a Text File
With Z2K Templates, the *only* requirement for a file to be considered a valid template is that it is a text file (preferably a markdown file). That's it. 

Beyond that, there are no further requirements. This is an important point: as a file [[Lifecycle of a Template|moves]] from a template file to an instantiated content file inside your vault, it continues to behave like a template (see [[WIP Stage|WIP Content Files]]). Even after it is [[Finalization|finalized]], you can still add new fields to a file and treat it as a template file in need of finalization again, or as a basis for a new content file. 

Thus at its core Template file must consist only of (markdown) text. 

## Should-Have Requirements
While the only requirement for a Template File is that it be a text file, there are a number of additional elements that makes the Template File more useable. The following items are things that a template *should have*, but are not strictly required.

### It Should Have Template Fields
Template Files should have a collection of [[Template Fields Overview|Template Fields]] and/or [[Helper Functions Overview|Helper Functions]] embedded within their body text or frontmatter. This is what makes a Template File powerful - being able to customize the file content with different sources of data. Without fields or helper functions, a template really has little meaning. 

### It Should Be in a Templates Folder, At Least Initially
Template files should be stored in [[Template Folders]], at least initially (see [[Template Stage|Template Creation Stage]]. As a template becomes instantiated into a content file in your vault, it will continue to be in the developing state while its fields become resolved. See [[Lifecycle of a Template]] for details on how a template becomes a content file in your vault.  

By storing your templates into a Templates folder, you signal the template files are available for use as a template when the user issues [[Commands|Obsidian Commands for Templates]]. Further, you enable [[Context-Sensitive Template Selection]] when combined with [[Template Folder Hierarchies]].


## Could-Have Requirements
Finally, there are a few more optional requirements that help clarify to the plugin how a Template File should be used. These are not hard requirements at all, but they help signal what type of template they are, and how they are used. 

### It Could Have Template YAML Configuration Settings
Z2K Templates supports the use of [[YAML Configuration Properties]] to specifies how a file behaves when used as a Template. The most relevant setting for determining Template Files is the [[z2k_template_type]] YAML setting. By no means required, this field is used to explicitly declare a file as a specific [[Types of Template Files|type of template file]] (block, named, normal). 

### It Could Have a Template File Extension
For advanced users, the plugin will recognize template files if it uses one of the [[Valid File Extensions]]. 