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
The optional `opts` parameter in the [[field-info Helper]] specifies a list (enclosed in `[`brackets`]`) of strings that can be selected by a field that has a [[field-info type|type]] of either `singleSelect` or `multiSelect`. 

If the corresponding field has a type of something other than `singleSelect` or `multiSelect`, the `opts` parameter will be ignored. 

## Syntax
The `opts` parameter must be prefaced with the `opts=` keyword assignment, i.e. it is a [[field-info Syntax#Named Parameters|Named Parameter]]. For example:

```md title="Sample opts parameter"
{{field-info BestPet prompt="What makes for the best pet?" type="singleSelect" opts=['Dogs', 'Cats', 'Iguanas']}}
```


## Accepted Values
The `opts` value accepts a `[` list`]` array of strings separated by commas. These strings can either use single (`'`) or double (`"`) quotes. The list must be contained within the list `[`brackets`]`.

**Notes:**
- You could conceivable supply number or boolean constants in your strings, but this is has not been thoroughly tested at this time. For `date` and `datetime` values, you will need to use strings.  

## Default default Value
If omitted, the default `opts` value is an empty list (`[` `]`). But that would be senseless, so it is best to always use the `opts` parameter when using `singleSelect` or `multiSelect` parameter types. 


## Embedded Fields
Please note that the `opts` parameter allows you to use `{{fields}}` inside it, thereby simplifying repetitive data entry and minimizing duplication errors. You can't go crazy with complex field entries (e.g. inserting a [[Block Templates|Block Template]] into a default value) - please see the article on [[Restricted Functionality Mode]] for an idea of what you can do. But you can do most everything else, including most helper functions.
