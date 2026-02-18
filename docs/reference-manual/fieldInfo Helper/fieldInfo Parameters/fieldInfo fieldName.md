---
sidebar_position: 10
doc_state: initial_ai_draft
title: fieldInfo fieldName Parameter
sidebar_label: fieldName
aliases:
- fieldName
- fieldInfo fieldName Parameter
---
# fieldInfo fieldName Parameters

The required `fieldname` parameters specifies the field for which you are providing prompting information.


**Examples:**
```md title="Template File.md"
  {{fieldInfo myPositionalField}}
  {{fieldInfo fieldName=myNamedField}}
```


**Details:**
- The `fieldName` must be **unquoted** - both when passed positionally and when passed as a named parameter.
- `fieldName` is always the first parameter, and as such, is rarely used with a [[fieldInfo Syntax#Named Parameters|Named Parameter]] syntax.
- A fieldName is always required for `{{fieldInfo}}` or any of its [[fieldInfo Variations]].



---


required
fields cannot have spaces
see the naming conventions
