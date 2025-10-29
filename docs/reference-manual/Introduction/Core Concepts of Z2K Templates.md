---
sidebar_position: 40 
doc_state: revised_ai_draft_1
title: "Core Concepts of Z2K Templates"
sidebar_label: "Core Concepts"
aliases:
- Core Concepts
---
# Core Concepts of Z2K Templates

Z2K Templates builds on a few foundational ideas that make templating in Obsidian structured, predictable, and human-readable. These concepts define how the Z2K Templates plugin works — from how templates are defined, to where their data originates, to how they can be modular and context-aware.

The core concepts are:

   1. [[#Template Files]]
   2. [[#Template Fields]]
   3. [[#Built-In Fields and Helper Functions]]
   4. [[#Prompting, Deferred Resolution and Miss Handling]]
   5. [[#Deferred Resolution]]
   6. [[#YAML Integration]]
   7. [[#Data Sources]]
   8. [[#Modular Template Organization]]
   9. [[#Hierarchical Templates]]



---
## Template Files

A **[[Template Files|template file]]** is a Markdown document (just like any other Obsidian file) that may contain both YAML frontmatter and Markdown body content. Within either section, you can include placeholders called `{{fields}}`. Each field represents a data point — text, date, number, list — that gets resolved when you create a new file from the template, or later when you [[Lifecyle of a Template|finalize]] the file. 

- Read More at: [[Template Files]]
- Example:

```md title="Template - Project.md"
–––
Title: {{ProjectName}}
Date: {{date}}
Status: {{Status}}
–––
{{field-info Status type="singleSelect" opts=['Planned','In Progress', 'Complete']}}

# Project: {{ProjectName}}

{{! Comment: You can document your templates with comments like this directly inside them without affecting the final output. }}

Current project status: **{{Status}}**
```




---
## Template Fields

A **[[Template Fields|field]]** is the heart of a template — a placeholder enclosed in double curly braces like `{{ProjectName}}` in the above example. Fields can:

- Pull in values from automatic [[Built-In Fields|built-in data sources]], from [[URI, JSON, Command Lists|external sources]] via [[JSON Packages|JSON]] or [[URI Calls|URI]], or from the user via a rich [[Prompting|prompting interface]].
- Can have different input types, like `text`, `number`, or `multiSelect`

- Read More: [[Template Fields]]



---
## Built-In Fields and Helper Functions

Z2K Templates uses [[Handlebars Support|Handlebars.js]] as it's underlying syntax and `{{field}}` language. Z2K The Via Handlebars, the Z2K Templates plugin provides a number of predefined ("Built-In") [[Built-In Fields|automatic fields]] and [[Built-In Helper Functions|helper functions]] (small inline functions that operate on field values). Rest easy - no coding knowledge necessary. 

- Read More: [[Built-In Fields]], [[Built-In Helper Functions]]
- Example:
```md title="Partial Template - Status Update.md"
Date::{{format-date date 'MMMM D, YYYY'}}
Status:: {{#if Completed}}✅{{else}}❌{{/if}}
```



---
## Prompting and Miss Handling

When a field’s value can’t be resolved (for example, it isn’t provided via JSON, YAML frontmatter, or a built-in function), the plugin will **prompt** you for the data. Z2K Templates allows you to configure how the prompting interface works with the Built-in Helper Function [[field-output]].  Example:

```md title="Template - Prompting.md"
My Location :: {{field-output Location "Where were you today?" "NYC, NY"}}
My Mood     :: {{field-output Mood type="singleSelect" opts=['Happy', 'Neutral', 'Stressed']}}
```

If a field remains blank, Z2K Templates follows its [[Prompting#Miss Handling|miss handling rules]] — such as clearing it, keeping the placeholder, or applying a default value.

- Read More: [[Prompting]]

---
## Deferred Resolution
Not all data is known when you create a new note in your vault. Z2K Templates also supports the idea of **[[Deferred Field Resolution]]**, allowing you to create files with fields that will be filled in over time. 

In this state, unresolved `{{fields}}` remain visible in the note and remain being fully functional placeholders.  You can reopen the file later and use the command **[[Lifecycle of a Template|Continue filling file]]** to supply additional data when it becomes available.  

Then, when you eventually explicitly **[[Lifecycle of a Template#Finalize|finalize]]** the file, Z2K Templates will handle the remaining unresolved fields according to the configured [[Prompting#Miss Handling|miss handling rules]].

For example, consider a daily log template that includes:
```md title="Template - Daily Log.md"
Steps  :: {{StepsTaken}} 
Weight :: {{Weight}} 
Mood   :: {{Mood}}
Meals  ::
- {{Breakfast}} 
- {{Dinner}} 
```

With deferred resolution of fields, you can start your note in the morning, update it throughout the day, and finalize it only when complete. This approach keeps your workflow flexible without breaking the template’s structure or losing metadata consistency.

- Read More: [[Deferred Field Resolution]]



---
## YAML Integration

Fields can also appear in YAML frontmatter. YAML allows dynamic metadata such as titles, tags, or statuses to update automatically. ==YAML fields in turn can be used to specify field values as well.==

Example:

```yaml title:"Template - Book Review.md"
---
Title: {{BookTitle}}
Tags: 
    - Books/{{Genre}}
StartDate: {{date}}
---
```


Z2K Templates merges YAML from multiple sources — including partials and parent templates — according to its [[YAML Integration|merge rules]]. This keeps configuration data synchronized across nested templates. Storing field data into YAML frontmatter allows you to make use of powerful tools like Obsidian Bases to organize your files and empower smart searching. 

- Read More: [[YAML Integration]]


---
## Data Sources

Templates can pull data from multiple origins. Potential data sources include::

1. **[[Built-In Fields|Built-in fields]] and [[Helper Functions|helper functions]]** — values like `date` or computed values from helper functions.
2. **Default values stored directly in the template** — specified in field syntax using  [[field-info]]
3. **Existing files** — other vault files can be read through built-in fields such as `{{SystemData}}` and [[Block Templates]].
4. **External URI calls** — incoming data provided through [[URI and JSON Support|URI triggers]].
5. **External JSON command lists** — batches of Z2K Templates actions written in to [[JSON Packages]]
6. **Miss handling directives** — [[Miss Handling|fallback behavior]] applied when all other sources fail.

- Read more: [[Field Data Sources]]



---
## Modular Template Organization

Large templates can be broken into smaller, reusable “block templates". These modular blocks let you maintain consistency across your vault without repeating code.

Example:

```md "Partials - Example.md"
{{> OverviewBlock}}
{{> PrerequisitesBlock}}
```

If you change the `OverviewBlock` block template file, then every template that includes it will reflect those changes instantly.

This design allows you to:

- Maintain consistent formatting across related templates.
- Create reusable “snippet libraries” for common structures.
- Reduce duplication and simplify updates.

- Read More: [[Block Templates]].

---

## Hierarchical Templates

The list of templates you can choose from can be context-sensitive by determining the destination file’s location within your vault. When creating a new file, Z2K Templates only lists templates found in `Templates` subfolders located along the path leading up to your vault root. This allows you to see only those templates relevant for a particular destination folder. 

Additionally, by using the [[Intro to System Blocks|System YAML feature]], you can attach YAML entries at each folder level in your vault. When a new file is created in that path, these YAML entries automatically merge into the file — providing inherited context and consistent metadata throughout your hierarchy.

- Read More: [[Hierarchical Template Folders]], [[Intro to System Blocks]]

---

> [!DANGER] INTERNAL NOTE
>
> - Add visuals for data flow and hierarchical template discovery.
> - Add screenshot examples of modular and partial template use.

