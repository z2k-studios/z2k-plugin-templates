---
sidebar_position: 80
sidebar_label: Block Insertion Process
---
# What Happens When You Insert A Block?
When you insert a block template, the plugin performs several steps to parse, render, and integrate the block content into your target document. Understanding this process helps you design effective block templates.

## Overview of the Insertion Process

1. **Template Selection** - You select a block template (or one is specified programmatically)
2. **Template Parsing** - The plugin parses the block template and extracts field definitions
3. **Field Value Gathering** - Values are collected from multiple sources
4. **Field Prompting** - You're prompted for any remaining field values
5. **Template Rendering** - Fields are resolved and the template is rendered
6. **YAML Cleanup** - Template-specific YAML properties are removed
7. **YAML Merging** - Block YAML is merged into the target document's frontmatter
8. **Body Insertion** - The rendered content is inserted at the specified location

## Step-by-Step Details

### 1. Template Selection

If you are inserting a block template interactively via the [[Insert block template]] command, the plugin:
- Determines your current note's location (the [[Destination Context]])
- Gathers block templates relevant to that context (e.g. exists within the path)
- Presents a selection modal for you to choose from

If the block template is being inserted directly using the [[Partials|partial syntax]] (`{{> block-name}}`), the block is resolved based on [[Partials#Path Resolution|path resolution rules]].

### 2. Template Parsing
The block template file is read and parsed:
- YAML frontmatter is extracted separately from body content
- [[field-info]] declarations are identified
- Handlebars syntax is validated

### 3. Field Value Gathering
Field values are collected from multiple sources, in this priority order (lowest to highest):

1. **Built-in fields** - Date/time fields, etc.
2. **Global Block** - Values from your global block settings ==Is this correct?==
3. **System Blocks** - Values from [[System Block Templates 2]] ==Is this correct?==
4. **Existing File YAML** - Values already in the target document's frontmatter
5. **Field-info defaults** - Default values specified in the block template
6. **Plugin built-ins** - Values like `sourceText`, `clipboard`
7. **Overrides** - Programmatic overrides (e.g., from command queue)

This means that if a field already exists in your target document's YAML as YAML properties, that value will be used rather than prompting you again.

### 4. Field Prompting
If there are fields without values (and prompting is [[field-info directives#no-prompt|enabled]]), you'll see the field prompt modal. Fields marked with `no-prompt` directive are skipped.

If the block template is being inserted using [[Partials]] syntax, prompting will defer until the end when prompting is performed at the document template level. 

### 5. Template Rendering
The Handlebars template is rendered with all resolved field values. Helper functions are executed, conditionals are evaluated, and nested block templates are resolved.

### 6. YAML Cleanup
Before merging, the plugin removes template-specific YAML properties from the block's frontmatter:
- `z2k_template_type`
- `z2k_template_suggested_title`
- `z2k_template_default_fallback_handling`

These properties are only relevant during template authoring and shouldn't appear in your content files.

### 7. YAML Merging
The Z2K Templates Plugin attempts to be smart at how to handle YAML frontmatter found in the block template file being inserted. If the partial contains yaml data, it will extract those entries and add them into the card's YAML frontmatter. 

The block's YAML frontmatter is merged into the target document's frontmatter using a **"last wins"** strategy:

- If a key exists only in the target document, it's preserved
- If a key exists only in the block template, it's added
- If a key exists in **both**, the block template's value **replaces** the existing value

#### Example

**Block Template YAML:**
```yaml
status: active
priority: high
tags:
  - project
```

**Target Document YAML (before):**
```yaml
title: My Project
status: draft
tags:
  - work
```

**Target Document YAML (after merge):**
```yaml
title: My Project
status: active
priority: high
tags:
  - project
```

Note that `status` was replaced (not merged), and `tags` was completely replaced (arrays are not combined).

#### Caveats
- **No deep merging**: Nested objects and arrays are replaced entirely, not merged recursively
- **No duplicate detection**: The same key appearing multiple times in YAML is handled by YAML parsing rules (last occurrence wins)
- **Order preserved**: Existing keys maintain their position; new keys are appended

## Special Behaviors

### Source Text Handling

When using **[[Insert block template using selection]]**:
- The selected text is captured and made available as `{{sourceText}}`
- If your block template uses `{{sourceText}}`, it will be replaced with the selection
- If your block template does NOT reference `{{sourceText}}`, the selection is appended to the end of the inserted content

### Nested Block Templates
When a block template includes other block templates via `{{> nested-block}}`:
- Nested blocks are resolved and rendered recursively
- Field values flow through to nested blocks
- YAML from nested blocks is merged following the same rules

## See Also
- [[How Do You Use Block Templates]] for insertion methods
- [[Block Template File Structure]] for template organization
- [[field-info]] for configuring field prompts
- [[System Block Templates 2]] for vault-wide blocks
