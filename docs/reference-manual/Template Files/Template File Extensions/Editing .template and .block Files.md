---
sidebar_position: 40
doc_state: initial_ai_draft
---
# Editing .template and .block Files
If you have made the jump and have [[Use Template File Extensions|Enabled the use of Template File Extensions]] in your vault, then you will discover that editing a template file will require an extra step or two. 










Z2K Templates exposes commands in the Obsidian command palette to convert a file between file extensions. These commands update the [[z2k_template_type]] [[YAML Configuration Properties|YAML Configuration Setting]] as well.

## Template File Conversion Commands
The key commands you can use to change the file extensions in the file navigation are:

- **[[Convert to Document Template]]**
    - Sets the [[z2k_template_type]] YAML Property to `document-template`. 
    - If [[Use Template File Extensions|Template File Extensions are Enabled]], it will change the file extension to `.template`.

- **[[Convert to Block Template]]**
    - Sets the [[z2k_template_type]] YAML Property to `block-template`. 
    - If [[Use Template File Extensions|Template File Extensions are Enabled]], it will change the file extension to `.block`.
    
- **[[Convert to Content File]]**
    - Sets the [[z2k_template_type]] YAML Property to `content-file` (or potentially just removes the field from the YAML)
    - If the file currently has either a `.template` or `.block` file extension, it will rename it to be `.md`.
    - *Note:* If the file lives inside a template folder, you may still need to manually move it elsewhere.

## Warnings and Reminders

> [!NOTE] File Extensions Must Be Enabled
> Please make sure that the File Extensions feature has first been enabled in the [[Settings Page]] if you wish these commands to also change the file extensions for template files. Please see the setting "[[Use Template File Extensions]]" for details. 

> [!INFO] These Commands Do More Than Just Change File Extensions
> As you can see, these commands perform more work than simply changing the filename. You can always rename the file extension manually in Obsidian’s file explorer if you so desire. If you do rename the file outside Obsidian, then please try to update any [[z2k_template_type]] entries to match. 

> [!WARNING] Template Files Can Become Hidden … By Design
> Please remember that when you change a template file to either be [[Extension .template|.template]] or [[Extension .block|.block]], the file may as a result be [[Obsidian and File Extensions#Unknown File Extensions are Hidden|no longer visible]] in the file navigation bar. This is by design and is proof that the files will no longer "[[Template Pollution|pollute]]" the vault with their content. If you wish to continue to edit the template files, you will need to make them visible again with the [[Make .template and .block templates visible-hidden]] command. See [[Editing .template and .block Files]] for more details.
