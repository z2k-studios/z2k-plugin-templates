---
sidebar_position: 10
doc_state: initial_ai_draft
title: field-info fieldName Parameter
sidebar_label: fieldName
aliases:
- fieldName
- field-info fieldName Parameter
---
# field-info fieldName Parameters

The required `fieldname` parameters specifies the field for which you are providing prompting information.


**Examples:**
```md title="Template File.md"
  {{field-info myPositionalField}}
  {{field-info fieldName=myNamedField}}
```


**Details:**
- The `fieldName` must be **unquoted** - both when passed positionally and when passed as a named parameter.
- `fieldName` is always the first parameter, and as such, is rarely used with a [[field-info Syntax#Named Parameters|Named Parameter]] syntax.
- A fieldName is always required for `{{field-info}}` or any of its [[field-info Variations]].



---


required
fields cannot have spaces
see the naming conventions
