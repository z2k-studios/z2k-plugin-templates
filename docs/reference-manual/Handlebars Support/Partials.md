---
aliases:
- Partial
- partials
- partial
---
lock templates can also be inserted by using Handlebars [[Partials]] syntax:

```handlebars
{{> block-template-name}}
```

For example, this project template preloads three task blocks:

```handlebars
# Project: {{projectName}}

## Tasks
{{> task-block}}
{{> task-block}}
{{> task-block}}
```

### Path Resolution
When referencing block templates, use the name (with optional path) of the block template:

```handlebars
{{> my-block}}
{{> subfolder/my-block}}
```

==paths are relative to the templates folder==

If multiple block templates share the same name, the plugin selects based on proximity to the calling template:

1. Same folder
2. Parent folder
3. Grandparent folder
4. *(continuing up the tree)*
5. Root folder
6. Child folder
7. Grandchild folder
8. *(continuing down the tree)*
9. Sibling/cousin folders (undefined order)

### Path Shortcuts

When using embedded templates, the `Templates` folder name can optionally be omitted from the path. For example:

| Full Path | Shortcut |
| --------- | -------- |
| `folderA/Templates/partial` | `folderA/partial` |

If this creates ambiguity, use the full path including the `Templates` folder name.

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

## Dynamic Block Selection

You can dynamically select which block template to include using helper functions:

```handlebars
{{> (random "BlockA.md" "BlockB.md")}}
```

This allows for randomized or conditional block inclusion.

## Limitations

- Relative paths like `../partial` are not currently supported
- Block templates must be properly identified (see [[Block Template Requirements]])

## See Also

- [[What is a Block Template]] for fundamentals
- [[How Do You Use Block Templates]]
- [[Block Template Requirements]] for identification rules
- [[Block Template File Structure]] for file organization



---

==incorporate==

`{{> "Block - Task"}}` - works  
`{{> "Block - Task.md"}}` - works  
`{{> "./Block - Task.md"}}` - Relative paths not supported yet  
`{{> "/Block - Task.md"}}` - Absolute paths are relative to the templates root (defined in the settings)  
I created an issue for the relative paths ([https://github.com/z2k-studios/z2k-plugin-templates/issues/117](https://github.com/z2k-studios/z2k-plugin-templates/issues/117))  
How do you think the relative paths should work? My vote would be relative to the template.  

Emerson Peters

,

12:13 PM

, Edited

  

I think this would be good:  

- `Block.md` → name lookup (hierarchical)  
    
- `Subfolder/Block.md` → scoped name lookup (path suffix match) (hierarchical)  
    
- `./Subfolder/Block.md` → relative path from current file (the template)  
    
- `/Subfolder/Block.md` → absolute from templates root  
    

All can be with or without the extension (.md, .block).  
(If there's a collision (both .md and .block exist), it prioritizes .block, then .template, then .md)
