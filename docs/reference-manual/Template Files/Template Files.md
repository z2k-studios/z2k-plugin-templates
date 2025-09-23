---
folder_position: 10
sidebar_position: 10
---
At the very core of Z2K Templates is the Template File. In short, a template file is a markdown file that is used as a template to create new files. 

## Overview
- [[#What is a Template?]]
- [[Why Use Templates]]
- [[Lifecycle of a Template]]
- [[Obsidian Commands]]

---
## What is a Template?
A Z2K Template is a predefined structure stored as a markdown text file that acts as a starting point for new files in your vault. A template guides information capture, embeds metadata, and enforces patterns that enable downstream automation, querying, and AI integration. A template includes things like:

- **Static content**: Titles, prompts, section headers (e.g. ## Summary, ## Takeaways)
- **Temporary Comments**: Instructions, comments, guidance for creating content
- **Dynamic variables**: Placeholders for date, time, filename, frontmatter, or user input 
- **Metadata**: YAML property blocks to ensure uniformity

---

## Template Example
The following is an example of a very simple template file. 

```markdown
---
z2k_template_default_title : "{{Title}} - {{Author}}"
---
My Book Review - {{Title}} by {{Author}}

# Citation
- **Book Title**:: {{Title}}
- **Author**:: {{Author}}

# Summary
{{Summary}}

```

When using this template to create a new card, it will prompt the user for three pieces of information (Author, Title and Summary) and then will replace each instance of their corresponding `{{field}}` with the provided data. In this instance, it will also automatically assign a filename to the new card based on the provided title through the use of the [[Z2K Template YAML Configuration Fields#z2k_template_default_title|z2k_template_default_title]] field. 