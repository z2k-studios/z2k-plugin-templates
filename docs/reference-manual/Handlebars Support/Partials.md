---
sidebar_position: 100
aliases:
- Partial
- partials
- partial
---
# Partials
In Handlebars, partials are reusable template fragments included with `{{> partialName}}`. In Z2K Templates, partials map to [[Block Templates]] – when you write `{{> my-block}}`, the plugin finds and inserts the corresponding block template. For Handlebars partial syntax basics, see the [Handlebars Partials documentation](https://handlebarsjs.com/guide/partials.html).


> [!NOTE] Please see Block Templates for details
> Please see [[Block Templates]] for more detail on how Z2K Templates implements block templates and how to use them. This page is intended for Handlebars experts to explain how Handlebars partials behave differently in Z2K Templates. 

## Contents
- [[#Basic Syntax]]
- [[#Path Resolution]]
- [[#Path Formats]]
- [[#Path Shortcuts]]
- [[#Resolution Examples]]
- [[#Partial Parameters]]
- [[#Wikilink Syntax]]
- [[#Limitations]]

## Basic Syntax
Include a block template using the partial syntax:

```handlebars
{{> block-template-name}}
```

The name can be specified with or without the file extension (`.md`, `.block`):

```handlebars
{{> "Block - Task"}}
{{> "Block - Task.md"}}
```

Both forms work. If a collision exists between files with different extensions (e.g., both `.md` and `.block`), the priority order is: `.block` → `.template` → `.md`.

## Path Resolution
Z2K Templates exists in the larger space of Obsidian's approach to building your own wikilinked vault of files. In this style, determining the directory path to a file is considered to be the responsibility of the system, not the doc writer.

Thus Z2K Templates makes a best effort at located a block within the vault automatically, similar to wikilinking without specifying a path.

When multiple block templates share the same name, Z2K Templates selects the block template based on proximity to the calling template. The resolution order searches outward from the calling template's location:

1. Same folder
2. Parent folder
3. Grandparent folder
4. *(continuing up the tree)*
5. Root folder
6. Child folder
7. Grandchild folder
8. *(continuing down the tree)*
9. Sibling/cousin folders (undefined order)

## Path Formats
Z2K Templates supports several path formats for referencing block templates:

| Format | Behavior |
|--------|----------|
| `block-name` | Name lookup using hierarchical resolution |
| `subfolder/block-name` | Scoped name lookup (path suffix match), hierarchical |
| `/subfolder/block-name` | Absolute path from the templates root (defined in [[Settings Page|settings]]) |

> [!NOTE]
> Relative paths like `./subfolder/block-name` and `../block-name` are not currently supported.

## Path Shortcuts
When using [[Template Folders]] (the default mode), the `Templates` folder name can be omitted from the path:

| Full Path                   | Shortcut          |
| --------------------------- | ----------------- |
| `folderA/Templates/partial` | `folderA/partial` |

If omitting `Templates` creates ambiguity, use the full path.

## Resolution Examples

### External Templates
If you're using a template at:

```
/External Templates/folderA/template
```

The resolution order for `{{> partial}}` is:
1. `/External Templates/folderA/partial`
2. `/External Templates/partial`
3. `/External Templates/folderA/folderB/partial`
4. `/External Templates/folderC/partial`

### Embedded Templates
If you're using a template at:

```
/z2k/folderA/Templates/template
```

The resolution order for `{{> partial}}` is:
1. `/z2k/folderA/Templates/partial`
2. `/z2k/folderA/Templates/folderD/partial`
3. `/z2k/Templates/partial`
4. `/z2k/Templates/folderE/partial`
5. `/z2k/folderA/folderB/Templates/partial`
6. `/z2k/folderC/Templates/partial`

## Partial Parameters
You can pass parameters to a partial using hash syntax:

```handlebars
{{> task-block priority="high" assignee=projectLead}}
```

Inside the block template, these parameters are accessible as fields:

```handlebars
- [ ] {{taskName}} (Priority: {{priority}}, Assigned to: {{assignee}})
```

## Wikilink Syntax
Z2K Templates also accepts Obsidian-style wikilinks in block names:

```handlebars
{{> [[block-template-name]]}}
```

The double brackets are stripped before resolution. This can be useful for maintaining consistent linking conventions in your vault.

## Limitations
- **No dynamic block names** – expressions like `{{> (helperName)}}` that compute the block name at render time are not supported and will produce an error. We sure would love to implement this one day, so cast a vote for it in our community pages.
- **No relative paths** – `../partial` and `./partial` syntax is not yet supported
- **No inline partials** – Handlebars' `{{#* inline "name"}}` syntax is untested. See the [[Handlebars and Z2K Templates#Untested Handlebars Features|untested features list]].
- Block templates must be properly identified – see [[Block Templates]] for requirements

## See Also
- [[Block Templates]] for fundamentals on block template files
- [[Block Helpers]] for custom block-level helpers
- [[Iterators]] for considerations when using blocks inside `{{#each}}` loops


> [!DANGER] INTERNAL NOTES
> - The existing chicken scratch notes mentioned `{{> (random "BlockA.md" "BlockB.md")}}` as working for dynamic block selection. However, the source code at line 1073 of `z2k-template-engine/src/main.ts` explicitly throws an error for SubExpression-based block names: "Dynamic block names are not supported." This is a **discrepancy** – either the code changed after the notes were written, or the notes were aspirational. Verify which is correct.
> - The resolution order described here comes from the chicken scratch notes. Verify against the actual block resolution logic in `z2k-plugin-templates/main.tsx` (the `getBlockCallback` function).
> - Partial parameters are passed through to Handlebars and should work, but the interaction with Z2K Templates' fieldInfo system (do parameters override fieldInfo declarations in the block?) needs verification.
> - The wikilink syntax support (`{{> [[name]]}}`) is confirmed in source at line 1077-1078.
> - Related GitHub issue for relative path support: [#117](https://github.com/z2k-studios/z2k-plugin-templates/issues/117)
> - Are relative paths still not supported ? (mentioned above)
