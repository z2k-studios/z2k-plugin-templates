---
sidebar_position: 50
doc_state: revised_ai_draft_1
---

# File Extension Process Guide

This guide clarifies how to choose and operate [[Template File Extensions]] in Z2K Templates. It presents three practical workflows, each reflecting a different level of structure and tolerance for template noise. The goal is simple: keep your vault readable while making templates easy to build, maintain, and hide when appropriate.

- [[#Method 1 - Stick with the Default Markdown .md Extension]]
- [[#Method 2 - Use File Extensions]]
- [[#Method 3 - Mix and Match]]


## Method 1 – Stick with the Default Markdown `.md` Extension
This approach keeps everything in Markdown and avoids extension management entirely. Use it when:
- You are just learning Z2K Templates.
- You are uncomfortable changing file extensions manually
- You prefer not to rename files manually.
- You only maintain a handful of templates.
- You are not bothered by template content appearing in search, Dataview/Bases tables, or dashboards (see [[Template Pollution]]).

Why stay with `.md` template files:
- All editors recognize the file.
- Obsidian treats the file as a normal note:
	- Visible in the file explorer
	- Fully supported by core and community plugins
- No configuration required.

Drawbacks:
- Template content becomes indistinguishable from real notes in searches and property views. (i.e. [[Template Pollution]])
- More mature vaults often find this noisy.


## Method 2 – Use File Extensions
If you are ready for cleaner structure or operate a larger system, switch to template-specific extensions. This provides separation between *content* and *machinery* without changing how templates behave inside Z2K Templates.

### Step 1. Enable Template File Extensions
Turn on the [[Use Template File Extensions]] setting. This allows Z2K Templates to interpret `.template` and `.block` files as template files.

### Step 2. Convert Your Existing Templates
Use the [[Changing File Extensions]] commands to convert your existing `.md` templates to use the templates file extensions. Specifically:
- Use [[Convert to Document Template]] for `.template` files  
- Use [[Convert to Block Template]] for `.block` files  
- Use [[Convert to Markdown Template]]  to revert a template back to `.md`

These commands update both the YAML type and the file semantics.

### Step 3. Hide Template Files When Appropriate
Once your templates use the correct extensions, you can hide them from the Obsidian file navigation bar using the following command:

- [[Make .template and .block templates visible-hidden|Make .template and .block templates hidden]]

This keeps the vault’s navigation pane focused on real content while still letting Z2K Template Engine access your template files.

### Step 4. Working With Templates
With that, you are off to the races. Here are some typical workflows for creating a new template or editing an existing one:

#### Creating a New Template
1. Create a new `.md` file in the appropriate [[Template Folders|Template Folder]].  
2. Build its structure and content as you normally would.  
3. When ready, convert it using:
   - [[Convert to Document Template]], or  
   - [[Convert to Block Template]]

This preserves full Markdown editing features during design, then switches the file into its long-term role as a non-polluting template.

#### Editing an Existing Template
Since hidden templates do not appear in the file navigation bar, editing requires three steps:

1. Reveal them using  
   [[Make .template and .block templates visible-hidden|Make .template and .block templates visible]]
2. Locate and edit the file as you would any `.md` document.
3. Re-hide them with  
   [[Make .template and .block templates visible-hidden|Make .template and .block templates hidden]]

This keeps your workspace orderly but still gives you full control when making revisions.


## Method 3 – Mix and Match
You can also combine both strategies:
- Keep actively evolving templates as `.md` so you can see how they appear in Dataview/Bases and search.
- Convert stable templates to `.template` or `.block` once they settle.

This hybrid approach works well, especially in large vaults under active development.  
Still, we encourage converging on a consistent long-term pattern to reduce cognitive load and confusion of what is in your template collection.


## Conclusion
Your chosen method depends on how much [[Template Pollution|Pollution]] you are willing to accept and how clean you want your vault’s working surface to be.

> [!DANGER]
> - Verify that all linked pages—such as “Convert to Block Template” and visibility commands—use the correct final page names in the Reference Manual.
> - Confirm the final names of visibility commands as these may shift during development.
> - This guide assumes `.template` and `.block` extensions are fully supported by the plugin after the extension rewrite; update behavior descriptions if Obsidian’s treatment of non‑`.md` files is modified in future builds.
