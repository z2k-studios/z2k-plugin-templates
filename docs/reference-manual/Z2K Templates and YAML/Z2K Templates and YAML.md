---
sidebar_position: 1
sidebar_folder_position: 180
sidebar_label: YAML Integration
aliases:
  - YAML Integration
---
# Z2K Templates and YAML
Z2K Templates treats YAML frontmatter as an equal partner in template processing – not just metadata to preserve, but an active layer you can read from and write into to control the templating process. This two-way relationship opens up capabilities that go well beyond what most template systems offer.

## The Two-Way Relationship
The integration works in two directions:
- **Fields inside YAML** – You can place `{{field}}` expressions directly in your YAML frontmatter. When the template is instantiated, those expressions resolve just like fields in the body. This lets you build dynamic metadata – tags, titles, dates, and custom properties – from the same data the user provides for the rest of the note.
- **YAML as field data** – In the other direction, YAML properties are automatically available as field values. If your frontmatter contains `author: "Jane Doe"`, then `{{author}}` resolves to "Jane Doe" anywhere in the template. This makes YAML a powerful data source – especially when combined with [[Intro to System Blocks|System Blocks]] and [[Block Templates]], which can inject YAML from multiple sources.

## Contents
The following pages cover these capabilities in detail:

1. **Using Fields Inside YAML**
	- [[Using Fields Inside YAML Metadata]] – how to place `{{field}}` expressions in your YAML frontmatter
		- How-To Guide: [[How to Use Z2K Fields Inside YAML Metadata]]

2. **Using YAML as a Data Source**
	- [[Using YAML Metadata as Fields]] – how YAML properties become available as Handlebars fields
	- [[Storing Field Values in YAML]] – how to persist field data in YAML for use by block templates after finalization

3. **YAML Across Templates**
	- [[YAML and Block Templates]] – how YAML frontmatter is handled when block templates are inserted
	- [[Merging Multiple YAML Sources]] – how frontmatter from multiple sources (templates, blocks, system blocks) is combined
	- [[Using System Blocks for Scoped YAML Fields]] – how to use system blocks to provide hierarchical, context-sensitive YAML values

4. **YAML Configuration**
	- [[YAML Configuration Properties|YAML Fields the Z2K Template Plugin Uses]] – pre-defined YAML properties that control plugin behavior
