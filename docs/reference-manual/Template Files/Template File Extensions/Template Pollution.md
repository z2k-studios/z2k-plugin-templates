---
sidebar_position: 10
doc_state: initial_ai_draft
aliases:
- Pollution
- pollution
- pollute
---
# Template "Pollution" 
[[Z2K Template Files]] are intentionally just another markdown file within an Obsidian Vault. This makes for easy access and editing, but comes with some downsides - namely that data from your templates can inadvertently begin to show up (or "pollute") normal valid data stored in your vault. 

For instance, take the simple template text:
> `This book was written by [[{{BookAuthor}}]]`. 

This is a logical approach to writing a template, but comes with a price: it will introduce a new unlinked note in your vault title `{{BookAuthor}}` (including the curly braces). In this way, Obsidian has no way to know that this is a field name and thus should not recognize it as a valid wikilink within the vault.

## Types of Template Pollution
Here is a list of all the ways template pollution can occur, and possible fixes:

| Pollution Type    | Description                           | Example                                      |
| ----------------- | ------------------------------------- | -------------------------------------------- |
| Wikilinks         | `{{handlebars}}` used in wikilinks    | `[[{{Book Author}}]]`                        |
| Hashtags          | `{{handlerbars}}` used in hashtags    | `#Book/Genre/{{ChosenGenre}}`                |
| YAML Properties   | `{{handlebars}}` in frontmatter     | in yaml: `created :: {{today}}`              |
| DataView Searches | `{{handlebars}}` in dataview fields   | `BookTitle :: {{BookTitle}}`                 |
| Searches          | Searches for data will show templates | a search for "Daily Note" will show template |
| Bases             | Template text will show up in Bases   | `Created By :: {{creator}}`                  |

Note: by `{{handlebars}}` we mean any handlebars expressions, from helpers to fields to other syntax 

## How To Minimize Template Pollution
None of us want garbage in our vaults. Here are some simple and more complex steps for how to minimize Template Pollution:
### Simple Solution - Helpers
If you have only a few templates in your vault, you may be able to ignore the problem entirely. For instance, you can add a search parameter to ignore all files in [[Template Folders]]. 

Another simple solution that is highly recommended is to use the [[wikilink]] and [[hashtag]] Helper Functions to address the two most common forms of pollution. This is generally good practice for template design. 

> [!TIP] Use wikilink and hashtag Helpers!
> We highly recommend that you always use the [[wikilink]] and [[hashtag]] Helper functions, even if you use the advanced file extensions solution. If you share your templates with others, you never know if the other users are making use of that advanced feature. 

### Simple Solution - Required Directives
Another solution to minimizing pollution is to use the [[field-info directives#required|require directive]] for a field. This forces the field to be specified in order to even [[Instantiation|instantiate]] the initial content file from a template. If the data is present, then no pollution can occur. 

> [!TIP] Use Required Directives on YAML Properties and DataView Fields
> This method is a a very effective way to ensure that YAML Properties that use [[Template Fields]] do not get polluted. It also applies to Bases and DataView use cases.

### Advanced Solutions - File Extensions
By enabling [[Template File Extensions]], you can address most if not all of the [[#Types of Template Pollution]] listed above. This is considered an advanced feature, however, as it will make your template files become invisible to the user (by design).

 With [[Template File Extensions]], the plugin will allow you to change the file extension of your template files and effectively makes the templates no longer visible to Obsidian functions. By changing the file extension, you can tell Obsidian and third-party tools “treat this as a template, not a content note.”