---
sidebar_position: 111
---
# Getting Started in Ten Minutes
Here's how to get started with [[README|Z2K Templates]] in ten minutes:

## 1. First, The Basics
First step through the basics of creating a Templates folder and creating your first template by following the [[Getting Started in Two Minutes]] guide. 

## 2. Add Some New Features to the Book Template
Now that you have a barebones "`Book Template.md`" file, now let's try out some new features. Load the file in Obsidian and replace it with the following text:

```markdown
---
Book-Title: {{Title}}
Book-Author: {{Author}}
Card-Created: {{today}}
---
My Book Review - {{Title}} by {{Author}}

# Citation
- **Book Title**:: {{prompt-field Title description="Enter the Book Title (without subtitle)"}}
- **Author**:: {{prompt-field Author description="Enter the Author name. If multiple authors, separate with semicolons"}}

# History
- Month I Read the Book: {{yearMonth}}

# Links
- Author Card: {{wikilink Author}}
- Amazon Link: [Amazon Search](https://amazon.com?s={{format-sluggify Title}})

# Summary
{{Summary}}

```

Here's what's new:

### 2a. Built-In Field -- `{{yearMonth}}`
The new template file now includes a "`Built-in Field`", in this case `{{yearMonth}}`. Built-in fields are fields that are recognized and handled automatically by the Z2K Template Plugin. In this case, when the Template is used to create a new file, the current year and month will be inserted automatically into the file. 

### 2b. Field Formatting
Next, notice the Amazon Link: entry. Here it is construct a link to an Amazon search using the entered title. Because the title will be embedded in a URL, it makes use of a [[Helper Functions|Helper Function]] called "`format-sluggify`" that converts the value of a field into a sluggified (i.e. URL friendly) text. 

### 2c. Prompting information
Finally, notice how the template includes more information inside the `{{Author}}` and `{{Title}}` fields. In this instance, they are using a [[Built-In Helper Functions|Built-In Helper Function]] called `prompt-info`. This helper function controls how a field is prompted to the user. 

### 2d. YAML Properties
With the introduction of Bases, Obsidian offers some powerful database like options using YAML fields. You can use YAML frontmatter text directly in your template to make copies of entered data directly into yaml field specifiers. 

# 3. Create a Partial Template
Now that we have a well-featured book template in our vault, let's create what is called a [[Partial Templates|Partial Template]] to create a reusable section that contains a quotation from a book. Partials are templates for blocks of text, rather than whole files.

```markdown
## Quote:: {{Quotation Name}}
> {{Quote-Text}}
{{%IF {{Quote-Author}} != "" }}
> -- {{Quote-Author default="{{Book-Author}}"}}
{{%ENDIF}}
- References: 
    - Tags: {{prompt-info Tags description="Please list out all Tags relevant to this quotation"}}

```

TODO:go through how to signify it is a partial 


## Where To Go From Here
Done - you now know enough to make use of 50% of the plugin's features. Wanting more? We suggest moving on to the [[how-to-guides|How To Guides]] to learn more advanced topics. 
