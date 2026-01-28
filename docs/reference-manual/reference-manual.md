---
title: Table of Contents
sidebar_folder_position: 30
sidebar_position: 1
sidebar_metacategory: "Getting Started"
navbar_section_name: "Reference Manual"
aliases:
- Reference Manual
---
[[README|Z2K Templates]] is an [Obsidian](https://obsidian.md) Plugin for making powerful templates for your Obsidian vault. These doc pages serve as a Reference Manual for how to use the plugin and make supercharged templates.

---

==At the moment, these are just copied and pasted from the different sections==

## Table of Contents

### Getting Started

1. [[reference-manual/Introduction/Introduction|Introduction]] - An overview of the Z2K Templates Plugin  
	- [[What is Z2K Templates|What is Z2K Templates?]] — A quick introduction to the Z2K Templates Plugin
	- [[Sample Template]] - Learn by example with a sample template file
	- [[Core Features of Z2K Templates|Core Features]] - A brief list of the core features of the plugin
	- [[Core Concepts of Z2K Templates|Core Concepts]] — Introduces the core concepts to know when using the plugin
	- [[Why Use Templates|Ten Reasons to Use Templates]] — Steps through why we should use Templates in the first place
	- [[Why Use Z2K Templates|Why Use Z2K Templates?]] — Compares Z2K Templates with alternative approaches
	- [[Comparison with Templater Plugin]] - A detailed comparison with the popular Templater Plugin.
	- [[The Z2K System]] — Shows how the plugin fits into the greater Z2K framework.  


2. [[Installation]] - How to install the plugin  
    - [[Prerequisites]] (Obsidian, dependencies)  
    - [[Installing the Plugin]]  
    - [[Configuring Defaults]] (e.g., miss handling, date formats)  

### Basics

3. [[Commands]]
	- [[Command Palette]] - Commands available through the Command Palette
		- [[Create new note]]                           
		- [[Create note from selected text]]           
		- [[Convert existing note to templated note]]  
		- [[Continue filling note]]                     
		- [[Insert block template]]                     
		- [[Insert block template using selected text]] 
		- [[Convert to Document Template]]            
		- [[Convert to Content File]]                  
		- [[Convert to Block Template]]            
	- [[Quick Create Commands]]
	- [[Context Menu Commands]]

3. [[Template Files]] - The anatomy and lifecycle of a template file  
	- [[What is a Template File|What is a Template File?]] - what fundamentally is a template file?
	- [[Template Requirements]] - what are the hard and soft requirements for a template file?
	- [[Template File Structure]] - what is the structure of a template file?
	- [[Types of Template Files]] - what are the different types of Template Files?
	- [[Deferred Field Resolution]] - Reviews how an instantiated content file iterates on fields
	- [[Lifecycle of a Template]]
		- [[Template Lifecycle Overview]] - Overview of the Template Lifecycle
		- Stages and Transitions:
			- Stage 1: [[Template Stage]]  - Creating the Document Template
				- Transition out of Stage 1: [[Instantiation]] - Creating a Content File
			- Stage 2: [[WIP Stage]] - Working with a Work-in-Progress Content File
				- Transition into Stage 3: [[Finalization]] - Fully processing all template fields remaining in a content file
			- Stage 3: [[Finalized Stage]] - The end result - a completed content file in the vault.
		- [[Typical Templates Workflow]] - Maps the Lifecycle into a Templates Workflow

4. [[Template Folders]] - Where template files are stored in your vault  
	- [[What is a Template Folder]]
		- [[Embedded Template Folders]]
		- [[Template Folder Subfolders]]
	- [[Template Folder Hierarchies]]
	- [[Hiding your Templates and Template Folders from Obsidian]]

5. [[Template Fields]] - How to use template fields  
	- [[Template Fields Overview]] -- An overview of fields inside Z2K Templates
	- [[Template Field Flavors]] -- Types of fields (automated, user specified)
	- [[Field Syntax]] - (`{{varName}}`, `::varName::`, `varName`, `var.Name`)
	- [[Syntax Highlighting]]
	- [[Field Types]]
	- [[Naming Fields]] -- Describes how to name a field and the special symbols used for advanced expressions
	- [[Field Data Sources]] -- Reviews all the ways data can be provided to fill in a template field
	- [[Raw Vs. HTML Escaping]]
	- [[Restricted Functionality Mode]] -- For advanced users, this page describes the limitations of using fields in complex expressions

6. [[Built-In Fields]] - Built-in fields supported by the Z2K Templates
	- [[Built-In Fields - Date and Time|Date and Time]] - built-in date and time fields
	- [[Built-In Fields - File Data|File Data]] - built-in fields associated with a card
	- [[Built-In Fields - Template Data|Template Data]] - built-in fields about the template used to create files
	- [[Built-In Fields - Misc|Misc Built-In Fields]] - misc built-in fields
	- [[Built-In Fields - Z2K System|Z2K System]] - built-in links to other cards in the Z2K System compliant vault.
	- [[Modifying Built-In Field Behaviors]] - using `{{`[[reference-manual/field-info Helper/field-info Helper|field-info]]`}}` to modify how built-in fields behave

7. [[reference-manual/Naming Conventions/Naming Conventions|Naming Conventions]] - Conventions used by Z2K Templates 
	- [[Naming Overview]] - an overview of the naming conventions
	- [[Naming Fields]] - naming conventions for built-in and user-defined Fields
	- [[Naming Helpers]] - naming conventions for built-in and user-defined Helper Functions
	- [[Naming Templates]] - naming conventions for template files
	- [[Naming Template Folders]] - naming conventions for template folders

8. [[Data Formatting]] - How data is formatted during insertion into template fields  
	- [[Default Data Formatting|Default Field Formatting Rules]]
	- [[Custom Field Formatting|Custom Field Formatting Rules]]
	- [[Date Formatting Rules]]
	- [[String Formatting Rules]]
	- [[Prompting|Template Fields and Prompting Commands]]

9. [[Prompting]] - How to customize the prompting for data for a field  
	- [[Prompting Interface]]
	- [[Prompting Interface per Type]]
	- [[Prompting Defaults]]
	- [[Prompt Touching]]
	- [[Miss Handling]]
	- [[Built-in Helpers for Prompting]]

### Intermediate

10. [[Helper Functions]] - Introduction to using helper functions inside templates  
	- [[Helper Functions Overview]] - General guideline to Helper Functions
	- [[Using Fields in Parameters]] - How to use `{{fields}}` inside Helper Functions
	- [[Using Nested Helper Functions]] - How to nest Helper Functions inside other Helper Functions
	- [[Silent Helper Functions]] - A special class of Helper Functions that are silent
	- [[User Defined Helper Functions]] - How to build your own Helper functions
	- [[Built-In Helper Functions]] - predefined Helper functions to help with common tasks
	
11. [[Built-In Helper Functions]] - A list of built-in Helper Functions and how to use them  
	- [[Field Info Functions]] - Helpers for specifying information about fields
	- [[Formatting Functions]] - Helpers for formatting output
	- [[Linking Functions]] - Helpers for building links
	- [[Math Functions]] - Helpers for doing basic math or manipulations of fields
	- [[Misc Functions]] - Assortment of misc helpers
	- [[Handlebars Built-In Functions]] - Helpers that are provided by the underlying Handlebars.js library
	
12. [[reference-manual/field-info Helper/field-info Helper|field-info Helper]]
	- [[field-info Cheat Sheet|Cheat Sheet]] - a brief one page summary of the `{{field-info}}` helper function
	- [[field-info Syntax|Syntax]] - syntax of the underlying helper function
	- [[field-info Output|Output]] - what does the `{{field-info}}` helper output?
	- [[field-info Parameters|Parameters]] - steps through `{{field-info}}` (and `{{field-output}}`) parameters
		- [[field-info prompt|prompt]] Parameter - the prompt message displayed to the user
		- [[field-info default|default]] Parameter - the default value of the field
		- [[field-info type|type]] Parameter - the type of data associated with the field
		- [[field-info miss|miss]] Parameter - the value assigned if the user never provides a value to a field
		- [[field-info directives|directives]] Parameter - advanced control of prompting
		- [[field-info opts|opts]] Parameter - possible field values for singleSelect and multiSelect fields
		- [[field-info value|value]] Parameter - manually assign values to a field
	- [[field-info Usage Tips|Usage Tips]] - tips to understanding how to use `{{field-info}}` & best practices
	- [[field-info Examples|Examples]] - presents a number of example templates that make use of `{{field-info}}`
	- [[field-info Variations]] - similar functions within the same family of helper functions
		- [[field-output Helper Variation]] - sister function that outputs the field value 
		- [[fi Helper Variation]] - abbreviated version of `{{field-info}}`
		- [[fo Helper Variation]] - abbreviated version of `{{field-output}}`
	- [[Modifying Built-In Field Behaviors|field-info and Built-In Fields]] - how `{{field-info}}` works with [[Built-In Fields]]
	- [[field-info and Block Templates]] - steps through how to use `{{field-info}}` with block templates
		
13. [[Handlebars Support]] - How Z2K's field language is similar to and differs from the Handlebars.js library  
    - [[Template Comments]] (`{{! comment }}`)  
    - [[Unescaped Expressions]] (`{{{var}}}`)  
    - [[Whitespace Control]] (`{{~tilde}}`)  
    - [[Helper Functions]] (no support for nested helpers)  
    - [[Handlebar Built-ins]]  
        - [[Conditionals]] (`{{#if person}}}`)  
        - [[Evaluation Context]] (`{{#with context}}`)  
        - [[Iterators]] (`{{#each person}}`)  
        - [[Logging]] (`{{log Message}}`)  
    - [[Raw Blocks]] (`{{{{rawblock}}}}`)  
    - [[Block Helpers]]  
    - [[Advanced Partial Support]]  
        - [[Dynamic Partials]]  
        - [[Partial Parameters]]  
        - [[Inline Partials]]  

14. [[Block Templates]] - Details the use of hierarchical and block level templates through partial templates  
    - [[Block Template Basics]]  
    - [[Block Template Parameters]]  

15. [[Settings Page]] - Details on the Settings Page for the Z2K Templates Plugin  
	- [[General Settings]]
	- [[Quick Command Settings]]
	- [[Code Block Settings]]
	- [[Global Block Settings]]
	
### Advanced 

16. [[Template File Extensions]] - describes the advanced feature for custom file extensions
	- [[Template Pollution]] - what is the problem with storing templates as normal markdown files in your vault
	- [[Valid File Extensions]] - a summary of valid file extensions
		- [[Extension .md]] - the default normal markdown extension
		- [[Extension .template]] - a custom file extension for holding [[Types of Template Files#Document Templates|Document Templates]]
		- [[Extension .block]] - a custom file extension for holding [[Types of Template Files#Block Templates|Block Templates]]
	- [[Obsidian and File Extensions]] - gives details on how Obsidian treats the `.template` and `.block` file extensions
	- [[Changing File Extensions]] - steps through how to use the Z2K Plugin to change the file extensions
	- [[Editing .template and .block Files]] - how to edit template files after they have been converted to custom file extensions
	- [[File Extension Process Guide]] - Our recommendations for using these custom file extensions

17. [[System Block Templates 2]]
	- [[Intro to System Blocks]]
	- [[Using System Blocks and YAML]]
	- [[Using System Blocks and field-info]]
	-  [[Using System Blocks and Markdown]]


18. [[Z2K Templates and YAML|YAML Integration]] 
	- [[Using Fields Inside YAML Metadata]] 
		- How To Guide: [[How to Use Z2K Fields Inside YAML Metadata]]
	- [[Using YAML Metadata as Fields]]
	- [[YAML and Block Templates]]
	- [[Merging Multiple YAML Sources]]
	- [[Using System Blocks for Scoped YAML Fields]]
	- [[YAML Configuration Properties|YAML Fields the Z2K Template Plugin Uses]]
	    - z2k_template_type
	    - z2k_template_name
	    - z2k_template_title: (still used?)
	    - z2k_template_default_title
	    - z2k_template_default_miss_handling
	    - author?
	    - Version?

19. [[URI, JSON, Command Lists]] - Triggering template fields externally through URI and/or passing JSON packages 
	- [[URI Actions]]
	- [[JSON Packages]]
	- [[Command Lists]]
	
20. [[Z2K System Features|Z2K System Features]] - Additional features specific to the larger Z2K System  

21. [[Debug and Error Handling]]  


### Misc

22. [[Appendix]]  
    - Full Variable & Helper Reference (alphabetical)  
    - [[Glossary]]
    - [[Roadmap and Extensibility]]  
    - [[Reference Manual for AI|Reference Manual for AI]]