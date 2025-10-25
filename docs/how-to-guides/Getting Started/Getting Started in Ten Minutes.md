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
Book-Title: {{BookTitle}}
Book-Author: {{BookAuthor}}
Book-Genre: {{BookGenre}}
Card-Created: {{today}}
---
{{field-info fileTitle default="{{BookTitle}} by {{BookAuthor}}"}}
My Book Review - {{BookTitle}} by {{BookAuthor}}

# Citation
- **Book Title**:: {{field-output BookTitle prompt="Enter the Book Title (without subtitle)" directives="required"}}
- **Author**:: {{field-output BookAuthor prompt="Enter the Author name. If multiple authors, separate with semicolons"}}
- **Genre**:: {{field-output BookGenre "multiselect:#Genre/Fiction,#Genre/Biography,#Genre/Non-Fiction,#Genre/Reference" prompt="What Genre is {{BookTitle}}?"}}

# History
- Month I Read the Book: {{yearMonth}}

# Links
- Author Card: {{wikilink BookAuthor}}
- Amazon Link: [Amazon Search](https://amazon.com?s={{format-sluggify BookTitle}})

# Summary
{{Summary}}

# Excerpts
{{! Insert Quotation Block Templates as needed}}

```

Here's what's new:

### 2a. MultiSelect Fields
This new version introduces a field that allows the user to select from a variety of Tags to describe the `{{BookGenre}}` field. The prompting interface smartly changes its dialog box to accommodate a multiple-select item.
- Learn More: [[field-info type|field-info types]]

### 2b. Built-In Field - `{{yearMonth}}`
The new template file now includes a "`Built-in Field`", in this case `{{yearMonth}}`. Built-in fields are fields that are recognized and handled automatically by the Z2K Template Plugin. In [[Built-In Fields - Date and Time#Date and Time|this case]], when the Template is used to create a new file, the current year and month will be inserted automatically into the file. 
- Learn More: [[Built-In Template Fields]]

### 2c. Field Formatting
Next, notice the Amazon Link: entry. Here it is construct a link to an Amazon search using the entered title. Because the title will be embedded in a URL, it makes use of a [[Helper Functions|Helper Function]] called `format-sluggify` that converts the value of a field into a sluggified (i.e. URL friendly) text. 
- Learn More: [[Built-In Helper Functions]]

### 2d. Prompting information
Finally, notice how the template includes more information inside the `{{BookAuthor}}` and `{{BookTitle}}` fields. In this instance, they are using a [[Built-In Helper Functions|Built-In Helper Function]] called `field-output` that can, among other things, allow you to control how a field is prompted to the user. Note that the `{{BookTitle}}` was also flagged as required - meaning that you will have to type a value into the book title entry in order to create the file. 

Notice further that the prompt for the `{{BookGenre}}` variable actually references other fields. Yes, you can use `{{fields}}` inside the prompting interface!
- Learn More: [[Prompting]], [[field-output Helper]]

### 2e. Default File Naming
The template uses "silent helper function" called `{{field-info}}` that references a built-in field called `{{fileTitle}}` that represents the filename of the card. Using `{{field-info}}` we are able to specify that the default title of the card should be "*Book Name* by *Author Name*". With this, we have just reduced yet another duplication effort by making the file name for a card also use `{{fields}}` in them. 
- Learn More: [[field-info Usage Tips]]

### 2f. YAML Properties
With the introduction of Bases, Obsidian offers some powerful database like options using YAML fields. You can use YAML frontmatter text directly in your template to make copies of entered data directly into yaml field specifiers. In this example, we save the `BookTitle` and `BookAuthor` entries into YAML fields for easy access by Bases and Dataview.
- Learn More: [[Z2K Templates and YAML|YAML Integration]]

### 2g. Template Comments
At the end of the file, notice that it has a `{{! comment }}` entry to remind the user to insider Quotation Block Templates at the end of the file. Unlike standard Obisidian `%% comments %%`
, these comments are removed from the final file when it is [[Miss Handling|finalized]].
- Learn More: [[Template Comments]]



## 3. Create a Block Template
Now that we have a well-featured book template in our vault, let's create what is called a [[Block Templates|Block Template]] to create a reusable section that contains a quotation from a book. Partials are templates for blocks of text, rather than whole files.

```markdown
## Quote:: {{Quotation Name}}
> {{QuoteText}}
{{%IF {{QuoteAuthor}} != "" }}
> -- {{field-output QuoteAuthor default="{{BookAuthor}}"}}
{{%ENDIF}}
- References: 
    - Tags: {{field-info Tags prompt="Please list out all Tags relevant to this quotation"}}

```

==To do: add the partial yaml code ==


## 4. Now Create A New Card with Quotations

==Insert text here. Will need images too ==



## Where To Go From Here
Done - you now know enough to make use of just 20% of the plugin's features. Wanting more? We suggest moving on to the [[how-to-guides|How To Guides]] to learn more advanced topics. 
