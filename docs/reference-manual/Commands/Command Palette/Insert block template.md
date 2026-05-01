---
sidebar_position: 50
sidebar_class_name: z2k-code
aliases:
- insert block template
---
# Insert Block Template
Inserts a [[Block Templates|block template]] at the current cursor position. Block templates are reusable content fragments – checklists, sections, boilerplate – that you can drop into any file.

## Availability
Available in the Command Palette when:
- The **active file is a markdown file** (`.md`)
- **No text is selected** in the editor

If text is selected, use [[Insert Block Template Using Selected Text]] instead.

## What It Does
When you run this command:

1. **Select a block template** – A modal shows available [[Block Templates|block templates]] for your current context
2. **Fill in fields** – If the block template has [[Template Fields]], you're prompted for values
3. **Content is inserted** – The block template content appears at your cursor position

## Which Block Templates Appear?
Block templates follow the same [[Template Discovery]] rules as document templates:

- It uses the current file's folder to establish the [[Destination Context]]. Therefore, only block templates in [[Template Folders]] along the path from your current file to the [[Templates Root Folder]] will appear in the file picker.
- This means you see contextually relevant blocks, not every block template in your vault

For example, if you're editing a file in `Projects/Website Redesign/`, you'll see block templates from:
- `Projects/Website Redesign/.templates/`
- `Projects/.templates/`
- The root templates folder

## Example Usage
You have a block template called "Status Update" containing:

```handlebars
## Status Update – {{date}}
**Progress:** {{progress}}
**Blockers:** {{blockers}}
**Next Steps:** {{nextSteps}}
```

1. Open any project file and place your cursor where you want the status section
2. Run **Insert Block Template**
3. Select "Status Update"
4. Fill in the prompted fields
5. The completed status section appears at your cursor

## Tips
- Block templates are great for repeating structures you use across many files
- Keep block templates focused – one section or component per template
- Use `{{fieldInfo}}` in block templates to customize prompts for each field
- Use [[Storing Field Values in YAML|YAML Field Storage]] techniques to re-use document-level fields inside the inserted blocks - see the [[Storing Field Values in YAML#Example Book Quotes with Block Templates]]
- For text-selected insertion, see [[Insert Block Template Using Selected Text]]
- To automatically insert blocks in your document templates, use the handlebars [[Partials|block syntax]] (see also [[How Do You Use Block Templates]]).

## Related Commands
- [[Insert Block Template Using Selected Text]] – Same but passes selection to the block
- [[Create New File]] – For creating entire files from templates
- [[Convert to Block Template]] – To turn existing content into a reusable block



> [!DANGER] INTERNAL NOTES
> - Confirm whether inserting at a selection (when text IS selected) is prevented or handled differently
