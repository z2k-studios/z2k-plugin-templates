---
sidebar_position: 80
doc_state: initial_ai_draft
title: "Integration with The Z2K System"
sidebar_label: "The Z2K System"
aliases:
- Z2K System
---
# Integration with The Z2K System

## Dependency

Z2K Templates is a **standalone** plugin that can be used in nearly any Obsidian vault. Whether you’re managing research notes, creative writing, or keeping code snippets, the plugin brings structure and automation through its declarative templating engine.

That said, Z2K Templates is also a **core component of the larger [[Z2K System]]** — a coordinated suite of plugins and files designed to work together to build an extended mind. Within that ecosystem, Z2K Templates serves as the foundation for generating, structuring, and maintaining every type of Z2K card. The Z2K System has a **hard dependency** on Z2K Templates, but the reverse is not true: you can install and use Z2K Templates entirely on its own.

> [!NOTE]
> Other plugins within the Z2K family — such as the [[Z2K Core Plugin]] — all rely on Z2K Templates to provide consistent data fields, metadata handling, and rendering behavior.

---
## What Is the Z2K System?

The **Z2K System** is a framework for building a digital mind — a second layer of cognition that extends how you think, remember, and create. Unlike other Obsidian frameworks that focus on managing projects or daily notes, the Z2K System is focused on building a **digital you** — your thoughts, beliefs, models, memories, and identity.

It functions as both a **knowledge architecture** and a **self-reflective tool**, merging journaling, information design, and data-driven insight. Each file in a Z2K vault is treated as a structured thought — a living node within your personal knowledge graph.

The Z2K System is designed to represent your **digital mind** (or Second Brain as Tiago Forte would say) that you own and control the content of. This digital mind is the perfect database from which you can build a customized LLM AI representation of yourself - owned by you and stored in the "forever readable" markdown file format.

The system also includes a diverse set of **starter templates** to help users get up and running quickly. These templates demonstrate everything from simple thought cards to advanced mental models, and they serve as excellent examples for designing your own.

---
## Can I Use the Z2K System Alongside My Existing Vault?

Yes. The Z2K System can be installed into **any folder** of an existing vault using the [[Z2K Core Plugin]]. You can integrate it incrementally — adopting just the templates, or adding the full suite of Z2K plugins.

Your existing notes and folder structures remain untouched. The Z2K System simply introduces a new layer of organization and intelligence, allowing you to connect your current workflows with a more structured model of extended cognition.

> [!INFO]
> Many users choose to maintain their existing Daily Notes or PARA-style structures and add a `/Z2K` subfolder containing the Z2K System. This hybrid setup works seamlessly.

---
## Z2K Templates Integration with the Z2K System

Z2K Templates and the broader Z2K System are designed to work hand-in-hand. When installed together, Z2K Templates automatically recognizes several Z2K-specific YAML fields, filling or updating them as needed.

### Interoperability Highlights
- **Z2K YAML Fields:** Z2K Templates can read and populate fields such as `Z2KType`, `Z2KCategory`, and `Z2KCreated` automatically.
- **[[System YAML]] Compatibility:** The plugin merges vault-level and folder-level System YAML definitions during note creation, ensuring consistent metadata across the Z2K hierarchy.
- **Field Recognition:** When using a Z2K-defined card template (e.g., *Idea*, *Thought*, *Memory*), Z2K Templates automatically maps those schema-defined fields.
- **Integration Documentation:** For a full list of supported YAML keys and behaviors, see [[Z2K System Integration]].

---

> [!DANGER] INTERNAL NOTE
> - Confirm final list of Z2K YAML fields once the Z2K Core schema documentation is finalized.  
> - Add crosslinks to the Z2K Core Plugin documentation and System YAML schema table once available.  
> - Verify example field names (`Z2KType`, `Z2KCategory`, etc.) against official schema naming conventions.
> - Need to add links to The Z2K System, The Z2K Core Plugin

