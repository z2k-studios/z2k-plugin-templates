---
sidebar_position: 50
aliases:
- Scoped YAML Fields
- System Block YAML
- Hierarchical YAML
---
# Using System Blocks for Scoped YAML Fields
[[Intro to System Blocks|System Blocks]] are the most powerful way to provide YAML values across a large set of templates without repeating yourself. By placing `.system-block.md` files at different levels of your vault's folder hierarchy, you can define YAML properties that apply to all templates within a folder and its subfolders – with deeper folders overriding shallower ones.

This page focuses specifically on how system blocks interact with YAML. For a general introduction to system blocks, see [[Intro to System Blocks]].

## Contents
- [[#How System Block YAML Works]]
- [[#Discovery and Inheritance]]
- [[#Merge Order]]
- [[#Practical Examples]]

## How System Block YAML Works
A system block is a `.system-block.md` file that can contain both YAML frontmatter and body content. The YAML frontmatter from system blocks is merged with the template's YAML during processing, providing default values that any template in that folder scope can use.

Because YAML properties are automatically available as [[Using YAML Metadata as Fields|field values]], system block YAML effectively lets you set default field values for an entire subtree of your vault. A system block at your vault root might define `default-content-author: "Anthropic Claude"`, and every template in the vault would have `{{default-content-author}}` resolve to "Anthropic Claude" – unless a deeper system block or the template itself overrides it. You can imagine using this technique to signify that all new files created in that vault was created by Claude.

## Discovery and Inheritance
The plugin discovers system blocks by walking **up** the folder tree from the template's location toward the [[Templates Root Folder]]. Every `.system-block.md` file encountered along this path is collected. The walk stops when it reaches the Templates Root, or when it encounters a `.system-block-stop` file (which prevents inheritance from parent folders).

The collected system blocks are then ordered **root-first, leaf-last** – so the most specific (deepest) folder's values override the most general (shallowest) folder's values.

### Example Folder Structure
```
Vault/
├── .system-block.md          ← vault-wide defaults
├── Projects/
│   ├── .system-block.md      ← project-level overrides
│   └── Templates/
│       └── Project Note.md
└── Journal/
    ├── .system-block.md      ← journal-level overrides
    ├── .system-block-stop     ← stops inheritance from vault root
    └── Templates/
        └── Daily Note.md
```

- **Project Note.md** inherits from both `Vault/.system-block.md` and `Projects/.system-block.md` (project overrides vault)
- **Daily Note.md** inherits only from `Journal/.system-block.md` (the stop file blocks the vault-level system block)

## Merge Order
System block YAML is merged using the [[Merging Multiple YAML Sources|last-wins strategy]], in the following order:

| Order | Source                     | Notes                                           |
| ----- | -------------------------- | ----------------------------------------------- |
| 1     | Root-level system block    | Most general – provides vault-wide defaults     |
| 2     | Intermediate system blocks | Each deeper folder can override the level above |
| 3     | Deepest system block       | Most specific – closest to the template         |
| 4     | Template's own YAML        | The template itself overrides all system blocks |

The result: system blocks form a cascade of defaults, with each layer able to override the one above. The template's own YAML always has the final say.

### Interaction with Other YAML Sources
System block YAML sits in the middle of the full [[Merging Multiple YAML Sources#Merge Sources and Order|merge chain]]. During field value resolution, the priority is:
- Template YAML and block template YAML (first)
- Global block YAML
- **System block YAML** ← here
- Existing file YAML (last, during block insertion)

## Practical Examples

### Setting a Default Author Vault-Wide
A root-level system block that sets a default author for all templates:

```yaml file="/.system-block.md"
---
author: "John Hancock"
created_by: "Z2K Templates"
---
```

Every template in the vault now has `{{author}}` resolve to "John Hancock" unless overridden.

### Overriding for a Specific Folder
A project folder that overrides the default author:

```yaml file="/Projects/ClientWork/.system-block.md"
---
author: "John Hancock, Revolutionaries LLC"
client: "{{ClientName}}"
---
```

Templates in `/Projects/ClientWork/` get the consulting attribution. Templates elsewhere still get the plain name.

Another folder, say `/Chats/ChatGPT` can set the default author to be `"ChatGPT"` and have a similar effect. 

### Providing fieldInfo Defaults
System blocks can also contain `{{fieldInfo}}` declarations in their body to set prompts, types, or fallback behavior across all templates in scope:

```handlebars file="/Projects/.system-block.md"
---
status: draft
---
{{fieldInfo "status" type="singleSelect" opts="draft,active,complete,archived"}}
{{fieldInfo "priority" type="singleSelect" opts="low,medium,high,critical"}}
```

Every template under `/Projects/` now gets a dropdown for `status` and `priority` – without repeating the `{{fieldInfo}}` in each template.

