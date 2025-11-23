---
sidebar_folder_position: 40
sidebar_position: 1
sidebar_metacategory: "Basics"
---
# Template Files

## Overview
At the very core of Z2K Templates is the Template File. In short, a template file is a markdown file that is used as a template to create new files in your vault. 

## Contents
- [[What is a Template File|What is a Template File?]] - what fundamentally is a template file?
- [[Template Requirements]] - what are the hard and soft requirements for a template file?
- [[Template File Structure]] - what is the structure of a template file?
- [[Types of Template Files]] - what are the different types of Template Files?
- [[Becoming a Template]] - how does a markdown file become a template?
- [[Lifecycle of a Template]]
	- [[Lifecycle of a Template Overview]] - links to the contents below, reviews terms, 
	- [[Initial Instantiation into a Content File]] - What happens during initial rendering 
	- [[Deferred Field Resolution]] - Reviews how an instantiated content file iterates on fields
	- [[Finalizing a File]] - Review what happens when an instantiated file is finalized
- [[Template File Extensions]] - describes the advanced feature for custom file extensions
	- [[Template Pollution]] - what is the problem with storing templates as normal markdown files in your vault
	- [[Valid File Extensions]] - a summary of valid file extensions
		- [[Extension .md]] - the default normal markdown extension
		- [[Extension .template]] - a custom file extension for holding [[Types of Template Files#Document Templates|Document Templates]]
		- [[Extension .block]] - a custom file extension for holding [[Types of Template Files#Block Templates|Block Templates]]
	- [[Obsidian and File Extensions]] - gives details on how Obsidian treats the `.template` and `.block` file extensions
	- [[Changing File Extensions]] - steps through how to use the Z2K Plugin to change the file extensions
	- [[Editing .template and .block Files]] - how to edit template files after they have been converted to custom file extensions
	- [[File Extension Process Guide]] - Our recommendations for using these custom file extensions
