---
sidebar_position: 1
sidebar_folder_position: 140
aliases:
- Partials
- Partial Templates
- Block Template
---
# Block Templates

## Overview
In addition to file level [[Types of Template Files#Document Templates|Document Template Files]], the Z2K Templates plugin also supports *block level* templates that can be inserted inside of an existing file. 

## Contents
- [[What is a Block Template|What is a Block Template?]] - what fundamentally is a Block Template? 
- [[Why Use Block Templates|Why Use Block Templates?]] - when are Block Templates useful?
- [[How Do You Use Block Templates|How Do You Use Block Templates?]] - How do you actually use a Block Template?
- [[Block Template Requirements]] - what makes a Block Template be recognized as one?
- [[Block Template File Structure]] - what is the structure of a Block Template File?


---
# Block Templates (Partials)

## What Is a Block Template?

A **Block Template** is a reusable fragment of markdown. It is not used to create a new file. Instead it is:

- Inserted into an existing document
- Turned into body content during Named Template rendering
- Used to build modular, composable templates

Block Templates are typically small, structured units such as:

- A checklist block
- A project metadata block
- A quote or highlight block
- A standard header/footer snippet

### Example Block Template

```md
## Task
- [ ] {{taskName}}
- Priority: {{priority}}
```

Inserted via:

- *Insert block template*
- *Insert block template using selection*
- Or inside another template:

```
{{> tasks/task-block }}
```


## Why Use Block Templates

The Z2K Template Plugin supports the concept of "*Partial Templates*", or also just called "*Partials*". These special templates are intended to be *block level* template text that can be inserted inside of another file. 

Partials are extremely useful for enforcing consistent naming and formatting of text blocks across multiple files.

---

## How the Plugin Identifies a Block Template

Z2K determines a block template using:

### 1. **YAML override**

```yaml
z2k_template_type: partial
```

This is the highest-precedence signal.

### 2. **Convert-to-block command**

When you run:

- *Convert file to block template*

…the plugin writes the appropriate YAML override.

### 3. **Folder placement (experimental but supported)**

A file located in a card type's `/Partials` or `/Blocks` subfolder can optionally be treated as a partial depending on naming conventions. This behavior is less strict than named template resolution and may evolve further.

### 4. **Everything else is not a block template**

If none of the above apply, it’s a normal file (or possibly a Named Template if other rules match).

---

# System Block Templates

**System Block Templates** are injected globally into templates before rendering.

Examples include:

- Vault-wide header/footer blocks
- Global metadata such as creator info or timestamps
- Standard tags
- Required fields

They behave like invisible partials:

- They merge **before** template YAML
- Their `field-info` definitions can be overridden by template-level fields
- Their content is prepended to template bodies

This allows an entire vault to maintain consistent structure without repeating boilerplate.

---


# Block Template Naming Conventions
Block Templates' filenames must be prefixed with the text "`Partial - `". 
Note: this prefix can be changed inside the plugin's setting page.

# Inserting Blocks
Blocks can be inserted into a file via two methods:
1. By using the "Insert Block Template into Card" command inside Obsidian. This can be done via an Obsidian Command request or by right clicking in the text of an existing card.
2. By forcing a inclusion of the partial template's text using Handlebars' `{{> partialTemplateFile.md}}` field. 

# YAML Data and Partials
The Z2K Templates Plugin attempts to be smart at how to handle YAML frontmatter found in the partial template file being inserted. If the partial contains yaml data, it will extract those entries and add them into the card's YAML frontmatter. 

*Note:* The plugin will not perform any error checking. For instance, if the YAML field is already present in the destination file's YAML, a duplicate entry may occur. 

# Advanced Field Functions
Block Templates support the full range of advance formatting and prompting features. Thus, you can use builtin functions and advanced Handlebars syntax within the partial template, assuming the underlying feature is supported (see [[Handlebars Support]])

# Dev Notes:
*TODO: Move to Design Notes folder - but first review what items to share with users.*
Captures all the partials using the same scope logic as the templates, registers them with handlebars.

Do blocks template ever need block templates from other directories besides the template scope logic?
- Likely, yes
How should partials be referenced when they are in parent directories?
- Should be answered now
Passing context - this won't be allowed because we're not allowing fields.with.dots, right?
- Shouldn't worry about this right now
Does the prompt need to prompt for the fields in the partials?
- Yes
Should relative paths be relative to the template or relative to the new card location?
- donno, just do relative to template



When referencing block templates, use the name of the block template like this:
`{{> block template}}`

If there are multiple block templates with the same name, it will pick the one that is closest to the template, in this order:
1) Same folder
2) Parent folder
3) Grandparent folder
4) ...
5) Root folder
6) Child folder
7) Grandchild folder
8) ...
9) Any sibling folder/cousin folder (undefined order)

When using [[Block Templates]], the extra templates folder name can optionally be omitted from the path. This means that, for example, `/z2k/folderA/Templates/partial` can be referenced using `folderA/Templates/partial` or `folderA/partial`. In cases where this creates ambiguity, you must use the path with the Embedded Templates folder name, like `folderA/Templates/partial`.

Examples:

When using External Templates:
	If you're using:
	/External Templates/folderA/template
	This is the order of precedence for  `{{> partial}}`
	/External Templates/folderA/partial
	/External Templates/partial
	/External Templates/folderA/folderB/partial
	/External Templates/folderC/partial

When using Embedded Templates:
	If you're using:
	/z2k/folderA/Templates/template
	This is the order of precedence for `{{> partial}}`
	/z2k/folderA/Templates/partial
	/z2k/folderA/Templates/folderD/partial
	/z2k/Templates/partial
	/z2k/Templates/folderE/partial
	/z2k/folderA/folderB/Templates/partial
	/z2k/folderC/Templates/partial

Relative paths like ../partial are not supported at this time. Please submit a feature request if you would like this functionality.



==question==
Can you make a partial that is based on a field (eg use a multiselect to allow the user to choose a partial to import)

`{{< (random "Foo.md" "Bar.md")}}`



# Inserting Block Templates
Peek under the covers:
  

So when you run **Insert block template** inside Some/CardType/Note.md:

1. The plugin takes the note’s folder Some/CardType as the **starting card type folder**.
    
2. It gathers **all partials** under the Templates Root Folder.
    
3. It filters them to **partials associated with**:
    
    - Some/CardType (directly or its Templates subfolder),
        
    - then Some/ (directly or its Templates),
        
    - then the Templates Root itself (and its Templates), stopping there.
        
    
4. It sorts that combined list alphabetically by full path.
    
5. It hands that sorted list to the **TemplateSelectionModal**, which is the picker you see.
    

  

Result:

- You see **all block templates relevant to the current note’s “card type”** and its ancestor card types.
    
- You do **not** see every partial in the vault – only ones under the templates root and structurally associated with your current folder via direct membership or its Templates subfolder.
    

  
