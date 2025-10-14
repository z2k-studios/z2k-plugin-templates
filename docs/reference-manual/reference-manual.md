---
title: Table of Contents
sidebar_folder_position: 30
sidebar_position: 1
sidebar_metacategory: "Getting Started"
navbar_section_name: "Reference Manual"
---
[[README|Z2K Templates]] is an [Obsidian](https://obsidian.md) Plugin for making powerful templates for your Obsidian vault. These doc pages serve as a Reference Manual for how to use the plugin and make supercharged templates.

---

## Table of Contents

### Getting Started

1. [[reference-manual/Introduction/Introduction]] - An overview of the Z2K Templates Plugin  
    - [[What is Z2K Templates]]  
    - [[Sample Template]] - Steps through a sample template file to showcase some of the capabilities of Z2K Templates.
    - [[Core Features]] - A brief list of the core features of the Z2K Templates Plugin
    - [[Core Concepts]]  
    - [[reference-manual/Introduction/Why Use Templates]]  
    - [[Why Use Z2K Templates]]
    - [[What about Templater]] - Compares Z2K Tempalates specifically with the popular Templater Plugin.
    - [[The Z2K System]]  


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

6. [[Built-In Template Fields]] - Built-in fields supported by the Z2K Templates plugin  
    - [[Date and Time Fields]]  
    - [[File Data Fields]]  
    - [[File Reference Fields]]  

7. [[Data Formatting]] - How data is formatted during insertion into template fields  
    - [[Default Data Formatting]]  
    - [[Custom Field Formatting]]  
    - [[Obsidian Style Date Formatting]]  

8. [[Prompting]] - How to customize the prompting for data for a field  
    - [[General Prompting Format]]  
    - [[Prompting Data Types]]  
    - [[Built-in Prompting Helpers]]  
    - [[Miss Handling]] (`clear` vs `preserve`)  
    - [[Finalizing and Miss Handling for Z2K Templates]]  

### Intermediate

9. [[Helper Functions]] - Introduction to using helper functions inside templates  
    - [[Helper Functions Usage]]  
    - [[Custom Helper Functions]]  
    - [[Handlebars Built-In Functions]]  
        - [[Lookup Function]] (`{{lookup }}`)  
    - [[Directives]]  

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
    - [[Misc Functions]]  
        - Raw Preservation  
        - `z2k-preserve-raw`  

11. [[Handlebars Support]] - How Z2K's field language is similar to and differs from the Handlebars.js library  
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

12. [[Block Templates]] - Details the use of hierarchical and block level templates through partial templates  
    - [[Partial Basics]]  
    - [[Partial Parameters]]  

13. [[YAML Integration]]  
    - [[Using Fields inside YAML Text]]  
        - How To Guide: [[How to Use Z2K Fields Inside YAML Metadata]]  
    - [[System YAML Files]]  
    - [[Using YAML fields inside Templates]]  
    - [[YAML and Partials]]  
    - [[Merging Multiple YAML Sources]]  
    - [[Z2K Template YAML Configuration Fields|YAML Fields the Z2K Template Plugin Uses]]  
	    - z2k_template_type
	    - z2k_template_name
	    - z2k_template_title: (still used?)
	    - z2k_template_default_title
	    - z2k_template_default_miss_handling

14. [[Settings Page]] - Details on the Settings Page for the Z2K Templates Plugin  
    - TBD  


### Advanced 

15. [[URI, JSON, Command Lists]] - Triggering template fields externally through URI and/or passing JSON packages 
    - [[URI Actions]]
    - [[JSON Packages]]
    - [[Command Lists]]

16. [[Z2K System Features]] - Additional features specific to the larger Z2K System  
    - TBD  
    - Z2K System YAML Fields
	    - z2k_card_build_state
	    - z2k_card_status
	    - 

17. [[Error Handling]]  
    - TemplateError Class  
    - Common Error Messages & Fixes  
    - Unmatched braces  
    - Invalid directives  
    - Invalid data type  
    - Unclosed variables  
    - Debugging Tips  

### Misc

18. [[Roadmap & Extensibility]]  
    - Planned Features (partials, visualization, marketplace templates)  
    - Extending with Custom Helpers  
    - Integration with Other Obsidian Plugins  

19. [[Appendix]]  
    - Full Variable & Helper Reference (alphabetical)  
    - Example Templates (copy/paste)  
    - Glossary