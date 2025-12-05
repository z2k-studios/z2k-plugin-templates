---
sidebar_position: 20
doc_state: revised_ai_draft_2
title: "Sample Z2K Template File"
sidebar_label: "Sample Template"
---
# Sample Z2K Template File
Some times it is just best to dive into a real-life example. Say for instance you are a voracious reader and you would like to make a basic template file to hold your book reviews. Below is a template file that showcases a variety of the features of the Z2K Templates plugin. Yeah, not the greatest template design - but its intent is to demonstrate capabilities. 

> [!TIP] Real Templates
> To see some bonafide template files ready for use, check out our [[template-library|Template Library]]

## Sample Book Review Template File

```md title="Template - Book Review.md"
–––
# YAML Text 
Title: {{field-output BookTitle directives="required"}}
Date: {{date}}
Author: {{field-output AuthorName prompt="What is the full name of the author?"}}
Genre: {{field-output Genre type="singleSelect" opts="Fiction, Nonfiction, Poetry"}}
–––

# {{BookTitle}}

{{! Handlebars comment: This is a Handlebars-style comment. It won’t         }}
{{! appear in the final note. Below we use three different types of fields:  }}
{{! - BookTitle is a user defined field that will be prompted to the user.   }}
{{! - AuthorName will be prompted for and then formatted into a wikilink.    }}
{{! - date is a built-in field that will be automatically filled in.         }}
{{! ------------------------------------------------------------------------ }}
I started reading a {{format-string-to-lower Genre}} book titled *{{BookTitle}}* by {{wikilink (format-string-file-friendly AuthorName)}} on {{today}}.

{{! Below, we have conditional section that only renders if a review exists.    }}
{{#if Review}}
## Review Summary
{{field-info Review "Enter a One Sentence summary review:"}}
{{/if}}
```

==Needs the template specifier yaml flag?==

## Creating a New File 
Now that you have your template file, it is time to make your first book review using your new template. Here's what happens:

1. Inside Obsidian you issue the command "==**New File from Template...**==" ==check command, link to it in the documentation==
2. A **prompting dialog box** will appear asking you which Template you would like to use. Choose the "Template - Book Review.md"
3. The plugin loads the template and will generate a customized [[Prompting|prompt dialog box]] for all the fields that need data:
    - In this example, the plugin will ask for data for `{{BookTitle}}`, `{{AuthorName}}`, `{{Genre}}`, `{{OneSentenceReview}}`. 
    - Note that the `{{BookTitle}}` is a required field and the prompting dialog box will require you to enter the title.
	- Note that the `{{AuthorName}}` and `{{Review}}` fields will have customized prompts. 
	- Note also that the `{{Genre}}` field will have a dropdown selection of valid entries.
    - If you do not have all the information yet, they can enter what they have and then come back later to [[Finalization]]
4. When your are finished and ready to **create the card**, the plugin will:
	- Fill in the YAML `{{date}}` entry automatically from the system clock because `{{date}}` is a [[Built-In Fields|Built-In Field]]. The built-in field `{{today}}` also references today's date.
	- Format the `{{Genre}}` field into lowercase when it is used in the body text of the note using a [[Helper Function]]. It will also fill it in the yaml frontmatter unformatted.
	- It will create `[[`wikilinks`]]` for both today's date and the author's name. For the name, it uses a built-in helper function to make the author's name be filename friendly. 
	- Remove all `{{! Handlebars comments}}` since they are internal documentation for just the template, not part of any rendered note using the template
	- Resolve conditional blocks such as `{{#if Review}}...{{/if}}` only if you have provided a `{{Review}}` of the book.. 
    - Save the final version of the file as "`{{BookTitle}}` - `{{AuthorName}}`" (with those fields filled in)


## Resultant Note
For example, if the user fills in the information for *The Great Gatsby*, but decides to not give it an initial review, the resulting note might look like:

```md title="The Great Gatsby.md"
---
Title: The Great Gatsby
Date: 2025-10-07
Author: F. Scott Fitzgerald
Genre: Fiction
---

# The Great Gatsby

I started reading a fiction book titled *The Great Gatsby* by [[F. Scott Fitzgerald]] on 2025-10-07.
```

---

> [!DANGER] INTERNAL NOTE
> - I want the example to have the filename be set to "`{{BookTitle}} - {{AuthorName}}.md`" - how do i do that? Find out, add it, and then add it to the description
> - Verify the conditional rendering example (`{{#if Review}}`) matches plugin’s supported subset of Handlebars.
> - Consider adding a visual flow diagram later to illustrate parse → prompt → resolve → render steps.
> - Add screen shots for filling out this template
> - Verify the period isnt stripped from F. Scott Fitzegerald in make-file-friendly


