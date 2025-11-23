---
sidebar_position: 30
doc_state: initial_ai_draft
---
# How Obsidian Treats Custom File Extensions

Obsidian is a markdown centric application, and as such, its native file type is inherently the text based markdown file with a `.md`  extension. This page discusses how Obsidian handles other file extensions inside the vault.

## Unknown File Extensions are Hidden
In short, when a file's extension is changed to an unknown file type, **Obsidian effectively hides the file from the user**. Thus, changing a template file extension to be either a [[Extension .block|.block]] or [[Extension .template|.template]] file will effectively hide the file from the user in the file navigation, making it appear to have "disappeared". Rest easy, it is still there, but Obsidian just no longer views the file as relevant to the vault. 

While it may seem strange, this is exactly why we use custom [[Template File Extensions|File Extensions]]: to hide the template files from Obsidian so that the templates will no longer [[pollute]] the data in our vault. 

## Making the Templates Visible Again
Luckily, there is a way to quickly turn on and off the visibility of [[Extension .template|.template]] and [[Extension .block|.block]] files inside the file navigation so that you can actively edit and organize them. Simply use the [[Make .template and .block templates visible-hidden]] command to toggle the visibility on and off. 


> [!NOTE] Remember To Turn Off Visibility When Done
> Do note, though, that when the `.template` and `.block` files are visible, they are also visible to all tools within Obsidian. Thus, the [[Template Pollution|Pollution]] effect returns. For this reason, if you are using these custom file extensions, please remember to toggle their visibility off once you are done working on your template files. 

