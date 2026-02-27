---
sidebar_position: 20
sidebar_label: "{{sourceText}}"
title: "{{sourceText}}"
sidebar_class_name: z2k-code
aliases:
  - sourceText
---
# sourceText Built-In Field
The `{{sourceText}}` field is used to indicate where in the template file to insert raw source text data that was provided to the Template Plugin. This occurs in the following instances:
1. When a user selects some text in an existing card and chooses the command prompt "[[Create file from selected text]]".
2. When a user selects a file in the file explore and chooses the command prompt "[[Insert block template using selected text]]"
3. When a user creates a [[Quick Commands|Quick Command]] that specifies source text. 
4. When a user uses a [[URI Actions|URI Call]] that sends a sourceText parameter 
5. When a user creates a [[JSON Packages]] and submits it to the [[Command Queues]] for processing, and the JSON package contains a sourceText parameter.

## Missing sourceText Fields
If this field is missing in the template, but data for the `{{sourceText}}` is provided through one of the above methods, the plugin will append the provided text to the bottom of the file. 

%% Note: previously called `{{SystemData}}` %%

