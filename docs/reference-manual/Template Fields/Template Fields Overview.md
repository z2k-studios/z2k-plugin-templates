---
sidebar_position: 10
aliases:
- Template Field
- Template Fields
---
# Template Fields Overview
Template Fields (or just "fields") are used inside [[Template Files]] as embedded placeholders for information that is to be added into the template. Template fields are denoted using curly braces, e.g. `{{field}}` where `field` is the name of some unit of information to be filled either by a user or some external program.


> [!NOTE] Note: Nomenclature
> Obsidian uses the term "*[template variables](https://help.obsidian.md/Plugins/Templates)*" for what the Z2K Templates plugin calls "*Template Fields*". Beyond the expanded set of features provided by this plugin, they are conceptually the same.
> 
> Handlebars uses the term "*[expressions](https://handlebarsjs.com/guide/expressions.html)*" for what we call Template Fields. 

## Basic Structure of a Template Field
These placeholders are designated through the use of curly braces (aka handlebars), such as `{{fieldname}}`. The fieldname will specify the name of the field (i.e. a word description of the the type of information to be provided). 

For instance, consider an information card template to be used to collect quotes and ideas from a book. In the Overview section of the card template, you can imagine a section that includes:

```
- Title:: {{BookTitle}}
- Author:: {{Author}}
```

With these fields specified, Z2K will prompt the user for these fields when creating a new card with this template. These will then be filled in the new card with the data provided by the user, replacing the field name (e.g. `{{BookTitle}}`) with the actual Book Title provided by the user. 

## Dot Notation
You can also nest fields using dot notation for structured data:

```md title="Partial Template - Person.md"
{{person.firstname}} {{person.lastname}}
```

This allows referencing subfields in JSON or YAML inputs — useful when working with external packages or [[URI and JSON Support|imported data sources]].

