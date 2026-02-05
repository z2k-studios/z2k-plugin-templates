---
sidebar_position: 50
sidebar_class_name: z2k-code
aliases:
- z2k_template_author
---
# z2k_template_author
This [[YAML Configuration Properties|Z2K Templates YAML Configuration Property]] assigns an author attribution to a template file. This is useful when sharing templates with others – you can include your name, a link to your website, or a copyright notice.

## Purpose
The template author property is used in multiple ways:
- It can be used strictly as an informative assertion of authorship by the template writer. In this way it can include a (c) assertion, for example (the legality of which is not a topic for this doc page, haha).
- It can be used as a data source that can be tested against. For instance, because `z2k_template_author` feeds data into the `{{templateAuthor}}` built-in Field, you can make conditional text display based on the author name of the template when inserting a block.

## Built-In Field Linkage
This value is used whenever the `{{templateAuthor}}` [[Built-In Fields|Built-In Field]] appears in the template. See [[Built-In Fields - Template Data#templateAuthor|templateAuthor]] for more details.

## Valid Settings
The value must be a string. The plugin will throw an error if it encounters a non-string type.

| Value Type | Result                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------- |
| string     | Specifies the author of the template. Surfaces via the `{{templateAuthor}}` built-in field. |


## Example
This assigns an author attribution to a template:
```yaml
---
z2k_template_author: "This template was designed by Z2K Studios, (c) 2026"
---
```

Any reference to `{{templateAuthor}}` in the template or its instantiated content file will resolve to this string.

## Lifecycle Behavior
| Lifecycle Event                   | Effect on `z2k_template_author`                                |
| --------------------------------- | -------------------------------------------------------------- |
| [[Instantiation]]                 | YAML Property is kept – carries over to the content file       |
| [[Finalization]]                  | YAML Property is kept – persists in the finalized content file |
| [[Block Templates\|Block Insert]] | Not affected                                                   |
This property persists through the full lifecycle as a permanent record of who authored the template used to create content files. 