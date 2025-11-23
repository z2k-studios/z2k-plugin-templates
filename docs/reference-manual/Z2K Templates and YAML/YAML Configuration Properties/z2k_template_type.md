---
sidebar_position: 5
sidebar_class_name: z2k-code
doc_state: revised_ai_draft_1
---

# z2k_template_type
The `z2k_template_type` field is a [[YAML Configuration Properties|Z2K Templates YAML Configuration Property]] that tells Z2K Templates how to treat a given file: as a normal content note, a full document template, or a reusable block template. These directly correspond to the different [[Types of Template Files|Template Types]]. 

This property works together with [[Template File Extensions]] but does not depend on it – you can use it even if you never change file extensions.

## Valid Settings
The following values are supported by `z2k_template_type`:

| Key Value           | Meaning                                                              |
| ------------------- | -------------------------------------------------------------------- |
| `content-file`      | This file is not a template; treat it as a normal note               |
| `document-template` | This file is a whole-file (document) template                        |
| `block-template`    | This file is a block-level template (i.e. a "partial" in Handlebars) |

The property is the primary source to authoritatively declare the [[Types of Template Files|Template Type]] (see link for more details).
- `content-file` – “This is data I care about reading and updating. Don't treat it as a template.”
- `document-template` – “This defines the structure for creating new notes.”
- `block-template` – “This is a reusable snippet that plugs into other templates.”

## Notices

> [!WARNING] Let Z2K Templates Do The Work
> We recommend that you use the [[Command Palette#Template Conversion Commands|Template Conversion Commands]] to facilitate updating this property instead of attempting to modify it yourself. 

> [!NOTE] May Need to Move the File
> If you change the `z2k_template_type` property, you will likely need to move the file in or out  of a [[Template Folders|Template Folder]] as a result.


> [!NOTE] z2k_template_type rules
> If you ever need to debug why a file is treated as a template or not, `z2k_template_type` is the first place to look.



## value -- content-file
A `content-file` is an ordinary note – a card, journal entry, project file, or any other piece of content you want to read and maintain.

Use `content-file` when:
- The file should not be used by Z2K Templates as a template.
- You want the file to behave like a normal note in Obsidian and related tools.
- The file previously was a template, but you have retired it and want to keep it as a record.
- You use the [[Convert to Content File]] command on a template (it will set this property for you)

Example:

```yaml
---
title: "Alice Johnson"
z2k_template_type: content-file
tags:
  - people
---
# Alice Johnson

Summary of today’s meeting…
```

In many cases you can omit `z2k_template_type` completely and let `content-file` be the implicit default. Use the explicit value when you want to be crystal-clear that a file is *not* part of the template layer.

## value -- document-template
A `document-template` is a whole-file [[Template Files|Template File]] used to create new notes. It typically contains fields such as `{{Name}}`, `{{Date}}`, or `{{Summary}}` and is often stored in a template folder.

Use `document-template` when:
- The file defines the full structure of a card or note type.
- You will use it with commands that create new notes from templates.
- You want a single canonical layout for entities such as people, projects, meetings, or tasks.

Example:

```yaml
---
title: "Person – Base Template"
z2k_template_type: document-template
---
# {{Name}}

summary: "{{Summary}}"

{{#if Notes}}
## Notes
{{Notes}}
{{/if}}
```

Document templates work well in combination with:
- [[Template Folders]] – to keep them logically separated.
- `.template` extensions – see [[Template File Extensions]] and [[File Extension Process Guide]].


## value -- block-template
A `block-template` is a smaller, reusable piece of structure that can be pulled into other templates or notes. It does not define a full document; instead, it captures a section or pattern you want to apply repeatedly. See [[Block Templates]] for more details.

Use `block-template` when:
- You plan to embed or reference this file from other templates.
- You have a checklist, heading section, or repeated layout that appears in many templates.
- You want a single source of truth for that structure.

Example:

```yaml
---
title: "Person – Contact Info Block"
z2k_template_type: block-template
---
## Contact Info

- Email: {{Email}}
- Phone: {{Phone}}
- City: {{City}}
```

This file is best stored as a `.block` file if you have [[Use Template File Extensions|Enabled the use of Template File Extensions]].

See [[Convert to Block Template]] for the command that assigns this type and (optionally) renames the file.

