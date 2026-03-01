---
sidebar_position: 40
aliases:
- Syntax Highlighting
- Template Syntax Highlighting
---
# Syntax Highlighting
Z2K Templates adds syntax highlighting for template fields directly in Obsidian's editor. `{{Fields}}` are colored by type so they're immediately distinguishable from surrounding Markdown.

## How It Works
Highlighting is registered automatically when the plugin loads — via Obsidian's CodeMirror editor extension system. It applies in both Source Mode and Live Preview. There are no settings to configure and no way to disable it independently of the plugin.

The same highlighting also applies inside the [[Global Block Editor]] in the plugin's Settings page, since that editor uses the same Handlebars language mode.

## Colors and CSS Variables
All colors are inherited from Obsidian's CSS variables, which means the highlighting adapts to whatever theme you have installed. The actual rendered color depends on the theme.

### Expression-Level Highlighting
These classes color the entire `{{ }}` span based on the type of expression:

| Expression Type | Example | CSS Class | CSS Variable |
|---|---|---|---|
| Normal field | `{{fieldName}}` | `cm-hbs` | `--text-faint` |
| Triple-mustache | `{{{fieldName}}}` | `cm-hbs-triple` | `--text-muted` |
| Comment | `{{! comment }}` | `cm-hbs-comment` | `--text-faint` + italic |
| Raw block | `{{{{rawblock}}}}` | `cm-hbs-raw` | `--text-muted` |

### Token-Level Highlighting
Within an expression, individual tokens are colored using standard code-highlighting variables:

| Token Type | Example | CSS Class | CSS Variable |
|---|---|---|---|
| Variable name | `fieldName` | `cm-tok-variableName` | `--code-property` |
| String literal | `"some text"` | `cm-tok-string` | `--code-string` |
| Number | `42` | `cm-tok-number` | `--code-number` |
| Keyword | `#if`, `#each`, `else` | `cm-tok-keyword` | `--code-keyword` |
| Operator | `!`, `=` | `cm-tok-operator` | `--code-operator` |
| Property name | `person.name` | `cm-tok-propertyName` | `--code-property` |

## Custom Themes
If you use a custom CSS theme or snippet that overrides Obsidian's standard code variables (such as `--code-string`, `--code-keyword`, etc.), those same overrides will apply to template field highlighting. No Z2K-specific CSS rules are needed.

For finer control, you can target the `cm-hbs` family of classes directly in a CSS snippet.

> [!DANGER] INTERNAL NOTES
> - Highlighting applies to all `.md` files in the vault, not only template files. This is a limitation of how Obsidian's CodeMirror extensions work — they are registered globally.
> - Whether highlighting works on `.template` and `.block` files depends on whether those extensions are currently visible (see [[Obsidian and File Extensions]]). When visible, they are treated as Markdown and highlighting applies. When hidden, they are not.
