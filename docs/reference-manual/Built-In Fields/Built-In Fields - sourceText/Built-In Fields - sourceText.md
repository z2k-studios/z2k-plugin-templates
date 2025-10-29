---
sidebar_folder_position: 30
sidebar_label: "{{sourceText}}"
title: "{{sourceText}}"
aliases:
- sourceText
---
## {{sourceText}} Built-In Field

This field is used to show where in the template file to insert raw source text data that was provided to the Template Plugin. This occurs in four instances:
1. When a user selects some text in an existing card and chooses the command prompt "Create File from Text".
2. When a user selects a file in the file explore and chooses the command prompt "Create a New File from this File"
3. When a user uses a [[URI Calls|URI Call]] that sends a sourceText parameter 
4. When a user creates a [[JSON Packages]] and submits it to the [[Command Lists]] for processing, and the JSON package contains a sourceText parameter.

## Missing {{sourceText}} Fields
If this field is missing in the template, but data for the `{{sourceText}}` is provided through one of the above methods, the plugin will append the provided text to the bottom of the file. 

%% Note: previously called {{SystemData}} %%

