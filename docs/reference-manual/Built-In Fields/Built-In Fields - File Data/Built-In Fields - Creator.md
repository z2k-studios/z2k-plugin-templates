---
sidebar_folder_position: 20
sidebar_position: 1
sidebar_label: "{{creator}}"
sidebar_class_name: z2k-code
aliases:
- Creator
---
## Creator Built-In Field
The `{{creator}}` [[Built-In Fields|Built-In Field]] allows you to insert your name (whatever you chose it to be) into every file that you create. The [[Settings Page]] allows you to specify a Creator text string that will be inserted every place the plugin sees a `{{creator}}` built-in field. 

## Example Usages

### Copyright

> [!TIP] Simple Copyright Statement
> Using the creator field is a great way to insert a copyright statement at the end of every file, in the event your vault will be published. Here is an example [[Block Templates|Block Template]] for inserting a copyright statement:
> ```md title="CopyrightNotice.md"
> ---
> Copyright (c) 2020 - {{year}}, {{creator}}. All rights reserved. 
> ```
> 
> With that block template in place, you can then insert the block template at the bottom of all your templates like this:
> ```md title="Sample Template File"
> (... the body of your template file.)
> {{> CopyrightNotice.md}}
> ```


### YAML Creator Field

> [!TIP] YAML Creator Field
> If you plan to frequently share the items in your vault with others, it might be useful to always have a core set of YAML entries (e.g. specified at a root level [[Using System Blocks and YAML|System Block]]) that specify ownership of the notes. Then you can simply reference the `{{creator}}` in a yaml field:
> ```yaml
> ---
> Creator : "{{creator}}"
> ---
> ```


### Identity Card


> [!TIP] Creating a central identity 
> Some vaults are designed to have a number of different creators sharing a single vault. In this instance, you could have a "Creator" field in each template that wikilinks to the card associated with each creator using the shared vault. For instance, each template could have a section for creation information:
> ```md title="Sample Shared Template.md"
> # Note Creation Details
> - Creator :: {{wikilink creator}}
> - Template Used :: {{wikilink templateName}}, version {{templateVersion}}
> - Template Author :: {{templateAuthor}}
> ```



