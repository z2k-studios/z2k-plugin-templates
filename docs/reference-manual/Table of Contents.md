---
sidebar_position: 4
title: Table of Contents
sidebar_label: Full Table of Contents
aliases:
  - Table of Contents
---
# Table of Contents
The complete, nested table of contents for the Z2K Templates Reference Manual.

## Getting Started

1. **[[Introduction]] — A 50,000-foot overview of how Z2K Templates works and why it was designed this way**
	- [[What is Z2K Templates|What is Z2K Templates?]] — A quick introduction to the Z2K Templates Plugin
	- [[Sample Template]] — Learn by example with a sample template file
	- [[Core Features of Z2K Templates|Core Features]] — A brief list of the core features of the plugin
	- [[Core Concepts of Z2K Templates|Core Concepts]] — Introduces the core concepts to know when using the plugin
	- [[Why Use Templates|Ten Reasons to Use Templates]] — Steps through why we should use Templates in the first place
	- [[Why Use Z2K Templates|Why Use Z2K Templates?]] — Compares Z2K Templates with alternative approaches
	- [[Comparison with Templater Plugin]] — A detailed comparison with the popular Templater Plugin
	- [[The Z2K System]] — Shows how the plugin fits into the greater Z2K framework

2. **[[Installation]] — ==no description==**


## Basics

3. **[[Commands]] — Commands available through Obsidian's Command Palette and context menus for creating files, inserting block templates, and managing template file types**
	- [[Command Palette]] — Commands available via `Ctrl/Cmd + P`
		- New File Commands
			- [[Create New File]] — Creates a new file from a document template
			- [[Create File From Selected Text]] — Creates a new file, passing the selection as data
			- [[Apply Template to File]] — Applies a template to an existing file
			- [[Continue Filling File]] — Resumes prompting for deferred fields
			- [[Finalize File]] — Finalizes a file immediately using fallbacks — no prompting
		- Block Template Commands
			- [[Insert Block Template]] — Inserts a block template at the cursor
			- [[Insert Block Template Using Selected Text]] — Inserts a block template, passing the selection as data into the template
		- Template Conversion Commands
			- [[Convert to Document Template]] — Marks the file as a document template
			- [[Convert to Block Template]] — Marks the file as a block template
			- [[Switch to .md extension]] — Changes extension back to `.md` without changing template type
			- [[Convert to Content File]] — Removes template status, making it a normal file
			- [[Make .template and .block Templates Visible-Hidden]] — Toggles visibility of `.template` and `.block` files
		- Utility Commands
			- [[Process Command Queue Now]] — Immediately processes any queued template commands
		- [[File Naming in Commands]] — How command names adapt to your file terminology settings
	- [[Context Menu Commands]] — Commands available via right-click
		- [[Create New File Here (Context Menu)|Create New File Here]] — Creates a new templated file in that folder
		- [[Create File From Selection (Context Menu)|Create File From Selection]] — Creates a new file using the selection as input
		- [[Continue Filling This File (Context Menu)|Continue Filling This File]] — Prompts for remaining unfilled fields
		- [[Finalize This File (Context Menu)|Finalize This File]] — Finalizes file using fallbacks — no prompting
		- [[Insert Block Template (Context Menu)|Insert Block Template]] — Inserts a block template at cursor
		- [[Insert Block Template Using Selection (Context Menu)|Insert Block Template Using Selection]] — Inserts a block template, passing selection as input
		- [[Convert to Document Template (Context Menu)|Convert to Document Template]] — Marks file as a document template
		- [[Convert to Block Template (Context Menu)|Convert to Block Template]] — Marks file as a block template
		- [[Switch to .md extension (Context Menu)|Switch to .md extension]] — Changes extension to `.md`
		- [[Convert to Content File (Context Menu)|Convert to Content File]] — Removes template status
	- [[Quick Commands]] — How to make custom commands for specific templates
		- [[Quick Commands Overview]] — What Quick Commands are and why you'd use them
		- [[Managing Quick Commands]] — How to add, configure, delete, and reorder commands
		- [[Assigning Hotkeys to Quick Commands]] — Binding keyboard shortcuts to your commands
		- [[Quick Command Examples]] — Sample configurations for common workflows

4. **[[Template Files]] — The core unit of Z2K Templates — a markdown file used as a template to create new files in your vault**
	- [[What is a Template File|What is a Template File?]] — What fundamentally is a Template File?
	- [[Template Requirements]] — What makes a Template File be recognized as one?
	- [[Template File Structure]] — What is the structure of a Template File?
	- [[Types of Template Files]] — What are the different types of Template Files?
	- [[Template Discovery]] — How does a Template File become discoverable?
	- [[Destination Context]] — Why the first question that is asked is "Where?"
	- [[Deferred Field Resolution]] — Reviews how a WIP content file iterates on fields
	- [[Lifecycle of a Template]] — The stages a template and its content files move through
		- [[Template Lifecycle Overview]] — Overview of the Template Lifecycle
		- [[Template Stage]] — Stage 1: Creating the Document Template
		- [[Instantiation]] — Transition: Creating a Content File from a template
		- [[WIP Stage]] — Stage 2: Working with a Work-in-Progress Content File
		- [[Finalization]] — Transition: Fully processing all template fields remaining in a content file
		- [[Finalized Stage]] — Stage 3: The end result — a completed content file in the vault
		- [[Typical Templates Workflow]] — Maps the Lifecycle into a Templates Workflow

5. **[[Template Folders]] — How to store and organize Template Files in a vault using Template Folders**
	- [[What is a Template Folder|What is a Template Folder?]] — What fundamentally is a Template Folder?
	- [[Template Organization]] — How to organize templates in your vault
	- [[Template Folder Hierarchies]] — How to build a context-sensitive templating system
	- [[Template Folder Subfolders]] — Can template folders have subfolders?
	- [[Hiding Template Folders]] — How to deal with the proliferation of template folders

6. **[[Template Fields]] — Placeholders written with `{{curlybraces}}` that are filled in with data when a template is instantiated**
	- [[Template Fields Overview]] — An overview of fields inside Z2K Templates
	- [[Template Field Flavors]] — Types of fields (automated, user specified)
	- [[Field Syntax]] — The forms a field can take: `{{varName}}`, `{{{varName}}}`, helper parameters, and dot notation
	- [[Syntax Highlighting]] — How Z2K Templates highlights fields in Obsidian's editor
	- [[Field Types]] — The data types a field can hold and how they affect prompting and external data conversion
	- [[Field Data Sources]] — Reviews all the ways data can be provided to fill in a template field
	- [[Special Characters in Text]] — How escape sequences and special characters behave in field values across different transports
	- [[Restricted Functionality Mode]] — Limitations of using fields in complex expressions


## Intermediate

7. **[[Built-In Fields]] — Pre-defined field names that are automatically filled in whenever the template is created**
	- [[Built-In Fields - Date and Time|Date and Time]] — Built-in date and time fields
		- [[date]] — Today's date
		- [[time]] — Current time in the format `HH:mm`
		- [[now]] — Today's date and time
		- [[utcTime]] — Current time expressed in UTC
		- [[today]] — Today's date (alias of `{{date}}`)
		- [[yesterday]] — Yesterday's date
		- [[tomorrow]] — Tomorrow's date
		- [[timestamp]] — A full zettelkasten timestamp of the format `YYYYMMDDHHmmss`
		- [[dayOfWeek]] — The name of the day of the week
		- [[weekNum]] — The ISO week number
		- [[year]] — The current year
		- [[yearWeek]] — The current year and ISO week
		- [[yearMonth]] — The date with the format `YYYY-MM`
		- [[yearMonthName]] — The date with the format `YYYY-MM MMMM`
		- [[yearQuarter]] — The current year and quarter
	- [[Built-In Fields - File Data|File Data]] — Built-in fields associated with the content file being created
		- [[fileTitle and Variations|fileTitle]] — The name of the content file being created
		- [[creator]] — Name of the file creator specified in Settings
		- [[fileCreationDate]] — Creation date of the file being operated on
	- [[Built-In Fields - Template Data|Template Data]] — Built-in fields about the template used to create files
		- [[templateName]] — The name of the template used to create a file
		- [[templateVersion]] — The version number of the template
		- [[templateAuthor]] — The author of the template
	- [[Built-In Fields - Misc|Misc Built-In Fields]] — Miscellaneous built-in fields
		- [[clipboard]] — The current contents of the system clipboard
		- [[sourceText]] — Used to insert bulk text data into a template file
	- [[Built-In Fields - Z2K System|Z2K System]] — Built-in links to other cards in a Z2K System vault
	- [[Modifying Built-In Field Behaviors]] — Using `{{fieldInfo}}` to modify how built-in fields behave
	- [[Custom Built-In Fields]] — Creating your own fields that resolve automatically, like built-ins

8. **[[Naming Conventions]] — Distinct naming conventions for fields, helpers, template files, folders, and YAML properties**
	- [[Naming Overview]] — A summary of every naming style and where it applies
	- [[Naming Fields]] — Naming rules for built-in and user-defined template fields
	- [[Naming Helpers]] — Naming conventions for built-in and user-defined helper functions
	- [[Naming Templates]] — Naming conventions for template files
	- [[Naming Template Folders]] — Naming conventions for template folders

9. **[[Data Formatting]] — How data appears in the final output, from automatic defaults to built-in formatting helper functions**
	- [[Data Formatting Overview]] — How formatting fits into the template lifecycle
	- [[Default Formatting Rules]] — What happens automatically to all data
	- [[Native Handlebars Formatting]] — Formatting features built into Handlebars syntax
	- [[Formatting Text]] — Case changes, trimming, wrapping, and escaping
	- [[Formatting Dates]] — Displaying dates and times in various formats
	- [[Formatting Numbers]] — Decimal places, thousands separators, currencies
	- [[Formatting Lists]] — Rendering multi-select values as bullets or comma-separated text
	- [[Formatting for Files and URLs]] — Slugs, URI encoding, and filename-safe strings
	- [[Writing Custom Formatting Functions]] — Creating your own helper functions in JavaScript

10. **[[Prompting]] — How the interactive prompting interface works and how it can be customized**
	- [[Prompting Interface]] — The modal dialog where you fill in field values
	- [[Prompting Interface per Type]] — What each field type looks like in the prompting modal
	- [[Prompting Defaults]] — What happens when no `{{fieldInfo}}` is specified
	- [[Prompt Touching]] — How field interaction determines what values are committed
	- [[Fallback Behavior]] — What happens to untouched fields during finalization
	- [[Built-in Helpers for Prompting|Helpers for Prompting]] — How `{{fieldInfo}}` parameters control the prompting interface

11. **[[Helper Functions]] — Using Helper Functions to provide additional functionality in template files**
	- [[Helper Functions Overview]] — General guideline to Helper Functions
	- [[Using Fields in Parameters]] — How to use `{{fields}}` inside Helper Functions
	- [[Using Nested Helper Functions]] — How to nest Helper Functions inside other Helper Functions
	- [[Silent Helper Functions]] — A special class of Helper Functions that are silent
	- [[Custom Helper Functions]] — How to build your own Helper functions

12. **[[Built-In Helper Functions]] — Pre-defined helper functions for formatting, linking, math, and more**
	- [[fieldInfo Functions]] — Helpers for specifying information about fields
	- [[Formatting Functions]] — Helpers for formatting output
		- [[formatDate]] — Formats a date with a moment.js format string
		- [[formatNumber]] — Formats a number with a format string
		- [[formatNumberToFixed]] — Formats a number to a fixed number of decimal places
		- [[formatString]] — Formats a string with additional text
		- [[formatStringToUpper]] — Formats a string into all caps
		- [[formatStringToLower]] — Formats a string into all lowercase
		- [[formatStringSlugify]] — Formats a string into URL-friendly text for slugs
		- [[formatStringEncodeURI]] — Formats a string into a URI-friendly text string
		- [[formatStringEncodeBase64]] — Formats a string into Base64 encoding
		- [[formatStringSpacify]] — Converts a collapsed-spaces string into a name with spaces
		- [[formatStringCommafy]] — Renders a multiselect list's active elements as a comma-separated string
		- [[formatStringTrim]] — Removes all preceding and trailing whitespace from a field
		- [[formatStringRaw]] — Prevents any escaping of characters in the final output
		- [[formatStringBulletize]] — Formats source data into a bulleted list using dashes
		- [[formatStringFileFriendly]] — Makes a file-friendly version of a string
	- [[Linking Functions]] — Helpers for building links
		- [[wikilink]] — Formats a field as a wikilink
		- [[hashtag]] — Formats a string as a hashtag
		- [[url]] — Formats a field as a URL
		- [[google]] — Generates a link to a Google search
		- [[chatGPT]] — Generates a link to a ChatGPT chat
		- [[wikipedia]] — Generates a Wikipedia search link
	- [[Math Functions]] — Helpers for doing basic math or manipulations of fields
		- [[Arithmetic Operators]] — Basic arithmetic operations (`add`, `subtract`, `multiply`, `divide`)
		- [[calc]] — Performs a calculation
		- [[dateAdd]] — Adds time to a date field
		- [[random]] — Picks a random item from an array
	- [[Misc Functions]] — Assortment of miscellaneous helpers
		- [[Comparison Operators]] — Compare values for conditional logic
		- [[arr]] — Creates an array from arguments
		- [[obj]] — Creates an object from named parameters
		- [[Type Conversion Helpers]] — Convert values between types

13. **[[fieldInfo Helper|fieldInfo Helper Function]] — Controls how a template field behaves: type, prompting, suggest values, fallback behavior, and directives**
	- [[fieldInfo Cheat Sheet|Cheat Sheet]] — A brief one-page summary of the `{{fieldInfo}}` helper function
	- [[fieldInfo Syntax|Syntax]] — Syntax of the underlying helper function
	- [[fieldInfo Output|Output]] — What does the `{{fieldInfo}}` helper output?
	- [[fieldInfo Parameters|Parameters]] — Steps through `{{fieldInfo}}` (and `{{fieldOutput}}`) parameters
		- [[fieldInfo fieldName|fieldName]] — The name of the field you are providing data for (required)
		- [[fieldInfo prompt|prompt]] — The prompt message displayed to the user
		- [[fieldInfo suggest|suggest]] — The suggested value to pre-fill in the prompt
		- [[fieldInfo type|type]] — The type of data associated with the field
		- [[fieldInfo fallback|fallback]] — The value used if the user never provides a value
		- [[fieldInfo directives|directives]] — Advanced control of prompting
		- [[fieldInfo opts|opts]] — Possible field values for singleSelect and multiSelect fields
		- [[fieldInfo value|value]] — Manually assign values to a field
	- [[fieldInfo value Use Cases|value Use Cases]] — Catalog of patterns and examples for the `value` parameter
	- [[fieldInfo Usage Tips|Usage Tips]] — Tips for using `{{fieldInfo}}` and best practices
	- [[fieldInfo Examples|Examples]] — Example templates that make use of `{{fieldInfo}}`
	- [[fieldInfo Variations]] — Similar functions within the same family
		- [[fieldOutput Helper Variation|fieldOutput]] — Sister function that outputs the field value
		- [[fi Helper Variation|fi]] — Abbreviated version of `{{fieldInfo}}`
		- [[fo Helper Variation|fo]] — Abbreviated version of `{{fieldOutput}}`
	- [[fieldInfo and Block Templates]] — How to use `{{fieldInfo}}` with block templates

14. **[[Handlebars Support]] — How Z2K Templates uses and extends the Handlebars library, with notes on subtleties and incompatibilities**
	- [[Handlebars and Z2K Templates]] — Overview of how Z2K Templates uses and extends the Handlebars library
	- [[Template Comments]] — Comment syntax and Z2K Templates' line-aware removal behavior
	- [[Unescaped Expressions]] — How escaping and raw output work in a Markdown-focused environment
	- [[Whitespace Control]] — Trimming whitespace around expressions with tildes
	- [[Conditionals]] — Using `{{#if}}` and `{{#unless}}` with Z2K Templates' deferred fields
	- [[Iterators]] — Using `{{#each}}` with arrays, objects, and partials
	- [[Logging]] — Using `{{log}}` for debugging templates
	- [[Raw Blocks]] — Preventing template processing within a block
	- [[Block Helpers]] — Custom block-level helpers and their limitations in Z2K Templates
	- [[Partials]] — Partial syntax, resolution, and dynamic selection

15. **[[Block Templates]] — Reusable fragments of markdown that can be inserted inside existing files**
	- [[What is a Block Template|What is a Block Template?]] — What fundamentally is a Block Template?
	- [[Why Use Block Templates|Why Use Block Templates?]] — When are Block Templates useful?
	- [[How Do You Use Block Templates|How Do You Use Block Templates?]] — How to actually use a Block Template
	- [[Where Do You Store Block Templates|Where Do You Store Block Templates?]] — Where to put them in your vault
	- [[Block Template Requirements]] — What makes a Block Template be recognized as one?
	- [[Block Template File Structure]] — What is the structure of a Block Template file?
	- [[What Happens When You Insert A Block|What Happens When You Insert A Block?]] — Steps through the process of inserting a block

16. **[[Settings Page]] — Configuring Z2K Templates through Obsidian's built-in Settings interface**
	- [[General Settings]] — Core plugin settings
		- [[Templates Root Folder]] — Scopes the entire plugin to a specific folder in your vault
		- [[Creator Name]] — Sets the value inserted into the `{{creator}}` field
		- [[Templates Folder Name]] — Defines the folder name the plugin uses to identify template folders
		- [[Name for Files]] — Sets the terminology used for files throughout the plugin interface
	- [[Command Queue Settings]] — Automated processing of queued JSON command files
		- [[Enable Command Queue]] — Master toggle for the queue system
		- [[Queue Folder (Settings)|Queue Folder]] — The folder the plugin watches for incoming command files
		- [[Scan Frequency]] — How often the plugin checks for new command files
		- [[Pause Between Commands]] — Delay inserted between processing each command
		- [[Archive Duration]] — How long processed command files are retained
		- [[Duration Format]] — Reference for the duration value format used by these settings
	- [[Error Logging Settings]] — Log file path and severity level
		- [[Error Log Level]] — The minimum severity level that triggers a log entry
		- [[View Error Log]] — Opens the live log viewer and clears the log
	- [[Quick Commands Settings]] — Custom commands for quickly creating files from the Command Palette
		- [[Edit Quick Commands]] — Open the Quick Commands editor to add, configure, and reorder commands
	- [[Advanced Settings]] — File extension handling, global block content, and custom helpers
		- [[File Extension Settings]] — Toggle `.template` and `.block` file extensions
			- [[Use Template File Extensions]] — Enable the `.template` and `.block` file extensions
			- [[Template Files Visible in File Explorer]] — Show or hide template files in Obsidian's file explorer
		- [[Global Block Settings]] — A global template block prepended to every template before rendering
			- [[Global Block Editor]] — Edit the global block content
		- [[Custom Helper Settings]] — Custom Handlebars helper functions written in JavaScript
			- [[Enable Custom Helpers]] — Toggle to activate the custom helpers feature
			- [[Edit Custom Helpers]] — Code editor for writing and registering custom helper functions


## Advanced

17. **[[Template File Extensions]] — Using custom file extensions (`.template`, `.block`) to distinguish template files from regular notes**
	- [[Template Pollution]] — What is the problem with storing templates as normal markdown files in your vault
	- [[Valid File Extensions]] — A summary of valid file extensions
		- [[Extension .md]] — The default normal markdown extension
		- [[Extension .template]] — A custom file extension for holding Document Templates
		- [[Extension .block]] — A custom file extension for holding Block Templates
	- [[Obsidian and File Extensions]] — How Obsidian treats the `.template` and `.block` file extensions
	- [[Changing File Extensions]] — How to use the Z2K Plugin to change file extensions
	- [[Editing .template and .block Files]] — How to edit template files after they have been converted to custom file extensions
	- [[File Extension Process Guide]] — Recommendations for using these custom file extensions

18. **[[System Blocks]] — Advanced feature for automatically including system-wide content into new files through hierarchically embedded block templates**
	- [[Intro to System Blocks]] — What System Blocks are, how `.system-block.md` files are placed throughout the vault hierarchy, and how they differ from the Global Block
	- [[Why Use System Blocks]] — Common use cases: vault-wide headers, required metadata, standard tags, and folder-scoped `{{fieldInfo}}` defaults
	- [[Using System Blocks and YAML]] — How to inject and hierarchically override YAML frontmatter using system blocks at each folder depth
	- [[Using System Blocks and fieldInfo]] — How to scope `{{fieldInfo}}` declarations across a folder hierarchy for default prompting and location-aware field values
	- [[Using System Blocks and Markdown]] — How to use system blocks to inject preamble markdown content at each folder level ==stub — not yet written==
	- [[System Block Stops]] — The `.system-block-stop` file: how to cut the upward inheritance chain at a specific folder

19. **[[Global Block]] — A vault-wide block of template content automatically prepended to every template before rendering**
	- [[Global Block Overview]] — Overview of the Global Block, its scope, and how to use it
	- [[Global Block and Markdown]] — Using the global block to inject Markdown content into every file
	- [[Global Block and fieldInfo]] — Using the global block for vault-wide field declarations and resolution order
	- [[Global Block and Field Values]] — Using the global block to define values for fields
	- [[Global Block and YAML]] — Using the global block to inject default YAML frontmatter
	- [[Global Block Examples]] — Quick links to example use cases for the global block

20. **[[Z2K Templates and YAML|YAML Integration]] — Using YAML frontmatter as both a target for template fields and a source of data for templates**
	- Using Fields Inside YAML
		- [[Using Fields Inside YAML Metadata]] — How to place `{{field}}` expressions in your YAML frontmatter
	- Using YAML as a Data Source
		- [[Using YAML Metadata as Fields]] — How YAML properties become available as Handlebars fields
		- [[Storing Field Values in YAML]] — How to persist field data in YAML for use by block templates after finalization
	- YAML Across Templates
		- [[YAML and Block Templates]] — How YAML frontmatter is handled when block templates are inserted
		- [[Merging Multiple YAML Sources]] — How frontmatter from multiple sources is combined
		- [[Using System Blocks for Scoped YAML Fields]] — How to use system blocks to provide hierarchical, context-sensitive YAML values
	- YAML Configuration
		- [[YAML Configuration Properties|YAML Fields the Z2K Template Plugin Uses]] — Pre-defined YAML properties that control plugin behavior
			- [[z2k_template_type]] — Declares how the plugin treats a file (template vs. content)
			- [[z2k_template_name]] — Overrides the template's display name
			- [[z2k_template_author]] — Assigns an author attribution to the template
			- [[z2k_template_version]] — Assigns a version identifier to the template
			- [[z2k_template_suggested_title]] — Provides a suggested filename for new notes created from the template
			- [[z2k_template_default_fallback_handling]] — Sets the default fallback behavior for fields without explicit fallback directives
			- [[z2k_template_default_prompt]] — Sets a default prompt string for all fields in the file

21. **[[URI, JSON, Command Queues]] — Triggering Z2K Templates externally through URIs, JSON data packages, and queued command files**
	- [[JSON Packages]] — The standard data format for passing commands and field data into Z2K Templates
		- [[JSON Packages Overview]] — What Z2K Templates JSON Packages are and how the `CommandParams` structure works
		- [[JSON Structure]] — The `.json` single-command file specification
		- [[JSON Commands]] — Per-command reference for `new`, `continue`, `upsert`, and `insertblock`
			- [[JSON Command - new]] — Create a new note from a template
			- [[JSON Command - continue]] — Continue filling fields in an existing note
			- [[JSON Command - upsert]] — Create a note if it doesn't exist, or update it if it does
			- [[JSON Command - insertblock]] — Insert a block template into a file
		- [[JSON Directives]] — The directives or parameters that control how a command is performed
		- [[JSON Field Data]] — How field data is passed within the JSON Package
		- [[fieldData]] — The `fieldData` parameter for bundling field data separately from command directives
		- [[JSONL Format]] — The `.jsonl` batch file specification for sending multiple commands
		- [[JSON64 Format]] — Base64-encoded JSON for transport-constrained environments
		- [[JSON Type Conversion]] — How JSON-sourced values preserve native types versus URI string coercion
	- [[URI Actions]] — Triggering template commands from outside Obsidian via URI links
		- [[URI Syntax]] — The structure of a Z2K Templates URI and how its parts fit together
		- [[URI Commands]] — The commands available via URI
			- [[URI Command - new]] — Create a new note from a template
			- [[URI Command - continue]] — Fill remaining fields in an existing WIP note
			- [[URI Command - upsert]] — Create a note if it doesn't exist, or update it if it does
			- [[URI Command - insertBlock]] — Insert a block template into an existing note
			- [[URI Command - fromJson]] — Execute a full command packaged as a JSON string
		- [[URI Directives]] — Parameters that control command behavior
		- [[URI Field Data]] — How to supply values for template fields
		- [[URI Encoding]] — How special characters are handled in URI values
		- [[URIs with JSON Data]] — Advanced methods for passing field data as JSON
		- [[URI Type Handling]] — How string values from URIs are converted to typed data
		- [[Building URIs]] — Practical guidance for constructing URIs from shell scripts, Apple Shortcuts, and bookmarks
	- [[Command Queues]] — Queuing template commands as files for automated or batch processing
		- [[Command Queues Overview]] — What Command Queues are and how the system works at a high level
		- [[Queue Folder]] — Where command files live and how the folder is structured
		- [[Queue Processing]] — How files are picked up, ordered, and executed
		- [[Queue Settings]] — Configuration options for the Command Queue system
		- [[Command File Lifecycle]] — The states a command file moves through from creation to completion
		- [[Retry and Error Handling]] — Retry logic, failure classification, and error recovery
		- [[Delayed Commands]] — Scheduling commands for future execution
		- [[Debugging Command Queues]] — Diagnosing stuck, failed, or misbehaving commands

22. **[[Debug and Error Handling]] — Layered error handling through inline validation, modal dialogs, and a configurable error log**
	- [[Error Handling Overview]] — How the plugin surfaces errors and where feature-specific error behaviors are documented
	- [[Error Log]] — The error logging system, its settings, and how to read log entries
	- [[Debugging Tips]] — Practical guidance for diagnosing template issues


## Misc

23. **[[Appendix]] — Supplementary reference material for the Z2K Templates Reference Manual**
	- [[Fields & Helpers|Fields & Helpers Reference]] — A quick-reference table of every built-in field and helper function
	- [[Glossary]] — Definitions of core terms used throughout the reference manual
	- [[Reference Manual for AI]] — A condensed version of the reference manual intended for AI agents
