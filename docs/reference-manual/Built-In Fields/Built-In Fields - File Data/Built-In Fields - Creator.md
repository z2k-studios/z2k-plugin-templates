---
sidebar_folder_position: 20
sidebar_position: 1
sidebar_label: "{{creator}}"
sidebar_class_name: z2k-code
aliases:
- File Data
---
## {{Creator}} Built-In Field
The `{{creator}}` [[Built-In Fields|Built-In Field]] allows you to insert your name (whatever you chose it to be) into every file that you create. The [[Settings Page]] allows you to specify a Creator text string that will be inserted every place the plugin sees a `{{creator}}` built-in field. 


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
