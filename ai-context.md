
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
8. **YAML Integration** - Fields work in frontmatter; YAML merges across templates and blocks
9. **External Data** - URI calls and JSON packages can feed data into templates programmatically

## Design Goals

The plugin emphasizes:

- **Declarative over imperative** - No JavaScript in your notes (unlike Templater)
- **Structured fields** with rich metadata (type, prompt text, defaults, miss handling)
- **Human-readable** templates that look like regular Markdown
- **Flexibility** - Immediate or deferred field resolution
- **Modularity** - Block templates, hierarchical organization
- **Integration** - Part of the broader Z2K System for "digitizing your mind" but works standalone

## Comparison Positioning

Z2K Templates sits between Core Templates (too simple) and Templater (requires JavaScript). It's for users who want structure and automation without code execution in their notes.

## Code Structure

- **Source:** `src/`
  - `main.tsx` — Z2KTemplatesPlugin class, command processing, template resolution
  - `utils.ts` — shared types (settings, errors), utility functions
  - `settings.tsx` — settings tab UI
  - `syntax-highlighting.ts` — CodeMirror handlebars overlay
  - `paths.ts` — path utilities
  - `modals/simple-modals.tsx` — card type selection, template selection, confirmation, error, log viewer modals
  - `modals/field-collection.tsx` — field collection modal, dependency helpers
  - `modals/editor-modals.tsx` — code editor, quick commands modals
  - `template-engine/main.ts` — Handlebars-based parsing/rendering (merged from former `z2k-template-engine` repo)
- **Docs:** `docs/` folder contains full reference manual in Markdown (exported to Docusaurus site)
- **Design notes:** `design-notes/` folder contains developer notes

## Project Status

**Pre-release / No users yet.** This plugin is in active development and has not been publicly released. There are no external users to consider for backwards compatibility. Breaking changes to APIs, property names, or template syntax are acceptable if they improve clarity or architecture.

## Development

- **Automatic builds:** Projects build automatically via watch mode. Don't run build commands manually.
- **TypeScript errors:** Use IDE diagnostics (returned with each edit) to check for errors. Don't run `tsc`, `npm run build`, or similar commands to verify compilation.
- **Testing:** All testing lives in `Data/Vaults/z2k-testing-vaults/`. Read that repository's `ai-context.md` for test structure, conventions, and how to run tests.

## Release

- **GitHub repo:** `z2k-studios/z2k-plugin-templates`
- **Release script:** `npm run release <version>` (runs `scripts/release.mjs` — validates working tree, bumps version files, builds, commits, tags, pushes)
- **Tag format:** plain semver, no `v` prefix (e.g. `0.5.0`)
- **Assets:** `release/main.js`, `manifest.json`, `styles.css` (uploaded manually to the GitHub release)
- **Prerelease:** yes (all releases are pre-release until public launch)
- **Build outputs:** dev watcher writes to `dev/main.js`; prod builds write to `release/main.js`. Both gitignored.
