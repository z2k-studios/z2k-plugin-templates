---
title: field-output Helper
sidebar_position: 10
sidebar_label: "{{field-output}}"
sidebar_class_name: z2k-code
doc_state: initial_ai_draft
aliases:
- field-output Helper Function
- field-output
- field-output Helper
---
# field-output
The `{{field-output}}` built in helper function behaves identically to the [[field-info Helper]] except that it will output the final value of the field inside the resultant file. Thus, 

```md
Title:: {{field-output BookTitle prompt="What is the title of the Book?"}}
```

is equivalent to: 

```md
{{field-info BookTitle prompt="What is the title of the Book?"}}
Title:: {{BookTitle}}
```


## Syntax and Semantics
The `{{field-output}}` built‑in mirrors `{{field-info}}`’s argument structure exactly. The difference is that it  **emits** the field’s resolved value at render time. This is useful when you want to both declare prompting metadata and later place the finalized value inline without repeating logic. 

## When To Use

> [!TIP] When to use `{{field-output}}`
> If you have a template that references only a few fields, and each of them only once, then it is oftentimes best just use the `{{field-output}}` helper to insert the prompting information inline with where the value will be used within the template.
