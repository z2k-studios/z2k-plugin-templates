---
sidebar_position: 80
doc_state: initial_ai_draft
title: field-info value Parameter
sidebar_label: value
aliases:
- value
- field-info value Parameter
---


# field-info value
The optional `value` parameter in the [[field-info Helper]] allows you to set a value to a field within the template code. This essentially bypasses the prompting of the user for this field. 

This is an advanced feature that is particularly useful for `{{fields}}` in [[Hierarchical Template Folders]] or with [[Custom Helper Functions]].

## Syntax
The `value` parameter must be prefaced with the `value=` keyword assignment, i.e. it is a [[field-info Syntax#Named Parameters|Named Parameter]]. For example:

```md title="Sample value parameter"
{{field-info TOE type="number" value=42 directives=['no-prompt']}}
{{field-info TOE_Author type="text" value="Douglas Adams"}}
```

## Accepted Values
The `value` value accepts quoted strings, unquoted numbers, and boolean keywords (`true` and `false`).  They will not accept `[` list`]` arrays or date/datetimes (which should be provided has just strings). 

## Default value Value
If omitted, the default `value` (ahem) value is an empty string.

## Embedded Fields
Please note that the `value` parameter could allow `{{fields}}` in it - but this has not been tested. Let us know how it goes!

## Why Use the Value Parameter?
At first glance, it seems pretty ridiculous to be able to specify a value for a field inside a template field. If you know the value, then why not just use it instead of making it a field?

Most of the scenarios are fairly advanced templates work, but they do lead to some interesting applications. Here are some class of examples:

### Example: Controlling Output Based on Another Field
Consider this template


==todo==

readability - assign a complicated expresion to a fieldname and then just reference that field name thereafter.

if statements


Use with hierarchical systems, where the value of a field is based in the context of where the card was created. Then the system blocks in those locations can define values for fields that global templates can pick up. 