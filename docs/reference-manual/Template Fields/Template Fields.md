---
sidebar_folder_position: 60
sidebar_position: 1
aliases:
- Template Field
---
# Template Fields
Template Fields are the workhorses of Z2K Templates. They are placeholders, written with `{{curlybraces}}`, that are then filled in with additional data when the template file is instantiated into a working file in your vault. 
## Contents
1. [[Template Fields Overview]] - An overview of fields inside Z2K Templates
2. [[Template Field Flavors]] - Types of fields (automated, user specified)
3. [[Field Syntax]] - (`{{varName}}`, `::varName::`, `varName`, `var.Name`)
4. [[Syntax Highlighting]]
5. [[Field Types]]
6. [[Field Data Sources]] -- Reviews all the ways data can be provided to fill in a template field
7. [[Raw Vs. HTML Escaping]] - ==or maybe just a page on escaping in general?==
8. [[Restricted Functionality Mode]] - For advanced users, this page describes the limitations of using fields in complex expressions

## Additional Information
The following pages are also relevant to understanding the use of [[Template Fields Overview|Template Fields]]:
- [[Naming Fields|Fields Naming Convention]] - Describes how to name a field and the special symbols used for advanced expressions
- [[Built-In Fields]] - a list of Built-In Fields supported by the Z2K Templates plugin
- [[fieldInfo Helper]] - how to control how fields work through the built-in `{{fieldInfo}}` helper function
- [[Lifecycle of a Template]] and [[Deferred Field Resolution]] - discusses how fields are resolved into their resultant values
