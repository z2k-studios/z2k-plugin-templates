---
sidebar_position: 50
doc_state: initial_ai_draft
---
# When Does A Markdown File Become a Template
So if the [[Template Requirements#It Must Be a Text File|only requirement for a file to be a template is to have markdown text]], when does a file come to be considered a template?

## Put It Into a Template Folder
To inform the Z2K Template Plugin that a markdown file is a template, simply *put it into a [[Template Folders|Template Folder]]*. That's it! It can then be [[Template Discovery|discovered]].

If you are using [[Template Folder Hierarchies]], then be sure to pick the right hierarchy level of template folders to ensure it is discoverable in the appropriate contexts. 

## Bonus Methods
While putting it into a template folder is the standard way a file is recognized as a template file, there are a few additional, less common, ways that markdown files are used as template files:

- **URI or JSON Action**:  If a file has been explicitly passed as a template file within a URI or Command List action, then the plugin will treat it as a template file regardless of its location.
- **File Extension**: If the file extension of the markdown file uses one of the [[Valid File Extensions]], the plugin will recognize it as a valid template file. That said, the file may not always be *[[Template Discovery|discoverable]]*. 
- **YAML Explicit Declaration**: If a file explicitly declares its [[Types of Template Files|Template Type]] with the [[z2k_template_type]] YAML configuration setting, the plugin will recognize it as a valid template file. But again, the file may not always be *[[Template Discovery|discoverable]]*. For this, place the template into a [[Template Folders|Template Folder]].
