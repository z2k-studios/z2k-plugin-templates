---
sidebar_position: 16
doc_state: revised_ai_draft_2
title: "Sample Template"
---

# Sample Template
So enough broad level description; let's see a real-life template file that showcases some of the basic features of the Z2K templating language. Say for instance you are a voracious reader and you would like to make a basic template file to hold your book reviews.


## Book Review Template File

```md title="Template - Book Review.md"
–––
# YAML Text 
Title: {{BookTitle}}
Date: {{date}}
Author: {{prompt-value AuthorName prompt="What is the full name of the author?"}}
Genre: {{prompt-value Genre type="singleSelect:Fiction,Nonfiction,Poetry}}
==Needs the template specifier yaml flag?==
–––

# {{BookTitle}}

{{! Handlebars comment: This is a Handlebars-style comment. It won’t appear     }}
{{! in the final note. Below we use three different types of fields:            }}
{{! - BookTitle is a user defined field that will be prompted to the user.      }}
{{! - AuthorName will also be prompted for and then formatted into a wikilink.  }}
{{! - date is a built-in field that will be automatically filled by the plugin. }}
{{! --------------------------------------------------------------------------- }}
I started reading a {{format-string-to-lower Genre}} book titled *{{BookTitle}}* by {{wikilink AuthorName}} on {{date}}.

{{! Below, we have conditional section that only renders if a review exists.    }}
{{#if Review}}
## Review Summary
{{prompt-info Review prompt="Enter a One Sentence summary review:"}}
{{/if}}
```

## Creating a New File 
Now that you have your template file, it is time to make your first book review. Here's what happens:

1. Inside Obsidian you issue the command "==New File from Template...==" ==check command, link to it in the documentation==
2. A prompting dialog box will appear asking you which Template you would like to use. Choose the "Template - Book Review.md"
3. The plugin loads the template and will generate a customized [[Prompting|prompt dialog box]] for all the fields that need data:
    - In this example, the plugin will ask for data for `{{BookTitle}}`, `{{AuthorName}}`, `{{Genre}}`, `{{OneSentenceReview}}`.  
	- Note that the `{{AuthorName}}` and `{{Review}}` fields will have customized prompts. 
	- Note also that the `{{Genre}}` field will have a dropdown selection of valid entries.
    - If you do not have all the information yet, they can enter what they have and then come back later to [[Finalize]]
4. When your are finished and ready to create the card, the plugin will:
	- Fill in the YAML `{{date}}` entry automatically from the system clock because `{{date}}` is a [[Built-In Template Fields|Built-In Field]]
	- Format the `{{Genre}}` field into lowercase when it is used in the body text of the note using a [[Helper Function]]. It will also fill it in the yaml frontmatter unformatted.
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
> - I want the example to have the filename be set to "{{BookTitle}} - {{AuthorName}}.md" - how do i do that? Find out, add it, and then add it to the description
> - Verify the conditional rendering example (`{{#if Review}}`) matches plugin’s supported subset of Handlebars.
> - Consider adding a visual flow diagram later to illustrate parse → prompt → resolve → render steps.


