---
sidebar_position: 1
sidebar_folder_position: 170
sidebar_metacategory: Advanced
aliases:
  - System Block Templates
  - Z2K System Block Templates
  - .system-block.md
---
# System Block Templates
**System Block Templates** (or just "System Blocks") are an advanced feature of the Z2K Templates plugin for automatically including system-wide content into new files. System Blocks are special system-level [[Block Templates]] that you [[Template Folder Hierarchies|hierarchically]] embed into your vault for system-wide insertion into new files.

> [!INFO] Also See: Global Block
> For a related but distinct feature – a single, non-hierarchical block that applies to every template vault-wide – see the [[Global Block]].

## Contents
- [[Intro to System Blocks]] — What System Blocks are, how `.system-block.md` files are placed throughout the vault hierarchy, and how they differ from the Global Block
- [[Why Use System Blocks]] — Common use cases: vault-wide headers, required metadata, standard tags, and folder-scoped `{{fieldInfo}}` defaults
- [[Using System Blocks and YAML]] — How to inject and hierarchically override YAML frontmatter using system blocks at each folder depth
- [[Using System Blocks and fieldInfo]] — How to scope `{{fieldInfo}}` declarations across a folder hierarchy for default prompting and location-aware field values
- [[Using System Blocks and Markdown]] — How to use system blocks to inject preamble markdown content at each folder level ==stub — not yet written==
- [[System Block Stops]] — The `.system-block-stop` file: how to cut the upward inheritance chain at a specific folder
