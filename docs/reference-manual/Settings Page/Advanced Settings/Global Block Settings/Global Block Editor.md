---
sidebar_position: 10
aliases:
  - Global Block editor
  - the Global Block editor
---
# Global Block Editor
The Global Block Editor, accessed through the [[Settings Page]], allows you to modify the current [[Global Block]] – template content that is automatically prepended to every template before rendering. Click the **Edit Global Block** button to open the editor modal.

![[global-block-editor.png]]
(Screenshot: The Global Block editor modal with example fieldInfo declarations)

## Global Block in Brief
The global block behaves like a [[System and Global Blocks|system block]], but at a higher scope. Content here is invisibly prepended to every template before the engine processes it. The most common use is declaring [[reference-manual/fieldInfo Helper/fieldInfo Helper|fieldInfo]] entries that apply everywhere – default prompts, types, or suggested values for fields used across many templates.

> [!INFO] See the Global Block reference page
> For more information on the Global Block, please consult its own [[Global Block|reference page]]. This page focuses on the use of the editor within the plugin settings.

## The Editor
The editor opens as a modal dialog. From top to bottom, it contains:

### Toolbar
The toolbar spans the top of the modal:
- **Help toggle** – a clickable "Help" label with a ▶/▼ arrow. Expands or collapses a built-in help panel describing what the Global Block is. Click the toggle again to collapse it.
- **Font Sizing**:
	- **A− button** – decreases the editor font size by 1px (minimum 6px).
	- **Font size display** – shows the current editor font size (e.g., `14px`).
	- **A+ button** – increases the editor font size by 1px (maximum 20px).

The A−/A+ controls are useful when working with dense `{{fieldInfo}}` declarations or when the default font size is too small or too large for comfortable editing.

### Editor Area
The central area is a full-featured [CodeMirror](https://codemirror.net/) code editor supporting:
- Syntax highlighting for Handlebars expressions
- Line numbers
- Bracket matching

Write or paste your global block content here.

### Validation Status
Directly below the editor, a status indicator shows the result of continuous syntax validation:
- `✓ No syntax issues` – content is valid and can be saved
- `✓ Empty` – the editor is empty, which is also valid (saves a blank global block)
- `✗ <error message>` – the content contains a syntax error; the Handlebars parser error is shown inline

Validation runs automatically as you type. The **Save** button remains disabled until the status shows a valid state.

> [!TIP] Common Validation Tokens
> Please see [[#Appendix Common Handlebars Parser Error Tokens|below]] for common token names and their meanings to help you debug your Handlebars text.

### Action Buttons
- **Cancel** – closes the modal without saving any changes
- **Save** – writes the editor content as the new global block and closes the modal; disabled while the status is invalid

## Validation
The editor validates content by running it through the Handlebars parser before allowing a save. Validation produces one of three outcomes:

| State | Display | Meaning |
|-------|---------|---------|
| Valid | `✓ No syntax issues` | Content is parseable Handlebars |
| Empty | `✓ Empty` | Editor is blank; saves a cleared global block |
| Invalid | `✗ <parser error>` | Content cannot be parsed |

When the status is invalid, the Save button is disabled. Fix the reported error and the button re-enables automatically. The error message text comes directly from the Handlebars parser.

---

## Appendix: Common Handlebars Parser Error Tokens
Parser errors follow a standard format:
===MOVE THIS TO ITS OWN PAGE IN [[Debug and Error Handling]] and reference it above. Please also reference it from [[Handlebars Support]] at an appropriate page in that section. Finally, can you file a bug for when the Error modal dialog box appears (e.g. one did for me during a quick command - see comment below), for it to show a link to the doc page?===

```
Parse error on line N:
...<excerpt of your content>
-----------^
Expecting '<TOKEN>', got '<TOKEN>'
```

The token names in these messages refer to specific Handlebars syntax constructs. The table below decodes the most common ones:

| Token | Handlebars Syntax | Likely Cause |
|-------|-------------------|-------------|
| `CLOSE` | `}}` | Unclosed `{{expression` — missing closing `}}` |
| `CLOSE_UNESCAPED` | `}}}` | Unclosed `{{{expression` — missing closing `}}}` |
| `CLOSE_RAW_BLOCK` | `}}}}` | Unclosed `{{{{rawblock}}}}` — missing closing `}}}}` |
| `OPEN_UNESCAPED` | `{{{` | Parser expected something else but found the start of a triple-stash expression |
| `OPEN_BLOCK` | `{{#` | Parser expected something else but found a block helper opening (e.g., `{{#if}}`) |
| `OPEN_ENDBLOCK` | `{{/name}}` | Opened a `{{#block}}` but never closed it with `{{/block}}` |
| `OPEN_INVERSE` | `{{^}}` / `{{else}}` | An else/inverse branch appeared in an unexpected position |
| `OPEN_PARTIAL` | `{{>` | A partial (block template) invocation appeared where not expected |
| `OPEN_RAW_BLOCK` | `{{{{` | Parser expected something else but found the start of a raw block |
| `OPEN_SEXPR` | `(` | A subexpression started but context doesn't allow it |
| `CLOSE_SEXPR` | `)` | A subexpression was left unclosed — missing closing `)` |
| `STRING` | `"..."` | A string argument is malformed or its closing quote is missing |
| `DATA` | `@variable` | A data variable (e.g., `@index`) was used in an invalid position |
| `EQUALS` | `=` | A named hash parameter (`key=value`) was malformed or in the wrong position |
| `ID` | identifier | Incomplete expression such as `{{}}` or `{{#}}` |
| `EOF` | end of file | An expression or block was left open at the end of content |
| `INVALID` | n/a | An unrecognized character appeared inside an expression |

===ENOENT I got this during a quick command trying to create a new file with a template that did not exist. Can you add this code here?==



> [!DANGER] NOTES
> - The settings UI description says the global block applies "across all vaults." This is inaccurate – the setting is stored in `data.json` inside the plugin folder, which is per-vault. The phrase "all vaults" is misleading and should be corrected in the UI copy. See GitHub Issue #[156](https://github.com/z2k-studios/z2k-plugin-templates/issues/156).
> - The priority chain `built-in < global < system < block < main` was verified directly in the engine source (`main.ts`, line 1052, with a confirming comment at line 556). The documentation is accurate.
