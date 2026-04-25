---
sidebar_position: 20
aliases:
- glossary
- Glossary
---
# Glossary
A reference guide to the core terms used throughout the Z2K Templates Reference Manual, listed alphabetically.

## Block Helpers
Handlebars language constructs — `{{#if}}`, `{{#each}}`, `{{#unless}}`, `{{#with}}` — that control rendering logic and flow inside a template. Distinct from [[Block Templates]], which are Z2K's modular content fragments. See [[Handlebars Support]].

## Block Template
A reusable fragment of markdown that is inserted into an existing document or template file, rather than creating a new one. Block Templates are the Z2K Templates equivalent of "Partials" in Handlebars. See [[Block Templates]].

## Built-In Field
A template field automatically populated by the system during file creation — no user input required. Common examples include `{{date}}`, `{{time}}`, and `{{creator}}`. See [[Built-In Fields]].

## Built-In Helper Function
A predefined [[Helper Functions|helper function]] shipped with Z2K Templates for common tasks such as date formatting, string manipulation, and generating wikilinks. See [[Built-In Helper Functions]].

## Command Queue
A file-based automation system that processes [[JSON Packages|JSON Package]] command files dropped into a watched directory, including when Obsidian is not actively running. See [[Command Queues Overview]].

## Commands
The set of actions Z2K Templates registers with Obsidian, accessible via the Command Palette, right-click context menus, and [[Quick Commands|Quick Command]] shortcuts. See [[Commands]].

## Content File
A normal vault file that is not a template — it holds actual content rather than field placeholders. A content file may be in a [[WIP Stage|WIP]] state (fields still unresolved) or a [[Finalized Stage|Finalized]] state (fully processed). See [[Types of Template Files#What is NOT a Template?|Content Files]]

## Deferred Field Resolution
The ability to leave template fields unresolved in a content file and supply their values later, rather than requiring all data at the moment of [[Instantiation|instantiation]]. Fields persist as live placeholders and are filled by issuing the [[Continue Filling File]] command. See [[Deferred Field Resolution]].

## Directives
Special parameters inside `{{fieldInfo}}` that govern how a field behaves during prompting and finalization, producing no visible output themselves. Examples include `required`, `no-prompt`, and `finalize-preserve`. See [[fieldInfo directives]].

## Document Template
A template file that serves as a blueprint for creating an entire new note in the vault. When instantiated and finalized, it produces a new  [[Types of Template Files#Content Files|Content File]] with fields resolved. Contrast with a [[Block Templates|Block Template]]. See [[Types of Template Files]].

## Fallback Behavior
The configured action Z2K Templates takes when a field has no value at [[Finalization|finalization]] — options include clearing the placeholder, preserving it as-is, or substituting a defined default value. See [[Fallback Behavior]].

## Field
A placeholder enclosed in double curly braces — `{{FieldName}}` — embedded in a template that gets replaced with actual data when the template is instantiated or finalized. Fields are the fundamental unit of all Z2K Templates. See [[Template Fields Overview]].

## fieldInfo
A [[Silent Helper Functions|silent helper function]] — `{{fieldInfo FieldName ...}}` — used to declare metadata about a field: its data type, prompt text, suggested value, fallback, and other behaviors. It produces no output in the rendered file. See [[fieldInfo Helper]].

## Finalization
The process of resolving all remaining fields in a content file, applying [[Fallback Behavior|fallback behavior]] to empty fields, removing silent helpers and comments, and marking the file as complete. See [[Finalization]].

## Finalized Content File
A content file that has been fully processed through [[Finalization|finalization]], with all template markup removed and all fields resolved or cleared. It is the end product of the template lifecycle. See [[Finalized Stage]].

## Global Block
A single block of template content — configured exclusively through plugin settings — that is automatically prepended to every  [[Types of Template Files#Document Templates|Document Template]] before rendering, regardless of which folder the template lives in. See [[Global Block Overview]].

## Handlebars
The JavaScript templating library whose `{{expression}}` syntax Z2K Templates is built upon. Z2K Templates extends Handlebars with interactive prompting, [[Deferred Field Resolution|deferred resolution]], and custom helpers that go well beyond what Handlebars supports natively. See [[Handlebars Support]].

## Helper Functions
Special `{{expressions}}` that perform computations or transformations — formatting a date, wrapping text in a wikilink, running conditional logic — rather than simply inserting stored data. Their syntax is `{{helperName param1 param2}}`. See [[Helper Functions Overview]].

## Instantiation
The act of creating a new content file from a template: the plugin copies the template, opens the [[Prompting Interface|prompting interface]] for field data, resolves what it can, and saves the result to the vault. See [[Instantiation]].

## JSON Package
A structured JSON object used to pass commands and field data to Z2K Templates from external sources. It is the shared data format used by [[URI Actions]], [[Command Queues]], and automation scripts. See [[JSON Packages Overview]].

## Obsidian
The local-first note-taking application that Z2K Templates extends. Obsidian stores notes as plain Markdown files in a folder on your device called a "vault."

## Obsidian Plugin
An extension that adds functionality to Obsidian beyond its built-in features. Z2K Templates is an Obsidian Plugin installed through Obsidian's community plugin browser.

## Partials
The Handlebars term for what Z2K Templates calls [[Block Templates]] — reusable template fragments referenced via `{{> BlockName}}` syntax. Z2K Templates uses "Block Templates" as the preferred term throughout this documentation. See [[Block Templates]].

## Prompting Interface
The modal dialog Z2K Templates presents when creating or continuing to fill a content file, where users supply values for each unresolved field. See [[Prompting Interface]].

## Quick Command
A user-configured shortcut that pre-sets the action, destination folder, and template for instant access from the Command Palette or via a keyboard hotkey — bypassing the standard selection dialogs. See [[Quick Commands Overview]].

## Restricted Functionality Mode
A limited rendering context active when Z2K Templates evaluates expressions embedded inside `{{fieldInfo}}` parameter strings (such as `prompt`, `suggest`, and `fallback` values). [[Block Templates]] and `{{fieldInfo}}` declarations are not available in this mode. See [[Restricted Functionality Mode]].

## Silent Helper Function
A helper function that executes and affects template behavior but produces no visible output in the rendered document. `{{fieldInfo}}` and Handlebars comments are the primary examples. See [[Silent Helper Functions]].

## System Block
A special block template stored in a `.system-block.md` file placed directly within the vault's folder hierarchy. It automatically inserts its YAML and/or Markdown content into every new file created at that folder level and all subfolders below it. See [[Intro to System Blocks]].

## Template
A Markdown file in your Obsidian vault that acts as a blueprint for creating new content files. It contains static text, `{{fields}}` as data placeholders, helper functions, and optional YAML metadata. See [[What is a Template File]].

## Template File Extensions
Optional custom file extensions — `.template` for document templates and `.block` for block templates — that allow template files to be identified by their extension alone, without requiring them to live inside a named Templates folder. See [[Template File Extensions]].

## Template Folder
A consistently named folder within your Obsidian vault — `Templates` by default — that contains template files and signals to Z2K Templates where to look for available templates. See [[What is a Template Folder]].

## Template Lifecycle
The three-stage progression a  [[Types of Template Files#Document Templates|Document Template]] passes through: the **Template Stage** (the template file itself), the **WIP Stage** (an instantiated but not yet finalized content file), and the **Finalized Stage** (a fully resolved content file with all template markup removed). Two transitions move a file between stages: [[Instantiation]] and [[Finalization]]. See [[Template Lifecycle Overview]].

## Templates Root Folder
A configurable setting that restricts all Z2K Templates activity — template discovery, file creation, and contextual commands — to a specific subfolder of your vault. When left blank, the plugin operates across the entire vault. See [[Templates Root Folder]].

## URI
A Uniform Resource Identifier — a clickable link that triggers Z2K Templates commands from outside Obsidian, via browser bookmarks, Apple Shortcuts, shell scripts, or other automation tools. See [[URI Actions]].

## Vault
The folder on your device that Obsidian treats as its working directory, containing all your notes, attachments, and plugin data. All Z2K Templates activity is scoped to the vault, or to a designated subfolder within it via the [[Templates Root Folder]] setting.

## WIP Content File
A content file produced by [[Instantiation|instantiating]] a template that still contains unresolved `{{fields}}`, existing in a half-template / half-content state. WIP stands for Work-in-Progress. Iteration continues via [[Continue Filling File]] until the file is [[Finalization|finalized]]. See [[WIP Stage]].

## YAML
A structured key-value metadata format placed at the top of Obsidian notes between `---` delimiters (frontmatter). Z2K Templates supports `{{fields}}` inside YAML values, enabling dynamic metadata that resolves when a template is instantiated. See [[Z2K Templates and YAML]].

