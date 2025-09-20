---
sidebar_position: 110
---
# Getting Started
Here's how to get started with Z2K Templates in under two minutes:

## 1. Create a Template Folder
To start using Z2K Templates, you will first need to create a folder call "`Templates`" in your Vault's root folder. (Note: this folder name and location can be changed in the Plugin's [[Plugin Settings Page|Settings]] page. Also, Template folders can be stored [[Template Folders|hierarchally]] to make Templates more context aware within your Vault.)

## 2. Create a Template File
To create a Template file, simply create a new markdown file in your newly created "`Templates`" folder. For instance, create a file named "`Book Template.md`" that contains:

```markdown
My Book Review - {{Title}} by {{Author}}

# Citation
- **Book Title**:: {{Title}}
- **Author**:: {{Author}}

# Summary
{{Summary}}

```

## 3. Create a File from a Template
To create a new file/note from a template, simply right click in a folder within your vault and select the command "`New Note From Template`". You can also use the Obsidian Command list and assign this action to a hotkey. With this command, Z2K Templates will then prompt you to select which template to use:

\<insert image\>

After that, Z2K Templates will then prompt you for the fields found in the template:

\<insert image\>

When you are done entering the different fields, click the `Finalize` button which will then create a new card with all of the fields filled in with the provided data. 

## Where To Go From Here
Done - you are up and running in two minutes. If you want to learn the next level of detail, continue on to [[How to Get Started in Ten Minutes]]. After that, we suggest moving on to the [[how-to-guides|How To Guides]] to learn more advanced topics. 