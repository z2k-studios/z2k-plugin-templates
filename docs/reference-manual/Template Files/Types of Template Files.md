---
sidebar_position: 40
doc_state: revised_ai_draft_2
aliases:
- Template Type
- Template Types
- types of template files
---
# Types of Template Files
Z2K Templates supports two distinct kinds of template files: [[#Document Templates]] and [[#Block Templates]]. If it is not a template file, then it is considered a "[[#Content Files|Content File]]". 

This reference page steps through the different types of templates, how they are determined, and how are they treated differently:

- [[#The Template Types]] - the different types of templates (and non-template) files
	- [[#Document Templates]] - whole file templates
	- [[#Block Templates]] - snippets of templated text
	- [[#Content Files]] - non-template files
- [[#How is the Type of Template Determined?]]
- [[#How are Block and File Templates Treated Differently?]]
- [[#Brief Examples]]


## The Template Types

### Document Templates
**Document Templates** are files that are templates for an entire file (note) in the vault. This is the default type of template used by Z2K Templates. In most contexts and throughout the reference manual, Document Templates are just called "Templates".

### Block Templates
**Block Templates** are files that a snippets of templated content to be inserted into the files (notes) in the vault. These are typically stored in the Templates folder and are identified as block templates with the [[z2k_template_type]] yaml property.  For more details, please see [[Block Templates]].


> [!NOTE] System Block Templates
> In addition to standard block templates stored in the vault, there are also a special kind of block template called [[Intro to System Blocks|System Blocks]]. See the reference manual section on [[Block Templates]] and [[System Block Templates|System Blocks]] for more details. 

## What is NOT a Template?
### Content Files
In contrast, if a file in your vault is *not* a template file at all, then we refer to these as "**Content Files**", as they contain actual content and not templated placeholders for content. In the context of the [[Lifecycle of a Template]], if a content file was created by instantiating a template, then it may either be:
- a [[WIP Stage|WIP Content File]] if it still has fields to be filled out (and so behaves as a half-template / half-content file), or 
- a [[Finalized Stage|Finalized Content File]] if it is completely [[Finalization|finalized]].

## How is the Type of Template Determined?
To determine which type of template a template file is, the Z2K Templates plugin looks at a number of successive indicators to make a decision. In order of precedence, they are:

1. **YAML Explicit Declaration**: Does the file explicitly declare its type with the [[z2k_template_type]] YAML configuration setting? If so, the plugin follows this guidance first. 
2. **File Extension Declaration**: Does the file explicitly declare its type with its [[Valid File Extensions|file extension]]? If so, then it will use that to decide on the type.
3. **Folder Location**: If a file is stored in a [[Template Folders]] but without #1 or #2 clarified, then it is considered a Document Template .
4. **URI or JSON Action**:  If a file has been explicitly passed as a template file within a URI or Command List action, then the plugin will treat it as a template file regardless of its location.
5. **Otherwise**, the file is not considered to be a template at all, and is marked as a normal content file.

See [[Template Requirements]] for more details. 

## How are Block and File Templates Treated Differently?
So why does it matter whether or not it is a document-level template or a block-level template? In reality, the distinction only appears a few times:

1. When inserting a block template with an Obsidian Command Prompt (e.g. "[[Insert block template]]" and "[[Insert block template using selected text]]"), it will only display block templates to choose from. Note: Using the [[Partial Expression]] however does not prevent the insertion of a Document Template. 
2. When creating a new file from a template with an Obsidian Command Prompt (e.g. "[[Create new note]]" and "[[Create note from selected text]]"), it will only display document templates to choose from.
3. ==Any other ways?==

## Brief Examples

### Document Template via YAML

```yaml
---
z2k_template_type: document-template
title:
  prompt: "Title?"
---
# {{title}}
```

### Block Template via YAML

```yaml
---
z2k_template_type: block-template
---
**Note:** {{text}}
```

### Document Template via Folder Placement
Consider this file and its path:

```
/People/Templates/Birthday Note.md
```

Notice that the file has been placed in a [[Template Folders|templates folder]] and thus will be identified as a Template file. It will be treated as a [[#Document Templates]] unless it has a [[YAML Configuration Properties|YAML Configuration Property]] identifying it as a [[#Block Templates|Block Template]].

### Document Template via File Extension
The following filename identifies it as a markdown file to be interpreted as a [[#Document Templates|Document Template]].

```
Personal Yearly Strategic Plan.template
```

### Block Template via File Extension
The following filename identifies it as a markdown file to be interpreted as a [[#Block Templates|Block Template]].

```
Contact Address Block.block
```
