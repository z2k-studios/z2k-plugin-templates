[[Z2K Templates]] is an [Obsidian](https://obsidian.md) Plugin for making powerful templates for your Obsidian vault:
- It uses the intuitive `{{handlebars}}` syntax to specify where to insert data within a template file and unique prompting interface for collecting data to insert into the template.
- At its core, it uses the  [handlebars.js](https://handlebars.js) syntax for advanced techniques like [[7 - Z2K Template Field Helper Functions|functions]] and [[5 - Z2K Template Field Data Formatting|formatting]], and has a number of syntax extensions to support an interactive prompting in Obsidian. 
- For advanced users, Z2K Templates also supports creating cards/notes from external datasets through [[11 - Z2K Templates, URI, and JSON|JSON data and URI commands]].

Z2K Templates is part of the [Z2K System](https://z2ksystem.com) but works fine as a standalone plugin. We encourage you to check out the greater [Z2K System](https://z2ksystem.com) for how to structure your Obsidian Vault as a digital extension of your mind. 

# Getting Started
Here's how to get started with Z2K Templates in under 2 minutes:
## Create a Template Folder
To start using Z2K Templates, you will first need to create a folder call "`Templates`" in your Vault's root folder. (Note: this folder name and location can be changed in the Plugin's [[13 - Settings Page|Settings]] page. Also, Template folders can be stored [[0.1 - Template Folders|hierarchally]] to make Templates more context aware within your Vault.)

## Create a Template File
To create a Template file, simply create a new markdown file in folder called ". For instance, create a file named "`Template - Book.md`" that contains:

```markdown
My Book Review - {{Title}} by {{Author}}

# Citation
- **Book Title**:: {{Title}}
- **Author**:: {{Author}}

# Summary
{{Summary}}

```

## Create a File from a Template
To create a new file from a template, simply right click in a folder within your vault and select the command "`New Note From Template`". You can also use the Obsidian Command list and assign this action to a hotkey. With this command, Z2K Templates will then prompt you to select which template to use:

\<insert image\>

After that, Z2K Templates will then prompt you for the fields found in the template:

\<insert image\>

When you are done entering the different fields, click the `Finalize` button which will then create a new card with all of the fields filled in with the provided data. 

## Where To Go From Here
This introduces [[Z2K Templates]] in only its most basic form. We suggest moving on to the [[How To Guide]] to help introduce more advanced concepts.



