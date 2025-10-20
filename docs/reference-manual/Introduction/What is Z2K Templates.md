---
sidebar_position: 10
doc_state: revised_ai_draft_2
title: "What is the Z2K Templates Plugin?"
sidebar_label: "What is Z2K Templates?"
---
# What is the Z2K Templates Plugin?

The **Z2K Templates Plugin** automates the process of creating structured, reusable notes in Obsidian. Instead of typing boilerplate content each time, you define templates that contain text placeholders — known as `{{fields}}` — which the plugin resolves into complete notes when executed. Z2K Templates is based on the [handlebars.js](https://handlebarsjs.com) standard for complex field operations.  
No matter how you use Obsidian -- whether you’re logging a meeting, keeping a daily journal, organizing fictional characters, or researching biomedical terms --  Z2K Templates will help you standardize the structure and formatting of your notes and automate the filling in of data for each of your notes. 

## Typical Workflow
How do you put templates into use? Here are the steps:
1. First, **Create** templates for the different types of notes in your vault.
2. Then you can **Create New Notes from a Template** with a new Obsidian command. When you do, the plugin will:
	1. **Prompt you** for any missing data and fills them into the template text
	2. **Resolve** advanced features, like built-in fields and helper functions
	3. **Create the new card** with the template boilerplate text
3. You then can **Iterate** on any remaining fields until you issue the **Finalize** command, in which case any remaining fields are resolved.

> [!DANGER] INTERNAL NOTE
> - Consider adding a visual flow diagram later to illustrate parse → prompt → resolve → render steps.


