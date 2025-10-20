---
sidebar_position: 10
doc_state: initial_ai_draft
title: field-info fieldName Parameter
sidebar_label: fieldName
aliases:
- fieldName
- field-info fieldName Parameter
---

### fieldName
  The required fieldname parameters specifies the field for which you are providing prompting information. Must be **unquoted** when passed positionally, or as a named bare path (e.g., `fieldName=title`).

  Examples:
```md title="Template File.md"
  {{field-info myField}}
  {{field-info fieldName="myField"}}
```

---


required
fields cannot have spaces
see the naming conventions
