---
title: fieldOutput Helper
sidebar_position: 10
sidebar_label: "{{fieldOutput}}"
sidebar_class_name: z2k-code
doc_state: initial_ai_draft
aliases:
- fieldOutput Helper Function
- fieldOutput
- fieldOutput Helper
---
# fieldOutput
The `{{fieldOutput}}` built in helper function behaves identically to the [[fieldInfo Helper]] except that it will output the final value of the field inside the resultant file. Thus, 

```md
Title:: {{fieldOutput BookTitle prompt="What is the title of the Book?"}}
```

is equivalent to: 

```md
{{fieldInfo BookTitle prompt="What is the title of the Book?"}}
Title:: {{BookTitle}}
```


## Syntax and Semantics
The `{{fieldOutput}}` built‑in mirrors `{{fieldInfo}}`’s argument structure exactly. The difference is that it  **emits** the field’s resolved value at render time. This is useful when you want to both declare prompting metadata and later place the finalized value inline without repeating logic. 

## When To Use

> [!TIP] When to use `{{fieldOutput}}`
> If you have a template that references only a few fields, and each of them only once, then it is oftentimes best just use the `{{fieldOutput}}` helper to insert the prompting information inline with where the value will be used within the template.
