---
sidebar_position: 1
sidebar_folder_position: 20
title: Overview
aliases:
- Best Practices
---
# Best Practices for Z2K Templates

Welcome to the **Best Practices** section for [[README|Z2K Templates]]. Included below are various guides to help you set up, configure, and use Z2K Templates effectively. The plugin is very powerful, but with the power, templates can quickly become unwieldy in their use. These best practices give you real world advice on how to manage your templates.

---

- What Makes for a Good Template?
	- DRY
	- Cluster `{{fieldInfo}}`'s at the top or bottom
	-
- Template Folders vs Template File Extensions - How to Decide
- How to Make Use of Hierarchical YAML text
- How and When to Use Partials
- Case sensitivity and field names
- How to organize your fieldInfos in your template files
- A Guide to Making Your Templates Modular
	- Steps through how to use partials for creating common sections, discusses the benefits
	- Also, step through how the modular sections can be stored at different hierarchical levels.

- What Makes a good Templating System for a Vault
	- Describe how to build hierarchical system Yaml code (overwrite property values?)
	- Use of partials - and naming to include partials that are folder specific
	- Use of predefined variables to clean up template text.
	- Maybe categorize techniques as advanced or intermediate.

- A Guide to Making Multiple Variations of a Template
	- Example: A Podcast Notes template, with variations for different shows. How to use partials to make this easy to manage and update.
	- See `Docs/z2k-design-notes/Z2K System - Design Notes/Design Decisions/Template Migration - v2 to v3 - Open Questions.md` for an example of ways to implement.

## 11. Best Practices
- Designing Reusable Templates  
- When to use `preserve` vs `clear`  
- Structuring Prompts for Usability  
- Naming Conventions for Variables  
