---
sidebar_position: 10
folder_position: 10
doc_state: revised_ai_draft_1
---

# Introduction

The **Z2K Templates Plugin** is a templating engine built for Obsidian that transforms the way you create and maintain notes. Unlike scripting-based systems such as Templater, Z2K Templates uses a declarative `{{fields}}` syntax — focusing on clarity and structure rather than code. Each field can pull from built-in data sources, prompt the user for input, or integrate live data from JSON and URIs.  

---

## Features
Z2K Templates has a rich collection of features, including:
- An [[Prompting|interactive prompting dialog]] for filling out information for each new file  
- A series of [[Built-In Template Fields|built-in fields]] that will auto-populate  
- A rich [[Template Fields|syntax for specifying prompting information]] and handling missing data  
- [[Handlebars Support|Handlebars.js functions]], including built-in helpers for iteration and conditional formatting  
- Support for [[Partial Templates|partial templates]] that allow you to build modular block-level templates with consistent formatting  
- Support for [[YAML Integration|YAML merging]] across templates stored in hierarchical structures  
- [[URI and JSON Support|URI support]] to allow external data to be fed into your templates to create new files programmatically  
- External [[URI and JSON Support#JSON Packages|JSON packages and command lists]] to queue up data to be added to your vault when Obsidian is loaded  

> [!INFO]
> **Context:** Z2K Templates is part of the larger [Z2K System](https://www.z2ksystem.com), a framework for digitizing your mind through structured notes, metadata, and cognition tools. The plugin can also stand alone as a robust, user-friendly templating solution for anyone seeking structure and automation within Obsidian.

---

## What You’ll Learn in This Section
The pages under **Introduction** provide a 50,000-foot overview of how Z2K Templates works and why it was designed this way. Each subpage focuses on a specific layer of understanding:

- [[What the Plugin Does]] — Describes the scope, architecture, and key capabilities of the plugin.  
- [[Core Concepts]] — Introduces fields, prompting, and YAML integration as foundational ideas.  
- [[Why Use Templates]] — Explains how templates create structure and consistency.  
- [[Why Z2K Templates]] — Compares Z2K Templates with alternatives and outlines its unique approach.  
- [[Integration with the Z2K System]] — Shows how the plugin fits into the greater Z2K framework.  

---

## Quick Orientation
If you’ve just installed Z2K Templates and want to dive right in, start here:

- [[Getting Started in Two Minutes]]  
- [[Getting Started in Ten Minutes]]  

These guides provide immediate examples of creating a template, using prompts, and generating your first auto-filled note.

---

> [!DANGER] INTERNAL NOTE
> - Consider adding a short visual or screenshot placeholder after release (showing prompt modal).  

