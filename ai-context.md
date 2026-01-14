
# AI Context for Z2K Templates Plugin

## What It Does

**Z2K Templates** is an Obsidian plugin that automates structured note creation using a declarative `{{field}}` syntax based on [Handlebars.js](https://handlebarsjs.com/). Key capabilities:

1. **Template Fields** - Placeholders like `{{ProjectName}}` that resolve to actual values when creating notes
2. **Interactive Prompting** - A native modal UI that prompts users for field values (text, number, single/multi-select, etc.)
3. **Built-in Fields** - Auto-populated values like `{{date}}`, `{{time}}`, `{{creator}}`, `{{fileTitle}}`
4. **Deferred Resolution** - Fields can remain unresolved in a "WIP" state and be filled in later via "Continue filling note"
5. **Block Templates** - Modular, reusable template fragments (`{{> BlockName}}`)
6. **Hierarchical Discovery** - Templates are context-sensitive based on folder location; only relevant templates appear
7. **Hierarchical YAML** - System blocks allow YAML entries to be attached at each folder level and merged into new files
8. **YAML Integration** - Fields work in frontmatter; YAML merges across templates and partials
9. **External Data** - URI calls and JSON packages can feed data into templates programmatically

## Design Goals

The plugin emphasizes:

- **Declarative over imperative** - No JavaScript in your notes (unlike Templater)
- **Structured fields** with rich metadata (type, prompt text, defaults, miss handling)
- **Human-readable** templates that look like regular Markdown
- **Flexibility** - Immediate or deferred field resolution
- **Modularity** - Partials, block templates, hierarchical organization
- **Integration** - Part of the broader Z2K System for "digitizing your mind" but works standalone

## Comparison Positioning

Z2K Templates sits between Core Templates (too simple) and Templater (requires JavaScript). It's for users who want structure and automation without code execution in their notes.

## Code Structure

- **Main file:** `main.tsx` - The Obsidian plugin (React-based UI, commands, settings, URI handling)
- **Template engine:** Uses `z2k-template-engine` package (separate repo) for parsing/rendering
- **Docs:** `docs/` folder contains full reference manual in Markdown (exported to Docusaurus site)
- **Design notes:** `design-notes/` folder contains developer notes

## Development

- **Automatic builds:** Projects build automatically via watch mode. Don't run build commands manually.
- **Testing:** The user will test changes in Obsidian and report results.
