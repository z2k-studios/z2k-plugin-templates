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

1. [[reference-manual/Introduction/Introduction]] - An overview of the Z2K Templates Plugin  
	- [[What is Z2K Templates|What is Z2K Templates?]] — A quick introduction using an actual template file 
	- [[Sample Template]] - Learn by example with a sample template file
	- [[Core Features of Z2K Templates]] - A brief list of the core features of the plugin
	- [[Core Concepts of Z2K Templates]] — Introduces the core concepts to know when using the plugin
	- [[Why Use Templates|Why Use Templates?]] — Steps through why we should use Templates in the first place
	- [[Why Use Z2K Templates|Why Use Z2K Templates?]] — Compares Z2K Templates with alternative approaches
	- [[Comparison with Templater Plugin|What about Templater?]] - A detailed comparison with the popular Templater Plugin.
	- [[The Z2K System]] — Shows how the plugin fits into the greater Z2K framework.  


2. [[Installation]] - How to install the plugin  
    - [[Prerequisites]] (Obsidian, dependencies)  
    - [[Installing the Plugin]]  
    - [[Configuring Defaults]] (e.g., miss handling, date formats)  

### Basics

3. [[Template Files]] - The anatomy and lifecycle of a template file  
    - [[Template File Structure]] - YAML Frontmatter, Body Content  
    - [[Minimum Requirements]] 
    - [[Lifecycle of a Template]]  
        - Parse Phase  
        - Resolve Variables (from JSON, built-ins, defaults, user input)  
        - Render Phase (YAML + Body + Title)
	- [[Finalizing a File]]
	- [[Miss Handling]]
    - [[Obsidian Commands]]  

4. [[Template Folders]] - Where template files are stored in your vault  
    - [[Hierarchical Template Folders]]  

5. [[Template Fields]] - How to use template fields  
    - [[Fields Overview]]  
    - [[Field Syntax]] (`{{varName}}`, `::varName::`, pipes, directives, functions)  
    - [[Syntax Highlighting]]
    - [[Field Types]]  
        - Text & TitleText  
        - Number  
        - Date (with formats)  
        - Boolean  
        - Single Select (with options)  
        - Multi Select (with options)  
    - [[Naming Conventions]]  
    - [[Path Expressions]] (`{{person.lastname}}`)  
    - [[Raw vs HTML Escaping]]  

6. [[Built-In Fields]] - Built-in fields supported by the Z2K Templates plugin  
    - [[Built-In Fields - Date and Time|Date and Time Built-Ins]]
    - [[Built-In Fields - File Data|File Data Built-Ins]]
    - [[Built-In Fields - Z2K System|Z2K Card References Built-Ins]]

7. [[Data Formatting]] - How data is formatted during insertion into template fields  
    - [[Default Data Formatting]]  
    - [[Custom Field Formatting]]  
    - [[Obsidian Style Date Formatting]]  

8. [[Prompting]] - How to customize the prompting for data for a field  
    - [[General Prompting Format]]  
    - [[Prompting Data Types]]  
    - [[Built-in Helpers for Prompting]]  
    - [[Miss Handling]] (`clear` vs `preserve`)  
    - [[Miss Handling]]  

### Intermediate

9. [[Helper Functions]] - Introduction to using helper functions inside templates  
    - [[Helper Functions Overview]]  
    - [[Silent Helper Functions]]
    - [[Custom Helper Functions]]  
    - [[Handlebars Built-In Functions]]  
        - [[Lookup Function]] (`{{lookup }}`)  

10. [[Built-In Helper Functions]] - A list of built-in Helper Functions and how to use them  
    - [[Formatting Functions]]  
        - String Helpers  
        - `format-string`  
        - `format-string-to-upper`  
        - `format-string-to-lower`  
        - `format-string-spacify`  
        - `format-string-trim`  
        - `format-string-raw`  
        - Date Helpers  
        - `format-date`  
    - [[Linking Functions]]  
        - `wikilink`  
        - `wikilink-named`  
        - `url`  
        - `url-named`
        - `google`
        - `chatGPT`
        - `z2k-preserve-raw`  

11. [[reference-manual/field-info Helper/field-info Helper]]
	- [[field-info Cheat Sheet|Cheat Sheet]] - a brief one page summary of the `{{field-info}}` helper function
	- [[field-info Syntax|Syntax]] - syntax of the underlying helper function
	- [[field-info Output|Output]] - what does the `{{field-info}}` helper output?
	- [[field-info Parameters|Parameters]] - steps through `{{field-info}}` (and `{{field-output}}`) parameters
		- [[field-info type|type]] Parameter
		- [[field-info prompt|prompt]] Parameter
		- [[field-info default|default]] Parameter
		- [[field-info miss|miss]] Parameter
		- [[field-info value|value]] Parameter
		- [[field-info directives|directives]] Parameter
	- [[field-info Usage Tips|Usage Tips]] - tips to understanding how to use `{{field-info}}`
	- [[field-info Examples|Examples]] - presents a variety of `{{field-info}}` related examples
	- [[field-info Variations]] - similar functions within the same family of helper functions
		- [[field-output Helper Variation]] - sister function that outputs the field value 
		- [[fi Helper Variation]] - abbreviated version of `{{field-info}}`
		- [[fo Helper Variation]] - abbreviated version of `{{field-output}}`
		
12. [[Handlebars Support]] - How Z2K's field language is similar to and differs from the Handlebars.js library  
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

13. [[Block Templates]] - Details the use of hierarchical and block level templates through partial templates  
    - [[Block Template Basics]]  
    - [[Block Template Parameters]]  

14. [[System Block Templates]]
	- Intro to System Block Templates
	- Using System Block Templates and field-info

15. [[Settings Page]] - Details on the Settings Page for the Z2K Templates Plugin  
    - TBD  



### Advanced 

16. [[Z2K Templates and YAML|YAML Integration]] 
    - [[Using Fields inside YAML Text]]  
        - How To Guide: [[How to Use Z2K Fields Inside YAML Metadata]]  
    - [[Using YAML fields inside Templates]]  
    - [[YAML and Block Templates]]  
    - [[Merging Multiple YAML Sources]]  
    - [[YAML Configuration Fields|YAML Fields the Z2K Template Plugin Uses]]  
	    - z2k_template_type
	    - z2k_template_name
	    - z2k_template_title: (still used?)
	    - z2k_template_default_title
	    - z2k_template_default_miss_handling
	    - author?
	    - Version?

17. [[URI, JSON, Command Lists]] - Triggering template fields externally through URI and/or passing JSON packages 
	- [[URI Actions]]
	- [[JSON Packages]]
	- [[Command Lists]]
	
18. [[Z2K System Features|Z2K System Features]] - Additional features specific to the larger Z2K System  

19. [[Error Handling]]  


### Misc

20. [[Appendix]]  
    - Full Variable & Helper Reference (alphabetical)  
    - [[Glossary]]
    - [[Roadmap and Extensibility]]  
    - [[Reference Manual for AI|Reference Manual for AI]]