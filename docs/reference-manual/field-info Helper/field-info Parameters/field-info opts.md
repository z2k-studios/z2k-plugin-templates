---
sidebar_position: 50
doc_state: initial_ai_draft
title: field-info opts Parameter
sidebar_label: opts
aliases:
- opts
- field-info opts Parameter
---

# field-info opts
The optional `opts` parameter in the [[reference-manual/field-info Helper/field-info Helper]] specifies a list of values that can be selected by a field that has a [[field-info type|type]] of either `singleSelect` or `multiSelect`. 

If the corresponding field has a type of something other than `singleSelect` or `multiSelect`, the `opts` parameter will be ignored. 

## Syntax
The `opts` parameter must be prefaced with the `opts=` keyword assignment, i.e. it is a [[field-info Syntax#Named Parameters|Named Parameter]]. For example:

```md title="Sample opts parameter"
{{field-info BestPet prompt="What makes for the best pet?" type="singleSelect" opts="Dogs, Cats, Iguanas"}}
```


## Accepted Values
The `opts` value accepts a string contain a comma separated list of strings. 

**Notes:**
- You are not allowed to use a comma in the list of selection options (a future release plans to address this)
- Each string entry is stripped of 
- If you wish to use a string entry with a double quote (`"`), then you can enclose the opts list with single quotes (`'`) instead. 

## Default default Value
If omitted, the default `opts` value is an empty list. But that would be senseless, so you should always use the `opts` parameter when using `singleSelect` or `multiSelect` parameter types. 

## Embedded Fields
Please note that the `opts` parameter allows you to use `{{fields}}` inside it, thereby simplifying repetitive data entry and minimizing duplication errors. You can't go crazy with complex field entries (e.g. inserting a [[Block Templates|Block Template]] into a default value) - please see the article on [[Restricted Functionality Mode]] for an idea of what you can do. But you can do most everything else, including most helper functions.
