---
sidebar_position: 25
aliases:
- Storing Fields in YAML
- Persisting Field Values
- YAML Field Storage
---
# Storing Field Values in YAML
When a template is [[Instantiation|instantiated]], field values are resolved and inserted into the document body – but by default, those values exist only as rendered text. The original field names and their associations are gone. If you later insert a [[Block Templates|block template]] that references one of those fields, the block has no way to know what field names were used during instantiation or finalization, nor even where they were used in the current file. 

YAML frontmatter solves this. By echoing field values into identically named YAML properties, you create a persistent data layer that survives finalization and remains available to block templates inserted afterward.

## Contents
- [[#The Pattern]]
- [[#Next - Insert a Block Template]]
- [[#Example Book Quotes with Block Templates]]
- [[#Example: Template Upgrade]]
- [[#Best Practices]]

## The Pattern
The technique is straightforward: in your template's YAML frontmatter, mirror each field you want to preserve as a YAML property with the same name.

```yaml
---
BookTitle: "{{BookTitle}}"
BookAuthor: "{{BookAuthor}}"
Genre: "{{Genre}}"
z2k_template_type: document-template
---
# {{BookTitle}}
**Author:** {{BookAuthor}}
**Genre:** {{Genre}}
```

Recursion you say? The above example may look awkward knowing that YAML Properties themselves are fields, and this you are presenting an endless loop. Luckily, the Templates Plugin is smart enough to recognize this situation and will not enter an endless loop. 

When the user provides values during instantiation, both the YAML and the body resolve simultaneously. After finalization, the file looks like:

```yaml
---
BookTitle: "Neuromancer"
BookAuthor: "William Gibson"
Genre: "Science Fiction"
z2k_template_type: finalized-content-file
---
# Neuromancer
**Author:** William Gibson
**Genre:** Science Fiction
```

The field values are now stored as standard YAML properties – visible in Obsidian's Properties panel, queryable by Dataview, and available to any block template inserted later.

## Next - Insert a Block Template
When a block template is inserted into an existing file, the plugin collects YAML frontmatter from the file and makes all properties available as field values (see [[Using YAML Metadata as Fields]]). Because the YAML property names match the field names the block template expects, the block's `{{field}}` expressions resolve automatically – no prompting needed.

This works because of two mechanisms acting together:
- **YAML properties become field values** – the plugin reads the existing file's YAML and injects each property into the list of known Handlebars fields.
- **Matching names unify** – a YAML property named `BookAuthor` and a template field named `{{BookAuthor}}` are treated as the same field. The YAML value fills the field.

## Example: Book Quotes with Block Templates
Consider a book template that stores field values in YAML as [[#The Pattern|shown above]]. After creating a file for the book "Neuromancer," you later want to insert a quote block inside the content file:

```handlebars file="Block Template - Book Quote.md"
---
z2k_template_type: block-template
---
> {{Quote}}
> — {{BookAuthor}}, *{{BookTitle}}*
```

When you insert this block into the Neuromancer note:
- `{{BookAuthor}}` resolves to "William Gibson" from the file's YAML
- `{{BookTitle}}` resolves to "Neuromancer" from the file's YAML
- `{{Quote}}` has no YAML value, so the user is prompted for it

The result:

```md
> The sky above the port was the color of television, tuned to a dead channel.
> — William Gibson, *Neuromancer*
```

The block template pulled two of its three fields from stored YAML, and only prompted for the one value it didn't already have.

## Example: Template Upgrade
Another example of how storing your field values in YAML code becomes apparent when you attempt to "upgrade" a content file using a newer version of the template. If you automatically store your field values in the YAML section by having the source template explicitly save then, then you can use the ==NEEDS FIXING== [[Transform This File Using a Template]] command. When the new version of the template is used, the save copies of the fields' text values will be inserted directly in the new file. 

## Best Practices
- **Quote your YAML field expressions** – use `BookTitle: "{{BookTitle}}"` rather than `BookTitle: {{BookTitle}}` to avoid [[Using Fields Inside YAML Metadata#Quoting and Type Safety|type coercion and special character issues]].
- **Use identical names** – the YAML property name must exactly match the field name used in block templates. Above, `BookAuthor` in YAML matches `{{BookAuthor}}` in the block; `book_author` would not.
- **Store only what you'll reuse** – there's no need to mirror every field into YAML. Focus on values that block templates or queries will need later.
- **Combine with Dataview** – since the stored values are standard YAML properties, they're also available to Dataview and Bases queries, giving you the best of both worlds: template-powered creation and query-powered retrieval.

> [!DANGER] Notes
> - This pattern relies on `addYamlFieldValues()` being called during block insertion with the existing file's YAML (plugin line 1984). Verify that this code path is stable and intentional.
> - When a YAML property and a fieldInfo `value` parameter both exist for the same field, the fieldInfo `value` wins (plugin line 2930). This means a block template that declares `{{fieldInfo "BookAuthor" value="Override"}}` would override the stored YAML value.
> - If the stored YAML value is not a string (e.g., a number or boolean from unquoted YAML), verify how Handlebars renders it in the block template body.
> - This feature is by design but has not been extensively tested. The name collision between YAML properties and template fields is resolved by treating them as the same field – verify this holds for edge cases like nested objects or array values.
